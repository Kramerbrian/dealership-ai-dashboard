import algo from "@/docs/dai_algorithm_engine_v2.json";

export type DAIAlgo = typeof algo;
export const DAI_ALGO: DAIAlgo = algo as DAIAlgo;
export const getQAIFormula = () => DAI_ALGO.qai_quantum_authority_index.formula;
export const PILLARS = Object.keys(DAI_ALGO.pillar_formulas) as Array<
  keyof typeof DAI_ALGO.pillar_formulas
>;

// Helper functions
export function getPillarWeight(pillar: keyof typeof DAI_ALGO.pillar_formulas): number {
  const weights = DAI_ALGO.qai_quantum_authority_index.weights;
  const pillarMap: Record<string, keyof typeof weights> = {
    ai_visibility: "λ₁",
    zero_click_shield: "λ₂",
    ugc_health: "λ₃",
    geo_trust: "λ₄",
    sgp_integrity: "λ₅",
  };
  return weights[pillarMap[pillar]] || 0;
}

export function calculateQAI(pillarScores: {
  ai_visibility: number;
  zero_click_shield: number;
  ugc_health: number;
  geo_trust: number;
  sgp_integrity: number;
}): number {
  const weights = DAI_ALGO.qai_quantum_authority_index.weights;
  return (
    weights["λ₁"] * pillarScores.ai_visibility +
    weights["λ₂"] * pillarScores.zero_click_shield +
    weights["λ₃"] * pillarScores.ugc_health +
    weights["λ₄"] * pillarScores.geo_trust +
    weights["λ₅"] * pillarScores.sgp_integrity
  );
}

// Formula coefficients for backward compatibility
export const FORMULA_COEFFICIENTS = {
  weights: {
    λ_aiv: 0.25,
    λ_ati: 0.20,
    λ_zero_click: 0.25,
    λ_ugc: 0.15,
    λ_geo: 0.15,
  }
};

// Pulse score types
export interface PulseScoreInput {
  signals: {
    aiv: number;
    ati: number;
    zero_click: number;
    ugc_health: number;
    geo_trust: number;
  };
  timeDelta?: number;
  penalties?: Record<string, number>;
}

export interface PulseScoreOutput {
  pulse_score: number;
  signals: {
    aiv: number;
    ati: number;
    zero_click: number;
    ugc_health: number;
    geo_trust: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    velocity: number;
    acceleration: number;
  };
  recommendations: string[];
  confidence: number;
  timestamp: Date;
}

// Calculate pulse score from signals
export function calculatePulseScore(input: PulseScoreInput): PulseScoreOutput {
  const { signals, timeDelta = 0, penalties = {} } = input;

  // Calculate weighted score
  const weights = FORMULA_COEFFICIENTS.weights;
  let score =
    weights.λ_aiv * signals.aiv +
    weights.λ_ati * signals.ati +
    weights.λ_zero_click * signals.zero_click +
    weights.λ_ugc * signals.ugc_health +
    weights.λ_geo * signals.geo_trust;

  // Apply penalties
  Object.values(penalties).forEach(penalty => {
    score -= penalty;
  });

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Generate recommendations based on weak signals
  const recommendations: string[] = [];
  if (signals.aiv < 50) recommendations.push('Improve AI Visibility through content optimization');
  if (signals.ati < 50) recommendations.push('Enhance Algorithmic Trust with schema markup');
  if (signals.zero_click < 50) recommendations.push('Strengthen Zero-Click Defense strategies');
  if (signals.ugc_health < 50) recommendations.push('Monitor and improve UGC Health');
  if (signals.geo_trust < 50) recommendations.push('Build Geo Trust through local citations');

  return {
    pulse_score: Math.round(score * 10) / 10,
    signals,
    trends: {
      direction: 'stable',
      velocity: 0,
      acceleration: 0,
    },
    recommendations,
    confidence: 0.85,
    timestamp: new Date(),
  };
}
