/**
 * Subscription Service
 *
 * Handles subscription tier management, usage tracking, and feature access checks.
 * This is the primary service for checking user permissions and limits.
 */

import db, { tables, getUserTenantId } from '@/lib/db';
import {
  canAccessFeature,
  getRemainingUsage,
  getTierLimits,
  getUpgradeMessage,
  type SubscriptionTier,
  type FeatureName,
} from '@/lib/tier-features';

export interface UserSubscription {
  id: string;
  tenant_id: string;
  user_id: string;
  email: string;
  status: string;
  plan: SubscriptionTier;
  stripe_customer_id: string;
  stripe_subscription_id?: string;
  current_period_start?: Date;
  current_period_end?: Date;
  trial_end?: Date;
  cancel_at_period_end: boolean;
}

export interface UsageStats {
  chatSessions: number;
  marketScans: number;
  mysteryShops: number;
  competitors: number;
}

export interface UserLimits {
  tier: SubscriptionTier;
  limits: ReturnType<typeof getTierLimits>;
  usage: UsageStats;
  remaining: {
    chatSessions: number;
    marketScans: number;
    mysteryShops: number;
    competitors: number;
  };
  features: {
    dataExport: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    realTimeAlerts: boolean;
    multiLocationSupport: boolean;
    whiteLabel: boolean;
  };
}

export class SubscriptionService {
  /**
   * Get user's subscription details
   */
  async getUserSubscription(clerkId: string): Promise<UserSubscription | null> {
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) return null;

    const subscription = await tables.subscriptions()
      .where('tenant_id', user.tenant_id)
      .first();

