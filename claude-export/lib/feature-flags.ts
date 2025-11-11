export type Tier = 'free' | 'growth' | 'pro' | 'enterprise';

export interface FeatureFlags {
  banditEnabled: boolean;
  jsonLdPackEnabled: boolean;
  advancedAnalytics: boolean;
  customDomains: boolean;
  apiAccess: boolean;
  webhookAccess: boolean;
  prioritySupport: boolean;
  ssoEnabled: boolean;
  customIntegrations: boolean;
  whiteLabel: boolean;
}

export const TIER_FEATURES: Record<Tier, FeatureFlags> = {
  free: {
    banditEnabled: false,
    jsonLdPackEnabled: false,
    advancedAnalytics: false,
    customDomains: false,
    apiAccess: false,
    webhookAccess: false,
    prioritySupport: false,
    ssoEnabled: false,
    customIntegrations: false,
    whiteLabel: false,
  },
  growth: {
    banditEnabled: true,
    jsonLdPackEnabled: true,
    advancedAnalytics: true,
    customDomains: false,
    apiAccess: true,
    webhookAccess: true,
    prioritySupport: false,
    ssoEnabled: false,
    customIntegrations: false,
    whiteLabel: false,
  },
  pro: {
    banditEnabled: true,
    jsonLdPackEnabled: true,
    advancedAnalytics: true,
    customDomains: true,
    apiAccess: true,
    webhookAccess: true,
    prioritySupport: true,
    ssoEnabled: true,
    customIntegrations: true,
    whiteLabel: false,
  },
  enterprise: {
    banditEnabled: true,
    jsonLdPackEnabled: true,
    advancedAnalytics: true,
    customDomains: true,
    apiAccess: true,
    webhookAccess: true,
    prioritySupport: true,
    ssoEnabled: true,
    customIntegrations: true,
    whiteLabel: true,
  },
};

export function getFeatureFlags(tier: Tier): FeatureFlags {
  return TIER_FEATURES[tier] || TIER_FEATURES.free;
}

export function isFeatureEnabled(tier: Tier, feature: keyof FeatureFlags): boolean {
  return getFeatureFlags(tier)[feature];
}

export function isBanditEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'banditEnabled');
}

export function isJsonLdPackEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'jsonLdPackEnabled');
}

export function isAdvancedAnalyticsEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'advancedAnalytics');
}

export function isApiAccessEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'apiAccess');
}

export function isWebhookAccessEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'webhookAccess');
}

export function isPrioritySupportEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'prioritySupport');
}

export function isSsoEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'ssoEnabled');
}

export function isCustomIntegrationsEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'customIntegrations');
}

export function isWhiteLabelEnabled(tier: Tier): boolean {
  return isFeatureEnabled(tier, 'whiteLabel');
}

export function getTierFromString(tier: string): Tier {
  switch (tier.toLowerCase()) {
    case 'free':
      return 'free';
    case 'growth':
      return 'growth';
    case 'pro':
      return 'pro';
    case 'enterprise':
      return 'enterprise';
      default:
      return 'free';
  }
}

export function requireFeature(tier: Tier, feature: keyof FeatureFlags): void {
  if (!isFeatureEnabled(tier, feature)) {
    throw new Error(`Feature '${feature}' is not available for tier '${tier}'`);
  }
}

export function requireBandit(tier: Tier): void {
  requireFeature(tier, 'banditEnabled');
}

export function requireJsonLdPack(tier: Tier): void {
  requireFeature(tier, 'jsonLdPackEnabled');
}

export function requireApiAccess(tier: Tier): void {
  requireFeature(tier, 'apiAccess');
}

export function requireWebhookAccess(tier: Tier): void {
  requireFeature(tier, 'webhookAccess');
}