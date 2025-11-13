/**
 * Client-Safe User Management
 * User management utilities for client-side operations
 */

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic SEO Analysis',
      'AEO Analysis', 
      'GEO Analysis',
      '5 reports per month',
      'Email support'
    ],
    limits: {
      reportsPerMonth: 5,
      aiScansPerMonth: 1,
      competitorAnalysis: false,
      mysteryShop: false
    }
  },
  professional: {
    name: 'Professional',
    price: 499,
    interval: 'month',
    features: [
      'Advanced SEO Analysis',
      'AEO Analysis',
      'GEO Analysis',
      'Competitor Analysis',
      'AI-powered insights',
      'Priority support',
      '50 reports per month'
    ],
    limits: {
      reportsPerMonth: 50,
      aiScansPerMonth: 24,
      competitorAnalysis: true,
      mysteryShop: false
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    interval: 'month',
    features: [
      'Unlimited reports',
      'Advanced AI analysis',
      'Mystery shop automation',
      'Custom integrations',
      'Dedicated support',
      'White-label options'
    ],
    limits: {
      reportsPerMonth: -1,
      aiScansPerMonth: -1,
      competitorAnalysis: true,
      mysteryShop: true
    }
  }
};

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  createdAt: Date;
  lastLoginAt: Date;
  subscriptionId?: string;
  subscriptionStatus?: string;
}

export class ClientUserManager {
  /**
   * Get user's current plan
   */
  static getCurrentPlan(user: User): typeof SUBSCRIPTION_PLANS[PlanType] {
    return SUBSCRIPTION_PLANS[user.plan];
  }

  /**
   * Check if user has access to a feature
   */
  static hasFeatureAccess(user: User, feature: string): boolean {
    const plan = this.getCurrentPlan(user);
    return plan.features.includes(feature);
  }

  /**
   * Check if user has reached their limits
   */
  static hasReachedLimit(user: User, limitType: keyof typeof SUBSCRIPTION_PLANS.free.limits): boolean {
    const plan = this.getCurrentPlan(user);
    const limit = plan.limits[limitType];
    
    if (limit === -1) return false; // Unlimited
    if (limit === false) return true; // Not available
    
    // For now, return false as we don't have usage tracking on client
    return false;
  }

  /**
   * Get upgrade options for user
   */
  static getUpgradeOptions(user: User): Array<typeof SUBSCRIPTION_PLANS[PlanType]> {
    const currentPlanIndex = Object.keys(SUBSCRIPTION_PLANS).indexOf(user.plan);
    const allPlans = Object.values(SUBSCRIPTION_PLANS);
    
    return allPlans.slice(currentPlanIndex + 1);
  }

  /**
   * Check if user can upgrade
   */
  static canUpgrade(user: User): boolean {
    return this.getUpgradeOptions(user).length > 0;
  }

  /**
   * Get plan comparison data
   */
  static getPlanComparison(): Array<{
    name: string;
    price: number;
    features: string[];
    limits: Record<string, any>;
    popular?: boolean;
  }> {
    return Object.values(SUBSCRIPTION_PLANS).map((plan, index) => ({
      ...plan,
      popular: index === 1 // Professional is popular
    }));
  }
}