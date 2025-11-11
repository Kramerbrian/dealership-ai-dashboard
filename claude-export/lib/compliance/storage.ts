/**
 * Storage Layer for Google Policy Compliance
 *
 * Handles:
 * - Policy version tracking (Redis for fast access)
 * - Audit results (PostgreSQL for persistence)
 * - Drift events (PostgreSQL for audit trail)
 */

import { Redis } from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import type { GooglePolicyVersion } from './google-pricing-policy';
import type { DishonestPricingResult } from './google-pricing-policy';

// ============================================================================
// REDIS CLIENT
// ============================================================================

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
    if (!redisUrl) {
      console.warn('[Storage] Redis URL not configured, using mock storage');
      // Return mock Redis client for development
      return {
        get: async () => null,
        set: async () => 'OK',
        setex: async () => 'OK',
        del: async () => 1,
      } as any;
    }

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false,
    });

    redisClient.on('error', (error) => {
      console.error('[Storage] Redis error:', error);
    });
  }

  return redisClient;
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Storage] Supabase credentials not configured - storage features disabled');
      return null;
    }

    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
      console.warn('[Storage] Supabase initialization failed:', error);
      return null;
    }
  }

  return supabaseClient;
}

// ============================================================================
// POLICY VERSION STORAGE
// ============================================================================

const POLICY_VERSION_KEY = 'google_policy:version';
const POLICY_VERSION_TTL = 7 * 24 * 60 * 60; // 7 days

/**
 * Get current policy version from Redis (with PostgreSQL fallback)
 */
export async function getCurrentPolicyVersion(): Promise<GooglePolicyVersion | null> {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(POLICY_VERSION_KEY);

    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to PostgreSQL
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('google_policy_versions')
      .select('*')
      .order('last_checked', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('[Storage] Failed to get policy version from DB:', error);
      return null;
    }

    if (data) {
      const version: GooglePolicyVersion = {
        version: data.version,
        lastUpdated: data.last_updated,
        changes: data.changes || [],
      };

      // Cache in Redis
      await redis.setex(POLICY_VERSION_KEY, POLICY_VERSION_TTL, JSON.stringify(version));

      return version;
    }

    return null;
  } catch (error) {
    console.error('[Storage] Failed to get current policy version:', error);
    return null;
  }
}

/**
 * Save policy version to Redis and PostgreSQL
 */
export async function savePolicyVersion(version: GooglePolicyVersion): Promise<void> {
  try {
    const redis = getRedisClient();
    const supabase = getSupabaseClient();

    // Save to PostgreSQL
    const { error } = await supabase
      .from('google_policy_versions')
      .upsert({
        version: version.version,
        last_updated: version.lastUpdated,
        last_checked: new Date().toISOString(),
        changes: version.changes,
      });

    if (error) {
      console.error('[Storage] Failed to save policy version to DB:', error);
      throw error;
    }

    // Cache in Redis
    await redis.setex(POLICY_VERSION_KEY, POLICY_VERSION_TTL, JSON.stringify(version));

    console.log('[Storage] Policy version saved:', version.version);
  } catch (error) {
    console.error('[Storage] Failed to save policy version:', error);
    throw error;
  }
}

// ============================================================================
// AUDIT RESULTS STORAGE
// ============================================================================

export interface SaveAuditInput {
  tenantId?: string;
  adUrl: string;
  lpUrl: string;
  vdpUrl: string;
  result: DishonestPricingResult;
  scanDurationMs?: number;
  rawData?: any;
}

/**
 * Save audit result to PostgreSQL
 */
export async function saveAuditResult(input: SaveAuditInput): Promise<number> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('google_policy_audits')
      .insert({
        tenant_id: input.tenantId,
        ad_url: input.adUrl,
        lp_url: input.lpUrl,
        vdp_url: input.vdpUrl,
        compliant: input.result.compliant,
        risk_score: input.result.riskScore,
        jaccard_score: input.result.breakdown.jaccard,
        price_mismatch: input.result.breakdown.priceMismatch,
        hidden_fees: input.result.breakdown.hiddenFees,
        disclosure_clarity: input.result.breakdown.disclosureClarity,
        consistency_penalty: input.result.atiImpact.consistencyPenalty,
        precision_penalty: input.result.atiImpact.precisionPenalty,
        violations: input.result.violations,
        raw_data: input.rawData,
        scan_duration_ms: input.scanDurationMs,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Storage] Failed to save audit result:', error);
      throw error;
    }

    console.log('[Storage] Audit result saved, ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('[Storage] Failed to save audit result:', error);
    throw error;
  }
}

/**
 * Get audit results for a tenant (last 30 days by default)
 */
export async function getAuditResults(
  tenantId?: string,
  options: { limit?: number; days?: number } = {}
): Promise<any[]> {
  try {
    const supabase = getSupabaseClient();
    const { limit = 100, days = 30 } = options;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let query = supabase
      .from('google_policy_audits')
      .select('*')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Storage] Failed to get audit results:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Storage] Failed to get audit results:', error);
    throw error;
  }
}

// ============================================================================
// POLICY DRIFT EVENTS
// ============================================================================

export interface SaveDriftEventInput {
  oldVersion: string;
  newVersion: string;
  changes: string[];
  actionRequired: boolean;
}

/**
 * Save policy drift event to PostgreSQL
 */
