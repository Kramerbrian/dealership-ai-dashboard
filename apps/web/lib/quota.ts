import { db } from '@/db';
import { sql } from 'drizzle-orm';

export interface QuotaConfig {
  tier: 'ignition' | 'momentum' | 'hyperdrive';
  dailyRequests: number;
  dailyWrites: number;
  maxAllocationBudget: number;
  features: {
    csv_export: boolean;
    wide_uci: boolean;
    video_jsonld: boolean;
  };
}

export const QUOTA_CONFIGS: Record<string, QuotaConfig> = {
  ignition: {
    tier: 'ignition',
    dailyRequests: 1000,
    dailyWrites: 100,
    maxAllocationBudget: 50,
    features: {
      csv_export: false,
      wide_uci: false,
      video_jsonld: false,
    },
  },
  momentum: {
    tier: 'momentum',
    dailyRequests: 10000,
    dailyWrites: 1000,
    maxAllocationBudget: 500,
    features: {
      csv_export: true,
      wide_uci: true,
      video_jsonld: false,
    },
  },
  hyperdrive: {
    tier: 'hyperdrive',
    dailyRequests: 100000,
    dailyWrites: 10000,
    maxAllocationBudget: 5000,
    features: {
      csv_export: true,
      wide_uci: true,
      video_jsonld: true,
    },
  },
};

export interface QuotaUsage {
  requests: number;
  writes: number;
  allocationBudget: number;
  resetAt: Date;
}

/**
 * Get tenant quota configuration
 */
export async function getTenantQuota(tenantId: string): Promise<QuotaConfig> {
  // In production, fetch from database
  // For now, return momentum as default
  return QUOTA_CONFIGS.momentum;
}

/**
 * Check quota usage for tenant
 */
export async function getQuotaUsage(tenantId: string): Promise<QuotaUsage> {
  const today = new Date().toISOString().split('T')[0];
  
  const result = await db.execute(sql`
    SELECT 
      COUNT(*) FILTER (WHERE created_at::date = ${today}) as requests,
      COUNT(*) FILTER (WHERE created_at::date = ${today} AND route LIKE '%/upsert' OR route LIKE '%/allocate') as writes
    FROM idempotency_events
    WHERE tenant_id = ${tenantId}
  `);
  
  const row = result.rows[0];
  const requests = Number(row?.requests || 0);
  const writes = Number(row?.writes || 0);
  
  // Calculate allocation budget (simplified)
  const allocationBudget = 0; // Would track actual allocation usage
  
  return {
    requests,
    writes,
    allocationBudget,
    resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  };
}

/**
 * Check if request is within quota limits
 */
export async function checkQuota(
  tenantId: string,
  operation: 'request' | 'write' | 'allocate',
  amount: number = 1
): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
  const quota = await getTenantQuota(tenantId);
  const usage = await getQuotaUsage(tenantId);
  
  switch (operation) {
    case 'request':
      if (usage.requests + amount > quota.dailyRequests) {
        return {
          allowed: false,
          retryAfter: Math.ceil((usage.resetAt.getTime() - Date.now()) / 1000),
          reason: 'Daily request quota exceeded',
        };
      }
      break;
      
    case 'write':
      if (usage.writes + amount > quota.dailyWrites) {
        return {
          allowed: false,
          retryAfter: Math.ceil((usage.resetAt.getTime() - Date.now()) / 1000),
          reason: 'Daily write quota exceeded',
        };
      }
      break;
      
    case 'allocate':
      if (usage.allocationBudget + amount > quota.maxAllocationBudget) {
        return {
          allowed: false,
          reason: 'Allocation budget exceeded',
        };
      }
      break;
  }
  
  return { allowed: true };
}

/**
 * Check feature flag
 */
export async function hasFeature(
  tenantId: string,
  feature: keyof QuotaConfig['features']
): Promise<boolean> {
  const quota = await getTenantQuota(tenantId);
  return quota.features[feature];
}
