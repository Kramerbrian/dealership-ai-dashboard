/**
 * Bindings for Dynamic Trust Score Calculation
 * Applies personalized weights and rules based on dealer context
 */

import { ResolvedTokens } from './tokens';
import { DEFAULT_TRUST_WEIGHTS } from '@/lib/trust/core-metrics';

export interface TrustBindings {
  weights: typeof DEFAULT_TRUST_WEIGHTS;
  thresholds: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  multipliers: {
    geo_boost?: number;
    premium_tier?: number;
  };
}

/**
 * Apply bindings based on resolved tokens
 * Returns customized trust score weights and thresholds
 */
export function applyBindings(tokens: ResolvedTokens): TrustBindings {
  const bindings: TrustBindings = {
    weights: { ...DEFAULT_TRUST_WEIGHTS },
    thresholds: {
      excellent: 0.85,
      good: 0.70,
      fair: 0.55,
      poor: 0.40,
    },
    multipliers: {},
  };

  // Apply geo-specific adjustments
  if (tokens.identity.geo_tier === 'tier1') {
    // Tier 1 markets (major metros) - emphasize AI mentions more
    bindings.weights.ai_mentions = 0.25;
    bindings.weights.zero_click = 0.18;
    bindings.weights.freshness = 0.12;
    bindings.multipliers.geo_boost = 1.1;
  } else if (tokens.identity.geo_tier === 'tier2') {
    // Tier 2 markets - balance between traditional and AI
    bindings.weights.ai_mentions = 0.20;
    bindings.weights.reviews = 0.18;
    bindings.multipliers.geo_boost = 1.05;
  } else if (tokens.identity.geo_tier === 'tier3') {
    // Tier 3 markets - emphasize traditional signals
    bindings.weights.reviews = 0.22;
    bindings.weights.business_identity = 0.25;
    bindings.weights.ai_mentions = 0.15;
    bindings.multipliers.geo_boost = 1.0;
  }

  // Apply tenant-specific adjustments
  if (tokens.identity.group_id) {
    // Multi-location dealer groups get bonus for consistent identity
    bindings.weights.business_identity = Math.min(
      bindings.weights.business_identity + 0.05,
      0.30
    );
  }

  // Normalize weights to sum to 1.0
  const totalWeight = Object.values(bindings.weights).reduce((a, b) => a + b, 0);
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    const normalizationFactor = 1.0 / totalWeight;
    Object.keys(bindings.weights).forEach(key => {
      bindings.weights[key as keyof typeof bindings.weights] *= normalizationFactor;
    });
  }

  return bindings;
}

/**
 * Calculate final trust score with applied bindings
 */
export function calculateBoundTrustScore(
  baseScore: number,
  bindings: TrustBindings
): number {
  let finalScore = baseScore;

  // Apply multipliers
  if (bindings.multipliers.geo_boost) {
    finalScore *= bindings.multipliers.geo_boost;
  }

  if (bindings.multipliers.premium_tier) {
    finalScore *= bindings.multipliers.premium_tier;
  }

  // Cap at 1.0
  return Math.min(finalScore, 1.0);
}

/**
 * Get score tier label based on thresholds
 */
export function getScoreTier(
  score: number,
  bindings: TrustBindings
): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (score >= bindings.thresholds.excellent) return 'excellent';
  if (score >= bindings.thresholds.good) return 'good';
  if (score >= bindings.thresholds.fair) return 'fair';
  if (score >= bindings.thresholds.poor) return 'poor';
  return 'critical';
}