export async function saveDriftEvent(input: SaveDriftEventInput): Promise<number> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('google_policy_drift_events')
      .insert({
        old_version: input.oldVersion,
        new_version: input.newVersion,
        changes: input.changes,
        action_required: input.actionRequired,
        notified_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Storage] Failed to save drift event:', error);
      throw error;
    }

    console.log('[Storage] Drift event saved, ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('[Storage] Failed to save drift event:', error);
    throw error;
  }
}

/**
 * Get recent drift events
 */
export async function getDriftEvents(limit = 10): Promise<any[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('google_policy_drift_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Storage] Failed to get drift events:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Storage] Failed to get drift events:', error);
    throw error;
  }
}

// ============================================================================
// COMPLIANCE SUMMARY (Aggregated Metrics)
// ============================================================================

export interface ComplianceSummary {
  totalAudits: number;
  compliantAudits: number;
  nonCompliantAudits: number;
  complianceRate: number;
  avgRiskScore: number;
  avgJaccard: number;
  avgDisclosure: number;
  priceMismatchCount: number;
  hiddenFeesCount: number;
  totalConsistencyPenalty: number;
  totalPrecisionPenalty: number;
  criticalViolations: number;
  warningViolations: number;
  trend: {
    direction: 'improving' | 'stable' | 'degrading';
    change: number;
  };
}

/**
 * Get compliance summary for a tenant (last 30 days)
 */
export async function getComplianceSummary(
  tenantId?: string,
  days = 30
): Promise<ComplianceSummary> {
  try {
    const supabase = getSupabaseClient();

    // Get current period data
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);

    // Get previous period data (for trend calculation)
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days * 2);
    const previousPeriodEnd = currentPeriodStart;

    // Query current period
    let currentQuery = supabase
      .from('google_policy_audits')
      .select('*')
      .gte('created_at', currentPeriodStart.toISOString());

    if (tenantId) {
      currentQuery = currentQuery.eq('tenant_id', tenantId);
    }

    const { data: currentData, error: currentError } = await currentQuery;

    if (currentError) {
      throw currentError;
    }

    // Query previous period
    let previousQuery = supabase
      .from('google_policy_audits')
      .select('risk_score')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', previousPeriodEnd.toISOString());

    if (tenantId) {
      previousQuery = previousQuery.eq('tenant_id', tenantId);
    }

    const { data: previousData, error: previousError } = await previousQuery;

    if (previousError) {
      throw previousError;
    }

    // Calculate current period metrics
    const totalAudits = currentData?.length || 0;
    const compliantAudits = currentData?.filter((a: any) => a.compliant).length || 0;
    const nonCompliantAudits = totalAudits - compliantAudits;
    const complianceRate = totalAudits > 0 ? (compliantAudits / totalAudits) * 100 : 100;

    const avgRiskScore = totalAudits > 0
      ? currentData!.reduce((sum: number, a: any) => sum + parseFloat(a.risk_score), 0) / totalAudits
      : 0;

    const avgJaccard = totalAudits > 0
      ? currentData!.reduce((sum: number, a: any) => sum + parseFloat(a.jaccard_score), 0) / totalAudits
      : 0;

    const avgDisclosure = totalAudits > 0
      ? currentData!.reduce((sum: number, a: any) => sum + parseFloat(a.disclosure_clarity), 0) / totalAudits
      : 0;

    const priceMismatchCount = currentData?.filter((a: any) => a.price_mismatch).length || 0;
    const hiddenFeesCount = currentData?.filter((a: any) => a.hidden_fees).length || 0;

    const totalConsistencyPenalty = currentData?.reduce(
      (sum: number, a: any) => sum + parseFloat(a.consistency_penalty), 0
    ) || 0;

    const totalPrecisionPenalty = currentData?.reduce(
      (sum: number, a: any) => sum + parseFloat(a.precision_penalty), 0
    ) || 0;

    // Count violations from JSONB
    let criticalViolations = 0;
    let warningViolations = 0;

    currentData?.forEach((audit: any) => {
      const violations = audit.violations || [];
      criticalViolations += violations.filter((v: any) => v.type === 'critical').length;
      warningViolations += violations.filter((v: any) => v.type === 'warning').length;
    });

    // Calculate trend
    const previousAvgRisk = previousData && previousData.length > 0
      ? previousData.reduce((sum: number, a: any) => sum + parseFloat(a.risk_score), 0) / previousData.length
      : avgRiskScore;

    const riskChange = previousAvgRisk > 0 ? ((avgRiskScore - previousAvgRisk) / previousAvgRisk) * 100 : 0;

    const trend = {
      direction: (
        riskChange < -5 ? 'improving' :
        riskChange > 5 ? 'degrading' :
        'stable'
      ) as 'improving' | 'stable' | 'degrading',
      change: riskChange,
    };

    return {
      totalAudits,
      compliantAudits,
      nonCompliantAudits,
      complianceRate,
      avgRiskScore,
      avgJaccard,
      avgDisclosure,
      priceMismatchCount,
      hiddenFeesCount,
      totalConsistencyPenalty,
      totalPrecisionPenalty,
      criticalViolations,
      warningViolations,
      trend,
    };

  } catch (error) {
    console.error('[Storage] Failed to get compliance summary:', error);
    throw error;
  }
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Close connections and cleanup resources
 */
export async function cleanup() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
  console.log('[Storage] Cleanup complete');
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
