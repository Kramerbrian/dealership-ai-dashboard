/**
 * Tier-Based Feature Access Control
 *
 * This module provides tier-based access control for DealershipAI features.
 * It enforces feature gates based on subscription plans (Free, Pro, Premium, Enterprise)
 */

export type SubscriptionTier = 'free' | 'pro' | 'premium' | 'enterprise';

export interface TierLimits {
  chatSessions: number;
  marketScans: number;
  mysteryShops: number;
  competitorTracking: number;
  dataExport: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  realTimeAlerts: boolean;
  multiLocationSupport: boolean;
  whiteLabel: boolean;
}

/**
 * Feature limits by tier
 * Sourced from environment variables with fallback defaults
 */
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    chatSessions: parseInt(process.env.TIER_FREE_SESSIONS || '0', 10),
    marketScans: 0,
    mysteryShops: 0,
    competitorTracking: 0,
    dataExport: false,
    apiAccess: false,
    customBranding: false,
    prioritySupport: false,
    advancedAnalytics: false,
    realTimeAlerts: false,
    multiLocationSupport: false,
    whiteLabel: false,
  },
  pro: {
    chatSessions: parseInt(process.env.TIER_PRO_SESSIONS || '25', 10),
    marketScans: 5,
    mysteryShops: 2,
    competitorTracking: 5,
    dataExport: true,
    apiAccess: false,
    customBranding: false,
    prioritySupport: false,
    advancedAnalytics: true,
    realTimeAlerts: false,
    multiLocationSupport: false,
    whiteLabel: false,
  },
  premium: {
    chatSessions: 100,
    marketScans: 20,
    mysteryShops: 10,
    competitorTracking: 20,
    dataExport: true,
    apiAccess: true,
    customBranding: true,
    prioritySupport: true,
    advancedAnalytics: true,
    realTimeAlerts: true,
    multiLocationSupport: true,
    whiteLabel: false,
  },
  enterprise: {
    chatSessions: parseInt(process.env.TIER_ENTERPRISE_SESSIONS || '125', 10),
    marketScans: -1, // Unlimited
    mysteryShops: -1, // Unlimited
    competitorTracking: -1, // Unlimited
    dataExport: true,
    apiAccess: true,
    customBranding: true,
    prioritySupport: true,
    advancedAnalytics: true,
    realTimeAlerts: true,
    multiLocationSupport: true,
    whiteLabel: true,
  },
};

/**
 * Feature names that can be gated
 */
export type FeatureName =
  | 'chat_sessions'
  | 'market_scans'
  | 'mystery_shops'
  | 'competitor_tracking'
  | 'data_export'
  | 'api_access'
  | 'custom_branding'
  | 'priority_support'
  | 'advanced_analytics'
  | 'real_time_alerts'
  | 'multi_location_support'
  | 'white_label';

/**
 * Check if a user has access to a specific feature based on their tier
 *
 * @param tier - User's subscription tier
 * @param feature - Feature to check access for
 * @param currentUsage - Current usage count (optional, for features with numeric limits)
 * @returns boolean indicating if user has access
 */
export function canAccessFeature(
  tier: SubscriptionTier,
  feature: FeatureName,
  currentUsage?: number
): boolean {
  const limits = TIER_LIMITS[tier];

  switch (feature) {
    case 'chat_sessions':
      if (limits.chatSessions === -1) return true; // Unlimited
      if (currentUsage === undefined) return limits.chatSessions > 0;
      return currentUsage < limits.chatSessions;

    case 'market_scans':
      if (limits.marketScans === -1) return true; // Unlimited
      if (currentUsage === undefined) return limits.marketScans > 0;
      return currentUsage < limits.marketScans;

    case 'mystery_shops':
      if (limits.mysteryShops === -1) return true; // Unlimited
      if (currentUsage === undefined) return limits.mysteryShops > 0;
      return currentUsage < limits.mysteryShops;

    case 'competitor_tracking':
      if (limits.competitorTracking === -1) return true; // Unlimited
      if (currentUsage === undefined) return limits.competitorTracking > 0;
      return currentUsage < limits.competitorTracking;

    case 'data_export':
      return limits.dataExport;

    case 'api_access':
      return limits.apiAccess;

    case 'custom_branding':
      return limits.customBranding;

    case 'priority_support':
      return limits.prioritySupport;

    case 'advanced_analytics':
      return limits.advancedAnalytics;

    case 'real_time_alerts':
      return limits.realTimeAlerts;

    case 'multi_location_support':
      return limits.multiLocationSupport;

    case 'white_label':
      return limits.whiteLabel;

    default:
      return false;
  }
}

