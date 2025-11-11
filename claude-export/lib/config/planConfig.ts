// DealershipAI Plan Configuration
// Tier definitions with quotas, features, and overage modes

export type PlanTier = 'starter' | 'growth' | 'professional'

export interface PlanConfig {
  name: string
  displayName: string
  monthlyPrice: number
  annualPrice: number
  trialDays: number
  quotas: {
    aiQueries: number
    contentAudits: number
    gbpUpdates: number
    competitorScans: number
    reviewResponses: number
  }
  overageMode: 'hard_cap' | 'auto_top_up' | 'payg'
  features: {
    aiVisibility: boolean
    competitorAnalysis: boolean
    contentOptimization: boolean
    reviewManagement: boolean
    gbpAutomation: boolean
    advancedAnalytics: boolean
    apiAccess: boolean
    whiteLabel: boolean
  }
  limits: {
    maxDealerships: number
    maxUsers: number
    maxApiCalls: number
    dataRetentionDays: number
  }
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  starter: {
    name: 'starter',
    displayName: 'Starter',
    monthlyPrice: 297,
    annualPrice: 2970, // 2 months free
    trialDays: 14,
    quotas: {
      aiQueries: 1000,
      contentAudits: 50,
      gbpUpdates: 10,
      competitorScans: 5,
      reviewResponses: 25
    },
    overageMode: 'hard_cap',
    features: {
      aiVisibility: true,
      competitorAnalysis: false,
      contentOptimization: true,
      reviewManagement: true,
      gbpAutomation: false,
      advancedAnalytics: false,
      apiAccess: false,
      whiteLabel: false
    },
    limits: {
      maxDealerships: 1,
      maxUsers: 3,
      maxApiCalls: 1000,
      dataRetentionDays: 90
    }
  },
  growth: {
    name: 'growth',
    displayName: 'Growth',
    monthlyPrice: 597,
    annualPrice: 5970, // 2 months free
    trialDays: 14,
    quotas: {
      aiQueries: 5000,
      contentAudits: 200,
      gbpUpdates: 50,
      competitorScans: 25,
      reviewResponses: 100
    },
    overageMode: 'auto_top_up',
    features: {
      aiVisibility: true,
      competitorAnalysis: true,
      contentOptimization: true,
      reviewManagement: true,
      gbpAutomation: true,
      advancedAnalytics: true,
      apiAccess: true,
      whiteLabel: false
    },
    limits: {
      maxDealerships: 5,
      maxUsers: 10,
      maxApiCalls: 5000,
      dataRetentionDays: 180
    }
  },
  professional: {
    name: 'professional',
    displayName: 'Professional',
    monthlyPrice: 1197,
    annualPrice: 11970, // 2 months free
    trialDays: 14,
    quotas: {
      aiQueries: 20000,
      contentAudits: 1000,
      gbpUpdates: 200,
      competitorScans: 100,
      reviewResponses: 500
    },
    overageMode: 'payg',
    features: {
      aiVisibility: true,
      competitorAnalysis: true,
      contentOptimization: true,
      reviewManagement: true,
      gbpAutomation: true,
      advancedAnalytics: true,
      apiAccess: true,
      whiteLabel: true
    },
    limits: {
      maxDealerships: -1, // unlimited
      maxUsers: -1, // unlimited
      maxApiCalls: 20000,
      dataRetentionDays: 365
    }
  }
}

export function getPlanConfig(tier: PlanTier): PlanConfig {
  return PLAN_CONFIGS[tier]
}

export function getPlanDisplayName(tier: PlanTier): string {
  return PLAN_CONFIGS[tier].displayName
}

export function isFeatureEnabled(tier: PlanTier, feature: keyof PlanConfig['features']): boolean {
  return PLAN_CONFIGS[tier].features[feature]
}

export function getQuotaLimit(tier: PlanTier, quota: keyof PlanConfig['quotas']): number {
  return PLAN_CONFIGS[tier].quotas[quota]
}
