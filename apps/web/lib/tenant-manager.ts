import { prisma } from '@/lib/prisma';
import { getFeatureFlags, Tier, FeatureFlags } from '@/lib/feature-flags';
import { config } from '@/lib/config';

export interface Tenant {
  id: string;
  name: string;
  tier: Tier;
  features: FeatureFlags;
  createdAt: Date;
  updatedAt: Date;
  subscriptionId?: string;
  billingEmail?: string;
  isActive: boolean;
}

export interface CreateTenantData {
  name: string;
  tier?: Tier;
  subscriptionId?: string;
  billingEmail?: string;
}

export interface UpdateTenantData {
  name?: string;
  tier?: Tier;
  subscriptionId?: string;
  billingEmail?: string;
  isActive?: boolean;
}

export class TenantManager {
  /**
   * Get tenant by ID with features
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          tier: true,
          createdAt: true,
          updatedAt: true,
          subscriptionId: true,
          billingEmail: true,
          isActive: true,
        },
      });

      if (!tenant) {
        return null;
      }

      const tier = (tenant.tier as Tier) || 'free';
      const features = getFeatureFlags(tier);

      return {
        ...tenant,
        tier,
        features,
      };
    } catch (error) {
      console.error('Failed to get tenant:', error);
      return null;
    }
  }

  /**
   * Create a new tenant
   */
  async createTenant(data: CreateTenantData): Promise<Tenant> {
    const tier = data.tier || 'free';
    const features = getFeatureFlags(tier);

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        tier,
        subscriptionId: data.subscriptionId,
        billingEmail: data.billingEmail,
        isActive: true,
      },
    });

    return {
      ...tenant,
      tier,
      features,
    };
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, data: UpdateTenantData): Promise<Tenant | null> {
    try {
      const updateData: any = { ...data };
      
      // If tier is being updated, we need to update features
      if (data.tier) {
        updateData.tier = data.tier;
      }

      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: updateData,
        select: {
          id: true,
          name: true,
          tier: true,
          createdAt: true,
          updatedAt: true,
          subscriptionId: true,
          billingEmail: true,
          isActive: true,
        },
      });

      const tier = (tenant.tier as Tier) || 'free';
      const features = getFeatureFlags(tier);

      return {
        ...tenant,
        tier,
        features,
      };
    } catch (error) {
      console.error('Failed to update tenant:', error);
      return null;
    }
  }

  /**
   * Check if tenant has access to a feature
   */
  async hasFeature(tenantId: string, feature: keyof FeatureFlags): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      return false;
    }

    return tenant.features[feature];
  }

  /**
   * Require a feature for a tenant
   */
  async requireFeature(tenantId: string, feature: keyof FeatureFlags): Promise<void> {
    const hasAccess = await this.hasFeature(tenantId, feature);
    if (!hasAccess) {
      const tenant = await this.getTenant(tenantId);
      const tier = tenant?.tier || 'free';
      throw new Error(`Feature '${feature}' is not available for tier '${tier}'`);
    }
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string, period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    try {
      const [apiCalls, webhookCalls, banditAllocations] = await Promise.all([
        // Count API calls
        prisma.$queryRawUnsafe<[{ count: bigint }]>(
          'SELECT COUNT(*) as count FROM api_logs WHERE tenant_id = $1 AND created_at >= $2',
          tenantId,
          startDate
        ),
        
        // Count webhook calls
        prisma.$queryRawUnsafe<[{ count: bigint }]>(
          'SELECT COUNT(*) as count FROM webhook_logs WHERE tenant_id = $1 AND created_at >= $2',
          tenantId,
          startDate
        ),
        
        // Count bandit allocations
        prisma.$queryRawUnsafe<[{ count: bigint }]>(
          'SELECT COUNT(*) as count FROM bandit_allocations WHERE tenant_id = $1 AND created_at >= $2',
          tenantId,
          startDate
        ),
      ]);

      return {
        apiCalls: Number(apiCalls[0]?.count || 0),
        webhookCalls: Number(webhookCalls[0]?.count || 0),
        banditAllocations: Number(banditAllocations[0]?.count || 0),
        period,
        startDate,
        endDate: now,
      };
    } catch (error) {
      console.error('Failed to get tenant usage:', error);
      return {
        apiCalls: 0,
        webhookCalls: 0,
        banditAllocations: 0,
        period,
        startDate,
        endDate: now,
      };
    }
  }

  /**
   * Check if tenant is within usage limits
   */
  async checkUsageLimits(tenantId: string): Promise<{
    withinLimits: boolean;
    limits: Record<string, { used: number; limit: number; remaining: number }>;
  }> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const usage = await this.getTenantUsage(tenantId, 'month');
    
    // Define limits based on tier
    const limits = {
      free: { apiCalls: 1000, webhookCalls: 100, banditAllocations: 0 },
      growth: { apiCalls: 10000, webhookCalls: 1000, banditAllocations: 1000 },
      pro: { apiCalls: 100000, webhookCalls: 10000, banditAllocations: 10000 },
      enterprise: { apiCalls: -1, webhookCalls: -1, banditAllocations: -1 }, // Unlimited
    };

    const tierLimits = limits[tenant.tier];
    const result: Record<string, { used: number; limit: number; remaining: number }> = {};

    let withinLimits = true;

    for (const [key, limit] of Object.entries(tierLimits)) {
      const used = usage[key as keyof typeof usage] || 0;
      const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
      const exceeded = limit !== -1 && used > limit;

      result[key] = { used, limit, remaining };
      
      if (exceeded) {
        withinLimits = false;
      }
    }

    return { withinLimits, limits: result };
  }

  /**
   * Upgrade tenant tier
   */
  async upgradeTenant(tenantId: string, newTier: Tier, subscriptionId?: string): Promise<Tenant | null> {
    return this.updateTenant(tenantId, {
      tier: newTier,
      subscriptionId,
      isActive: true,
    });
  }

  /**
   * Downgrade tenant tier
   */
  async downgradeTenant(tenantId: string, newTier: Tier): Promise<Tenant | null> {
    // Check if tenant is within limits for new tier
    const tempTenant = await this.getTenant(tenantId);
    if (tempTenant) {
      const newFeatures = getFeatureFlags(newTier);
      
      // If downgrading, check if current usage exceeds new limits
      const usage = await this.getTenantUsage(tenantId, 'month');
      const newLimits = {
        free: { apiCalls: 1000, webhookCalls: 100, banditAllocations: 0 },
        growth: { apiCalls: 10000, webhookCalls: 1000, banditAllocations: 1000 },
        pro: { apiCalls: 100000, webhookCalls: 10000, banditAllocations: 10000 },
        enterprise: { apiCalls: -1, webhookCalls: -1, banditAllocations: -1 },
      };

      const limits = newLimits[newTier];
      const exceeded = Object.entries(limits).some(([key, limit]) => {
        const used = usage[key as keyof typeof usage] || 0;
        return limit !== -1 && used > limit;
      });

      if (exceeded) {
        throw new Error('Cannot downgrade: current usage exceeds new tier limits');
      }
    }

    return this.updateTenant(tenantId, {
      tier: newTier,
      isActive: true,
    });
  }
}

export const tenantManager = new TenantManager();
