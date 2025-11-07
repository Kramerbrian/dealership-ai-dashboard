/**
 * Billing & Feature Gating
 * Checks user plan and feature access
 */

export type Plan = "free" | "pro" | "enterprise";

export interface FeatureGate {
  autopilot: Plan[];
  competitors: Plan[];
  analyses: Plan[];
  pulse_depth: Plan[];
  integrations: Plan[];
}

const FEATURE_GATES: FeatureGate = {
  autopilot: ["pro", "enterprise"],
  competitors: ["pro", "enterprise"], // Free: 1, Pro: 5, Enterprise: unlimited
  analyses: ["pro", "enterprise"], // Free: 3, Pro: 50, Enterprise: unlimited
  pulse_depth: ["pro", "enterprise"], // Free: top 3, Pro: all, Enterprise: all + historical
  integrations: ["pro", "enterprise"] // Free: none, Pro: 2, Enterprise: all
};

export function hasFeatureAccess(plan: Plan, feature: keyof FeatureGate): boolean {
  return FEATURE_GATES[feature].includes(plan);
}

export function getUsageLimit(plan: Plan, feature: "analyses" | "competitors"): number {
  if (plan === "enterprise") return Infinity;
  if (plan === "pro") {
    return feature === "analyses" ? 50 : 5;
  }
  // free
  return feature === "analyses" ? 3 : 1;
}

export function checkUsageLimit(
  plan: Plan,
  feature: "analyses" | "competitors",
  currentUsage: number
): { allowed: boolean; remaining: number; limit: number } {
  const limit = getUsageLimit(plan, feature);
  const remaining = Math.max(0, limit - currentUsage);
  
  return {
    allowed: remaining > 0,
    remaining,
    limit
  };
}