    return subscription as UserSubscription | null;
  }

  /**
   * Get user's subscription tier
   */
  async getUserTier(clerkId: string): Promise<SubscriptionTier> {
    const subscription = await this.getUserSubscription(clerkId);
    return (subscription?.plan as SubscriptionTier) || 'free';
  }

  /**
   * Get current usage statistics for a user
   */
  async getUsageStats(clerkId: string): Promise<UsageStats> {
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) {
      return {
        chatSessions: 0,
        marketScans: 0,
        mysteryShops: 0,
        competitors: 0,
      };
    }

    // Query all usage counts in parallel
    const [chatSessions, marketScans, mysteryShops, competitors] = await Promise.all([
      tables.chatSessions()
        .where('user_id', user.id)
        .count('* as count')
        .first(),
      tables.marketScans()
        .where('tenant_id', user.tenant_id)
        .count('* as count')
        .first(),
      tables.mysteryShops()
        .where('tenant_id', user.tenant_id)
        .count('* as count')
        .first(),
      tables.competitors()
        .where('tenant_id', user.tenant_id)
        .count('* as count')
        .first(),
    ]);

    return {
      chatSessions: parseInt((chatSessions?.count as string) || '0'),
      marketScans: parseInt((marketScans?.count as string) || '0'),
      mysteryShops: parseInt((mysteryShops?.count as string) || '0'),
      competitors: parseInt((competitors?.count as string) || '0'),
    };
  }

  /**
   * Get comprehensive user limits and usage
   */
  async getUserLimits(clerkId: string): Promise<UserLimits> {
    const tier = await this.getUserTier(clerkId);
    const limits = getTierLimits(tier);
    const usage = await this.getUsageStats(clerkId);

    return {
      tier,
      limits,
      usage,
      remaining: {
        chatSessions: getRemainingUsage(tier, 'chat_sessions', usage.chatSessions),
        marketScans: getRemainingUsage(tier, 'market_scans', usage.marketScans),
        mysteryShops: getRemainingUsage(tier, 'mystery_shops', usage.mysteryShops),
        competitors: getRemainingUsage(tier, 'competitor_tracking', usage.competitors),
      },
      features: {
        dataExport: canAccessFeature(tier, 'data_export'),
        apiAccess: canAccessFeature(tier, 'api_access'),
        customBranding: canAccessFeature(tier, 'custom_branding'),
        prioritySupport: canAccessFeature(tier, 'priority_support'),
        advancedAnalytics: canAccessFeature(tier, 'advanced_analytics'),
        realTimeAlerts: canAccessFeature(tier, 'real_time_alerts'),
        multiLocationSupport: canAccessFeature(tier, 'multi_location_support'),
        whiteLabel: canAccessFeature(tier, 'white_label'),
      },
    };
  }

  /**
   * Check if user can access a specific feature
   */
  async canUserAccessFeature(
    clerkId: string,
    feature: FeatureName
  ): Promise<boolean> {
    const tier = await this.getUserTier(clerkId);
    const stats = await this.getUsageStats(clerkId);

    // For usage-based features, pass current usage
    switch (feature) {
      case 'chat_sessions':
        return canAccessFeature(tier, feature, stats.chatSessions);
      case 'market_scans':
        return canAccessFeature(tier, feature, stats.marketScans);
      case 'mystery_shops':
        return canAccessFeature(tier, feature, stats.mysteryShops);
      case 'competitor_tracking':
        return canAccessFeature(tier, feature, stats.competitors);
      default:
        return canAccessFeature(tier, feature);
    }
  }

  /**
   * Get upgrade message for a feature the user can't access
   */
  async getUpgradeMessageForUser(
    clerkId: string,
    feature: FeatureName
  ): Promise<string> {
    const tier = await this.getUserTier(clerkId);
    return getUpgradeMessage(tier, feature);
  }

  /**
   * Increment usage counter for a feature
   */
  async incrementUsage(
    clerkId: string,
    feature: Extract<FeatureName, 'chat_sessions' | 'market_scans' | 'mystery_shops' | 'competitor_tracking'>
  ): Promise<void> {
    // This is handled automatically when you insert into the respective tables
    // This method is here for explicit tracking if needed
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) throw new Error('User not found');

    // Log to audit trail
    await tables.auditLog().insert({
      user_id: user.id,
      tenant_id: user.tenant_id,
      action: 'feature_usage',
      resource_type: feature,
      resource_id: null,
      details: JSON.stringify({ feature, timestamp: new Date() }),
    });
  }

  /**
   * Check feature access and throw if denied (for middleware)
   */
  async enforceFeatureAccess(
    clerkId: string,
    feature: FeatureName
  ): Promise<void> {
    const hasAccess = await this.canUserAccessFeature(clerkId, feature);

    if (!hasAccess) {
      const message = await this.getUpgradeMessageForUser(clerkId, feature);
      throw new Error(message);
    }
  }

  /**
   * Get user's tenant information
   */
  async getUserTenant(clerkId: string) {
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) return null;

    return tables.tenants()
      .where('id', user.tenant_id)
      .first();
  }

  /**
   * Update subscription status (called by Stripe webhooks)
   */
  async updateSubscriptionStatus(
    stripeSubscriptionId: string,
    updates: Partial<Pick<UserSubscription, 'status' | 'current_period_start' | 'current_period_end' | 'cancel_at_period_end'>>
  ): Promise<void> {
    await tables.subscriptions()
      .where('stripe_subscription_id', stripeSubscriptionId)
      .update(updates);
  }

  /**
   * Create or update subscription for a user
   */
  async upsertSubscription(
    clerkId: string,
    subscriptionData: {
      stripe_customer_id: string;
      stripe_subscription_id?: string;
      plan: SubscriptionTier;
      status: string;
      email: string;
    }
  ): Promise<void> {
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) throw new Error('User not found');

    const existing = await tables.subscriptions()
      .where('user_id', clerkId)
      .first();

    if (existing) {
      await tables.subscriptions()
        .where('id', existing.id)
        .update({
          ...subscriptionData,
          updated_at: new Date(),
        });
    } else {
      await tables.subscriptions().insert({
        tenant_id: user.tenant_id,
        user_id: clerkId,
        ...subscriptionData,
      });
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
