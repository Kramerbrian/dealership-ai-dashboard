/**
 * DealershipAI Master v2.0 - Three-Tier Feature Configuration
 * Consolidated pricing model with feature gating
 */

export const TIER_FEATURES = {
  free: {
    name: 'Level 1: Free',
    price: 0,
    features: [
      'basic_ai_visibility',
      'eeat_metrics',
      'website_health',
      'single_scan_monthly'
    ],
    limits: {
      chat_sessions: 0,
      scans_per_month: 1,
      competitors_tracked: 0,
      market_scans: false,
      mystery_shops: 0,
      locations: 1
    },
    access: [
      'overview',
      'ai_search_health',
      'website_health'
    ],
    cost_per_dealer: 0.50
  },
  
  pro: {
    name: 'Level 2: Professional',
    price: 499,
    features: [
      'basic_ai_visibility',
      'eeat_metrics',
      'website_health',
      'full_three_pillar_analysis',
      'schema_audit',
      'schema_generator',
      'chatgpt_analysis',
      'reviews_hub',
      'ai_chat_sessions',
      'bi_weekly_scans',
      'roi_calculator',
      'action_items'
    ],
    limits: {
      chat_sessions: 50,
      scans_per_month: 2,
      competitors_tracked: 5,
      market_scans: true,
      scan_frequency: 'bi-weekly',
      mystery_shops: 0,
      locations: 1
    },
    access: [
      'overview',
      'ai_search_health',
      'website_health',
      'schema_audit',
      'chatgpt_analysis',
      'reviews_hub',
      'action_plan'
    ],
    cost_per_dealer: 12.65,
    margin: 0.975 // 97.5%
  },
  
  enterprise: {
    name: 'Level 3: Enterprise',
    price: 999,
    features: [
      'basic_ai_visibility',
      'eeat_metrics',
      'website_health',
      'full_three_pillar_analysis',
      'schema_audit',
      'schema_generator',
      'chatgpt_analysis',
      'reviews_hub',
      'ai_chat_sessions',
      'mystery_shop',
      'predictive_analytics',
      'daily_monitoring',
      'realtime_alerts',
      'competitor_battle_plans',
      'automated_fixes',
      'multi_location',
      'white_label',
      'dedicated_manager',
      'api_access'
    ],
    limits: {
      chat_sessions: 200,
      scans_per_month: 30,
      competitors_tracked: 15,
      market_scans: true,
      scan_frequency: 'daily',
      mystery_shops: 4,
      locations: 10
    },
    access: [
      'overview',
      'ai_search_health',
      'website_health',
      'schema_audit',
      'chatgpt_analysis',
      'reviews_hub',
      'action_plan',
      'mystery_shop',
      'predictive_analytics',
      'competitor_intelligence',
      'automation_center'
    ],
    cost_per_dealer: 58.90,
    margin: 0.941 // 94.1%
  }
} as const;

export type Tier = keyof typeof TIER_FEATURES;

export function canAccessFeature(tier: Tier, feature: string): boolean {
  return TIER_FEATURES[tier]?.features.includes(feature) || false;
}

export function getSessionLimit(tier: Tier): number {
  return TIER_FEATURES[tier]?.limits.chat_sessions || 0;
}

export function getTierFeatures(tier: Tier) {
  return TIER_FEATURES[tier];
}

export function getTierByPrice(price: number): Tier {
  if (price === 0) return 'free';
  if (price === 499) return 'pro';
  if (price === 999) return 'enterprise';
  return 'free';
}

// Scale economics at 1,000 dealers
export const SCALE_ECONOMICS = {
  distribution: {
    free: { count: 600, revenue: 0, cost: 300 },       // 60%
    pro: { count: 350, revenue: 174650, cost: 4428 },  // 35%
    enterprise: { count: 50, revenue: 49950, cost: 2945 } // 5%
  },
  
  totals: {
    dealers: 1000,
    monthly_revenue: 224600,
    monthly_cost: 7673,
    net_profit: 216927,
    margin: 0.966  // 96.6%
  },
  
  annual: {
    revenue: 2695200,  // $2.7M
    profit: 2603124,   // $2.6M
    margin: 0.966      // 96.6%
  }
};
