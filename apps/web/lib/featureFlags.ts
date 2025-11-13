export type PlanKey = 'ignition' | 'momentum' | 'hyperdrive';
export type FeatureKey = 'ai_health' | 'zero_click' | 'competitive_ugc' | 'auto_fix' | 'site_inject' | 'advanced_analytics';

export const FEATURE_FLAGS: Record<PlanKey, FeatureKey[]> = {
  ignition: ['ai_health', 'zero_click'],
  momentum: ['ai_health', 'zero_click', 'competitive_ugc', 'auto_fix'],
  hyperdrive: ['ai_health', 'zero_click', 'competitive_ugc', 'auto_fix', 'site_inject', 'advanced_analytics']
};

export function hasFeature(plan: PlanKey, feature: FeatureKey): boolean {
  return FEATURE_FLAGS[plan]?.includes(feature) || false;
}

export function getAvailableFeatures(plan: PlanKey): FeatureKey[] {
  return FEATURE_FLAGS[plan] || [];
}

export function isFeatureEnabled(plan: PlanKey, feature: FeatureKey): boolean {
  return hasFeature(plan, feature);
}
