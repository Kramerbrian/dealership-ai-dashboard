export type PlanKey = 'starter' | 'growth' | 'professional';

export const PLANS = {
  starter: { 
    tier: 1, 
    trialDays: 14, 
    queriesMo: 10, 
    seats: 1, 
    locations: 1, 
    cacheH: 168,
    overage: ['auto_top_up', 'hard_cap', 'payg'], 
    sso: true 
  },
  growth: { 
    tier: 2, 
    trialDays: 14, 
    queriesMo: 400, 
    seats: 5, 
    locations: 3, 
    cacheH: 24,
    overage: ['auto_top_up', 'hard_cap', 'payg'], 
    sso: true 
  },
  professional: { 
    tier: 3, 
    trialDays: 14, 
    queriesMo: 700, 
    seats: 5, 
    locations: 1, 
    cacheH: 1,
    overage: ['auto_top_up', 'hard_cap', 'payg'], 
    sso: true 
  }
} as const;

export type Plan = typeof PLANS[PlanKey];