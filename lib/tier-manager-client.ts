/**
 * Client-Safe Tier Management System
 * Handles tier-based functionality on the client side
 */

export type PlanTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface TierLimits {
  sessionsLimit: number;
  features: string[];
  price: number;
  name: string;
}

export const TIER_LIMITS: Record<PlanTier, TierLimits> = {
  FREE: {
    sessionsLimit: 1,
    features: ['ai_scan', 'evidence_report', 'fix_list'],
    price: 0,
    name: 'Level 1'
  },
  PRO: {
    sessionsLimit: 24,
    features: ['bi_weekly_checks', 'auto_responses', 'schema_generator', 'priority_support', 'chatgpt_analysis', 'reviews_hub', 'market_scans', 'roi_calculator'],
    price: 499,
    name: 'Level 2'
  },
  ENTERPRISE: {
    sessionsLimit: -1, // Unlimited
    features: ['unlimited_scans', 'mystery_shop_automation', 'predictive_analytics', 'daily_monitoring', 'real_time_alerts', 'competitor_battle_plans', 'enterprise_guardrails', 'multi_rooftop', 'sla_sso', 'dedicated_support'],
    price: 999,
    name: 'Level 3'
  }
};

export class ClientTierManager {
  /**
   * Check if current tier has access to required tier
   */
  static hasTierAccess(currentTier: PlanTier, requiredTier: PlanTier): boolean {
    const tierHierarchy = {
      FREE: 0,
      PRO: 1,
      ENTERPRISE: 2
    };
    
    return tierHierarchy[currentTier] >= tierHierarchy[requiredTier];
  }

  /**
   * Check if user has access to a specific feature
   */
  static hasFeatureAccess(currentTier: PlanTier, feature: string): boolean {
    const limits = TIER_LIMITS[currentTier];
    return limits.features.includes(feature);
  }

  /**
   * Get session limit for a tier
   */
  static getSessionLimit(tier: PlanTier): number {
    return TIER_LIMITS[tier].sessionsLimit;
  }

  /**
   * Get tier information for display
   */
  static getTierInfo(tier: PlanTier) {
    return TIER_LIMITS[tier];
  }

  /**
   * Check if user can access a specific route/feature
   */
  static canAccess(currentTier: PlanTier, feature: string): { 
    allowed: boolean; 
    reason?: string; 
    upgradeRequired?: PlanTier 
  } {
    const hasAccess = this.hasFeatureAccess(currentTier, feature);
    
    if (hasAccess) {
      return { allowed: true };
    }

    // Find the minimum tier that has this feature
    const requiredTier = Object.entries(TIER_LIMITS).find(([_, limits]) => 
      limits.features.includes(feature)
    )?.[0] as PlanTier;

    return {
      allowed: false,
      reason: `This feature requires ${requiredTier} tier`,
      upgradeRequired: requiredTier
    };
  }

  /**
   * Get feature description based on feature and tier
   */
  static getFeatureDescription(feature: string, tier: PlanTier): string {
    const descriptions = {
      'eeat_scoring': 'Get detailed E-E-A-T analysis with expertise, experience, authoritativeness, and trustworthiness scores.',
      'mystery_shop': 'Schedule and manage mystery shop tests to evaluate your customer experience.',
      'competitive_intel': 'Access advanced competitive intelligence and market positioning insights.',
      'api_access': 'Get API access for custom integrations and white-label solutions.',
      'white_label': 'White-label the platform for your own brand and clients.'
    };
    
    return descriptions[feature as keyof typeof descriptions] || `This ${tier} feature is not available in your current plan.`;
  }

  /**
   * Get upgrade benefits for a tier
   */
  static getUpgradeBenefits(tier: PlanTier): string {
    const benefits: Partial<Record<PlanTier, string>> = {
      PRO: '50 sessions/month • E-E-A-T scoring • Advanced analytics',
      ENTERPRISE: '200 sessions/month • Mystery shop • API access • White-label'
    };

    return (benefits as any)[tier] || '';
  }
}