/**
 * Get remaining usage for a feature
 *
 * @param tier - User's subscription tier
 * @param feature - Feature to check
 * @param currentUsage - Current usage count
 * @returns Remaining usage (-1 for unlimited, 0 for exhausted, positive number for remaining)
 */
export function getRemainingUsage(
  tier: SubscriptionTier,
  feature: Extract<FeatureName, 'chat_sessions' | 'market_scans' | 'mystery_shops' | 'competitor_tracking'>,
  currentUsage: number
): number {
  const limits = TIER_LIMITS[tier];

  switch (feature) {
    case 'chat_sessions':
      if (limits.chatSessions === -1) return -1;
      return Math.max(0, limits.chatSessions - currentUsage);

    case 'market_scans':
      if (limits.marketScans === -1) return -1;
      return Math.max(0, limits.marketScans - currentUsage);

    case 'mystery_shops':
      if (limits.mysteryShops === -1) return -1;
      return Math.max(0, limits.mysteryShops - currentUsage);

    case 'competitor_tracking':
      if (limits.competitorTracking === -1) return -1;
      return Math.max(0, limits.competitorTracking - currentUsage);

    default:
      return 0;
  }
}

/**
 * Get all feature limits for a tier
 *
 * @param tier - Subscription tier
 * @returns All limits for the tier
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if a feature requires an upgrade
 *
 * @param currentTier - User's current tier
 * @param feature - Feature to check
 * @returns The minimum tier required for the feature, or null if already accessible
 */
export function getRequiredTierForFeature(
  currentTier: SubscriptionTier,
  feature: FeatureName
): SubscriptionTier | null {
  if (canAccessFeature(currentTier, feature)) {
    return null;
  }

  const tiers: SubscriptionTier[] = ['free', 'pro', 'premium', 'enterprise'];
  for (const tier of tiers) {
    if (canAccessFeature(tier, feature)) {
      return tier;
    }
  }

  return 'enterprise';
}

/**
 * Middleware helper to enforce feature access in API routes
 *
 * @param tier - User's subscription tier
 * @param feature - Feature being accessed
 * @param currentUsage - Current usage (optional)
 * @throws Error if access is denied
 */
export function enforceFeatureAccess(
  tier: SubscriptionTier,
  feature: FeatureName,
  currentUsage?: number
): void {
  if (!canAccessFeature(tier, feature, currentUsage)) {
    const requiredTier = getRequiredTierForFeature(tier, feature);
    throw new Error(
      `Feature "${feature}" requires ${requiredTier} tier. Current tier: ${tier}`
    );
  }
}

/**
 * Get a user-friendly message for feature access denial
 *
 * @param tier - User's current tier
 * @param feature - Feature being accessed
 * @returns User-friendly upgrade message
 */
export function getUpgradeMessage(tier: SubscriptionTier, feature: FeatureName): string {
  const requiredTier = getRequiredTierForFeature(tier, feature);

  if (!requiredTier) {
    return 'You have access to this feature.';
  }

  const featureNames: Record<FeatureName, string> = {
    chat_sessions: 'ACP Chat Sessions',
    market_scans: 'Market Scans',
    mystery_shops: 'Mystery Shopping',
    competitor_tracking: 'Competitor Tracking',
    data_export: 'Data Export',
    api_access: 'API Access',
    custom_branding: 'Custom Branding',
    priority_support: 'Priority Support',
    advanced_analytics: 'Advanced Analytics',
    real_time_alerts: 'Real-Time Alerts',
    multi_location_support: 'Multi-Location Support',
    white_label: 'White Label',
  };

  return `${featureNames[feature]} requires a ${requiredTier.toUpperCase()} plan. Upgrade to unlock this feature.`;
}
