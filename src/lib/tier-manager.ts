/**
 * DealershipAI v2.0 - Tier Manager
 * Handles session limits and feature access
 */

import { SESSION_LIMITS, GeoPoolManager } from './redis';

export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface TierInfo {
  plan: Plan;
  name: string;
  price: number;
  sessionLimit: number;
  features: string[];
  color: string;
}

export const TIER_INFO: Record<Plan, TierInfo> = {
  FREE: {
    plan: 'FREE',
    name: 'Test Drive',
    price: 0,
    sessionLimit: SESSION_LIMITS.FREE,
    features: [
      'Basic AI Visibility Score',
      '1 Dealership',
      '2 Users',
      '30-day Analytics Retention',
      '1,000 API Calls/Month',
    ],
    color: 'gray'
  },
  PRO: {
    plan: 'PRO',
    name: 'Intelligence',
    price: 499,
    sessionLimit: SESSION_LIMITS.PRO,
    features: [
      'AI Visibility Score',
      'E-E-A-T Analytics',
      'Competitor Analysis',
      '5 Dealerships',
      '10 Users',
      '90-day Analytics Retention',
      '10,000 API Calls/Month',
      'Email Support',
    ],
    color: 'blue'
  },
  ENTERPRISE: {
    plan: 'ENTERPRISE',
    name: 'Boss Mode',
    price: 999,
    sessionLimit: SESSION_LIMITS.ENTERPRISE,
    features: [
      'Everything in Intelligence',
      'Algorithmic Visibility Index',
      'Predictive Analytics',
      'Mystery Shop Testing',
      '25 Dealerships',
      '50 Users',
      '365-day Analytics Retention',
      '50,000 API Calls/Month',
      'Priority Support',
      'API Access',
    ],
    color: 'purple'
  }
};

export class TierManager {
  /**
   * Check if user can make a request
   */
  static async canMakeRequest(userId: string, plan: Plan): Promise<{
    allowed: boolean;
    reason?: string;
    sessionsUsed: number;
    sessionsRemaining: number;
  }> {
    const sessionsUsed = await GeoPoolManager.getSessionCount(userId);
    const limit = SESSION_LIMITS[plan];
    const sessionsRemaining = Math.max(0, limit - sessionsUsed);

    if (sessionsUsed >= limit) {
      return {
        allowed: false,
        reason: `Session limit reached. Upgrade to ${this.getNextTier(plan)} for more sessions.`,
        sessionsUsed,
        sessionsRemaining: 0
      };
    }

    return {
      allowed: true,
      sessionsUsed,
      sessionsRemaining
    };
  }

  /**
   * Get next tier for upgrade
   */
  static getNextTier(currentPlan: Plan): string {
    switch (currentPlan) {
      case 'FREE':
        return 'Intelligence ($499/month)';
      case 'PRO':
        return 'Boss Mode ($999/month)';
      case 'ENTERPRISE':
        return 'Custom Enterprise';
      default:
        return 'Intelligence ($499/month)';
    }
  }

  /**
   * Check if user has access to a feature
   */
  static hasFeatureAccess(plan: Plan, feature: string): boolean {
    const tier = TIER_INFO[plan];
    return tier.features.includes(feature);
  }

  /**
   * Get tier information
   */
  static getTierInfo(plan: Plan): TierInfo {
    return TIER_INFO[plan];
  }

  /**
   * Get all tiers for comparison
   */
  static getAllTiers(): TierInfo[] {
    return Object.values(TIER_INFO);
  }

  /**
   * Calculate cost per session
   */
  static getCostPerSession(plan: Plan): number {
    const tier = TIER_INFO[plan];
    const monthlyCost = 1.25; // $1.25/month for 100 queries
    return monthlyCost / tier.sessionLimit;
  }

  /**
   * Get upgrade recommendation
   */
  static getUpgradeRecommendation(plan: Plan, sessionsUsed: number): {
    recommended: boolean;
    reason: string;
    nextTier: string;
  } {
    const tier = TIER_INFO[plan];
    const usagePercent = (sessionsUsed / tier.sessionLimit) * 100;

    if (usagePercent >= 80) {
      return {
        recommended: true,
        reason: `You've used ${usagePercent.toFixed(0)}% of your ${tier.name} sessions.`,
        nextTier: this.getNextTier(plan)
      };
    }

    if (plan === 'FREE' && sessionsUsed > 0) {
      return {
        recommended: true,
        reason: 'Unlock unlimited analysis with Intelligence tier.',
        nextTier: this.getNextTier(plan)
      };
    }

    return {
      recommended: false,
      reason: 'Your current plan is sufficient.',
      nextTier: this.getNextTier(plan)
    };
  }

  /**
   * Get feature comparison matrix
   */
  static getFeatureMatrix(): Record<string, Record<Plan, boolean>> {
    const features = [
      'AI Visibility Score',
      'E-E-A-T Analytics',
      'Competitor Analysis',
      'Mystery Shop Testing',
      'Predictive Analytics',
      'API Access',
      'Priority Support',
      'Multiple Dealerships',
      'Advanced Analytics',
      'Custom Integrations'
    ];

    const matrix: Record<string, Record<Plan, boolean>> = {};

    features.forEach(feature => {
      matrix[feature] = {
        FREE: this.hasFeatureAccess('FREE', feature),
        PRO: this.hasFeatureAccess('PRO', feature),
        ENTERPRISE: this.hasFeatureAccess('ENTERPRISE', feature)
      };
    });

    return matrix;
  }

  /**
   * Calculate ROI for upgrade
   */
  static calculateROI(currentPlan: Plan, targetPlan: Plan, monthlyRevenue: number): {
    additionalCost: number;
    additionalRevenue: number;
    roi: number;
    paybackPeriod: number; // in months
  } {
    const currentTier = TIER_INFO[currentPlan];
    const targetTier = TIER_INFO[targetPlan];
    
    const additionalCost = targetTier.price - currentTier.price;
    
    // Estimate additional revenue from better features
    const revenueMultiplier = targetPlan === 'PRO' ? 1.2 : 1.5;
    const additionalRevenue = monthlyRevenue * (revenueMultiplier - 1);
    
    const roi = additionalRevenue - additionalCost;
    const paybackPeriod = additionalCost / additionalRevenue;

    return {
      additionalCost,
      additionalRevenue,
      roi,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10
    };
  }
}
