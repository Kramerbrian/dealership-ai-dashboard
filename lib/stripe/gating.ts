/**
 * Stripe Billing Gates
 * 
 * Feature gating based on subscription tier
 */

import { User } from '@clerk/nextjs/server';

export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  analyses: number;
  competitors: number;
  pulses: number;
  autopilot: boolean;
  advanced_analytics: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    analyses: 3,
    competitors: 1,
    pulses: 10,
    autopilot: false,
    advanced_analytics: false
  },
  pro: {
    analyses: 50,
    competitors: 5,
    pulses: 100,
    autopilot: true,
    advanced_analytics: true
  },
  enterprise: {
    analyses: Infinity,
    competitors: Infinity,
    pulses: Infinity,
    autopilot: true,
    advanced_analytics: true
  }
};

/**
 * Get user's plan tier from Clerk metadata
 */
export function getUserPlan(user: User | null): PlanTier {
  if (!user) return 'free';
  
  const plan = user.publicMetadata?.plan as PlanTier | undefined;
  if (plan && ['free', 'pro', 'enterprise'].includes(plan)) {
    return plan;
  }
  
  return 'free';
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  user: User | null,
  feature: keyof PlanLimits
): boolean {
  const plan = getUserPlan(user);
  const limits = PLAN_LIMITS[plan];
  
  if (feature === 'autopilot' || feature === 'advanced_analytics') {
    return limits[feature] === true;
  }
  
  return limits[feature] > 0;
}

/**
 * Check if user has exceeded usage limit
 */
export function checkUsageLimit(
  user: User | null,
  feature: 'analyses' | 'competitors' | 'pulses',
  currentUsage: number
): { allowed: boolean; remaining: number; limit: number } {
  const plan = getUserPlan(user);
  const limits = PLAN_LIMITS[plan];
  const limit = limits[feature];
  
  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }
  
  const remaining = Math.max(0, limit - currentUsage);
  const allowed = currentUsage < limit;
  
  return { allowed, remaining, limit };
}

/**
 * Generate upsell message
 */
export function getUpsellMessage(
  feature: string,
  plan: PlanTier
): { message: string; cta: string; link: string } {
  const messages: Record<PlanTier, Record<string, { message: string; cta: string; link: string }>> = {
    free: {
      analyses: {
        message: "You've used 90% of your Free analyses. Unlock 50 analyses/month with Pro.",
        cta: 'Upgrade to Pro',
        link: '/pricing?plan=pro'
      },
      competitors: {
        message: "Free plan includes 1 competitor. Compare up to 5 with Pro.",
        cta: 'Upgrade to Pro',
        link: '/pricing?plan=pro'
      },
      autopilot: {
        message: "Autopilot is available on Pro and Enterprise plans.",
        cta: 'Upgrade to Pro',
        link: '/pricing?plan=pro'
      }
    },
    pro: {
      enterprise: {
        message: "Unlock unlimited analyses and advanced features with Enterprise.",
        cta: 'Upgrade to Enterprise',
        link: '/pricing?plan=enterprise'
      }
    },
    enterprise: {
      default: {
        message: "You have full access to all features.",
        cta: '',
        link: ''
      }
    }
  };
  
  return messages[plan]?.[feature] || {
    message: `Upgrade to unlock ${feature}`,
    cta: 'View Plans',
    link: '/pricing'
  };
}

