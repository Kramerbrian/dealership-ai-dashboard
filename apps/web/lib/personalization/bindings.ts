/**
 * Personalization Token Bindings
 * Applies overrides based on token matches
 */

import type { PersonalizationTokens, TrustScoreWeights } from './tokens';

export interface WeightOverride {
  match: Record<string, any>;
  apply: {
    'trust_score.weights': Partial<TrustScoreWeights>;
  };
}

export interface ThresholdOverride {
  match: Record<string, any>;
  apply: {
    targets: Record<string, number>;
  };
}

export interface UIOverride {
  match: Record<string, any>;
  apply: {
    dashboard?: {
      default_tab?: string;
      kpis?: string[];
    };
    ui?: {
      animations?: 'on' | 'off';
    };
  };
}

export interface PLGOverride {
  match: Record<string, any>;
  apply: {
    widget?: {
      teaser_metrics?: number;
      rate_limit_ip_hour?: number;
    };
    referral?: {
      trial_extension_days?: number;
    };
  };
}

export interface AutofixPolicy {
  match: Record<string, any>;
  apply: {
    auto_fix: {
      mode: 'auto_approve' | 'manual_review';
    };
  };
}

export interface TokenBindings {
  weights_overrides: WeightOverride[];
  thresholds_overrides: ThresholdOverride[];
  ui_overrides: UIOverride[];
  plg_overrides: PLGOverride[];
  autofix_policy: AutofixPolicy[];
}

/**
 * Default bindings from spec
 */
export const DEFAULT_BINDINGS: TokenBindings = {
  weights_overrides: [
    {
      match: { 'identity.geo_tier': 'metro', 'role.role': 'marketing' },
      apply: {
        'trust_score.weights': {
          reviews: 0.30,
          ai: 0.18,
          business_identity: 0.18,
        },
      },
    },
    {
      match: { 'identity.geo_tier': 'rural', 'role.role': 'gm' },
      apply: {
        'trust_score.weights': {
          business_identity: 0.28,
          reviews: 0.22,
        },
      },
    },
  ],
  thresholds_overrides: [
    {
      match: { 'identity.brand': 'Toyota', 'cohort.bench_percentile': { $gte: 70 } },
      apply: {
        targets: {
          freshness_score: 90,
        },
      },
    },
    {
      match: { 'risk.volatility_index': { $gt: 1.4 } },
      apply: {
        targets: {
          zero_click_coverage: 70,
        },
      },
    },
  ],
  ui_overrides: [
    {
      match: { 'role.role': 'gm' },
      apply: {
        dashboard: {
          default_tab: 'Overview',
          kpis: ['trust_score', 'rar', 'trend_30d'],
        },
      },
    },
    {
      match: { 'role.role': 'marketing' },
      apply: {
        dashboard: {
          default_tab: 'E-E-A-T',
          kpis: ['eeat_score', 'schema_coverage', 'ai_mention_rate'],
        },
      },
    },
    {
      match: { 'preferences.motion_reduced': true },
      apply: {
        ui: {
          animations: 'off',
        },
      },
    },
  ],
  plg_overrides: [
    {
      match: { 'intent.funnel_stage': 'anon' },
      apply: {
        widget: {
          teaser_metrics: 5,
          rate_limit_ip_hour: 3,
        },
      },
    },
    {
      match: { 'intent.funnel_stage': 'trial', 'behavior.share_count': { $gte: 1 } },
      apply: {
        referral: {
          trial_extension_days: 21,
        },
      },
    },
  ],
  autofix_policy: [
    {
      match: { 'maturity.trust_maturity': 'scale', 'risk.eeat_conflict_count': 0 },
      apply: {
        auto_fix: {
          mode: 'auto_approve',
        },
      },
    },
    {
      match: { 'maturity.trust_maturity': 'seed' },
      apply: {
        auto_fix: {
          mode: 'manual_review',
        },
      },
    },
  ],
};

/**
 * Match tokens against a condition
 */
function matchesCondition(
  tokens: PersonalizationTokens,
  condition: Record<string, any>
): boolean {
  for (const [path, value] of Object.entries(condition)) {
    const tokenValue = getNestedValue(tokens, path);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle operators like $gte, $gt, etc.
      if (value.$gte !== undefined) {
        if (tokenValue < value.$gte) return false;
      }
      if (value.$gt !== undefined) {
        if (tokenValue <= value.$gt) return false;
      }
      if (value.$lte !== undefined) {
        if (tokenValue > value.$lte) return false;
      }
      if (value.$lt !== undefined) {
        if (tokenValue >= value.$lt) return false;
      }
      if (value.$in !== undefined) {
        if (!value.$in.includes(tokenValue)) return false;
      }
    } else {
      // Exact match
      if (tokenValue !== value) return false;
    }
  }
  return true;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Apply bindings to tokens and return resolved configuration
 */
export function applyBindings(
  tokens: PersonalizationTokens,
  bindings: TokenBindings = DEFAULT_BINDINGS
): {
  weights?: Partial<TrustScoreWeights>;
  thresholds?: Record<string, number>;
  ui?: UIOverride['apply'];
  plg?: PLGOverride['apply'];
  autofix?: AutofixPolicy['apply'];
} {
  const result: {
    weights?: Partial<TrustScoreWeights>;
    thresholds?: Record<string, number>;
    ui?: UIOverride['apply'];
    plg?: PLGOverride['apply'];
    autofix?: AutofixPolicy['apply'];
  } = {};

  // Apply weight overrides
  for (const override of bindings.weights_overrides) {
    if (matchesCondition(tokens, override.match)) {
      result.weights = {
        ...result.weights,
        ...override.apply['trust_score.weights'],
      };
    }
  }

  // Apply threshold overrides
  for (const override of bindings.thresholds_overrides) {
    if (matchesCondition(tokens, override.match)) {
      result.thresholds = {
        ...result.thresholds,
        ...override.apply.targets,
      };
    }
  }

  // Apply UI overrides
  for (const override of bindings.ui_overrides) {
    if (matchesCondition(tokens, override.match)) {
      result.ui = {
        ...result.ui,
        ...override.apply,
      };
    }
  }

  // Apply PLG overrides
  for (const override of bindings.plg_overrides) {
    if (matchesCondition(tokens, override.match)) {
      result.plg = {
        ...result.plg,
        ...override.apply,
      };
    }
  }

  // Apply autofix policy
  for (const policy of bindings.autofix_policy) {
    if (matchesCondition(tokens, policy.match)) {
      result.autofix = policy.apply;
      break; // First match wins
    }
  }

  return result;
}

