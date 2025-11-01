import { DAI_ALGO } from "@/lib/ai/formulas";

export interface ElasticityCoefficient {
  pillar: string;
  β: number; // Elasticity coefficient
  confidence: number;
}

/**
 * Calculate elasticity coefficients (β) for each pillar based on market events
 */
export function calculateElasticity(
  historicalImpacts: Array<{ pillar: string; impact: number; eventType: string }>
): ElasticityCoefficient[] {
  const pillarCoefficients: Record<string, { sum: number; count: number }> = {};

  historicalImpacts.forEach((impact) => {
    if (!pillarCoefficients[impact.pillar]) {
      pillarCoefficients[impact.pillar] = { sum: 0, count: 0 };
    }
    pillarCoefficients[impact.pillar].sum += impact.impact;
    pillarCoefficients[impact.pillar].count += 1;
  });

  return Object.entries(pillarCoefficients).map(([pillar, data]) => ({
    pillar,
    β: data.count > 0 ? data.sum / data.count : 0,
    confidence: Math.min(1, data.count / 10), // More data = higher confidence
  }));
}

/**
 * Adjust λ weights based on elasticity and market events
 */
export function adjustWeights(
  elasticityCoeffs: ElasticityCoefficient[],
  currentEventSeverity: "low" | "medium" | "high" | "critical"
): Record<string, number> {
  const severityMultiplier: Record<string, number> = {
    low: 1.0,
    medium: 1.1,
    high: 1.25,
    critical: 1.5,
  };

  const baseWeights = DAI_ALGO.qai_quantum_authority_index.weights;
  const adjusted: Record<string, number> = {};

  elasticityCoeffs.forEach((coeff) => {
    const weightKey = coeff.pillar === "ai_visibility" ? "λ₁" :
                      coeff.pillar === "zero_click_shield" ? "λ₂" :
                      coeff.pillar === "ugc_health" ? "λ₃" :
                      coeff.pillar === "geo_trust" ? "λ₄" :
                      coeff.pillar === "sgp_integrity" ? "λ₅" : null;

    if (weightKey) {
      const base = baseWeights[weightKey as keyof typeof baseWeights] || 0;
      const adjustment = coeff.β * severityMultiplier[currentEventSeverity] * coeff.confidence;
      adjusted[weightKey] = Math.max(0, Math.min(1, base + adjustment));
    }
  });

  // Normalize weights to sum to 1
  const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    Object.keys(adjusted).forEach((key) => {
      adjusted[key] = adjusted[key] / sum;
    });
  }

  return adjusted;
}

