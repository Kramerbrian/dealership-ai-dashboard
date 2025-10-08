// Algorithmic Visibility Index (™) — DealershipAI
// Proprietary models for AIV™, ATI™, CRS, and Elasticity calculations
// © 2025 DealershipAI Inc. All rights reserved.

export type TemporalWeight = number; // 0-1
export type EntityConfidence = number; // 0-1
export type CrawlBudgetMult = number; // 0-2
export type InventoryTruthMult = number; // 0-1

export interface AIVComponents {
  seo: number; // 0-100
  aeo: number; // 0-100 (AI Engine Optimization)
  geo: number; // 0-100
  ugc: number; // 0-100 (User Generated Content)
  geoLocal: number; // 0-100
}

export interface ClarityLayer {
  scs: number; // Search Clarity Score 0-100
  sis: number; // Search Intent Score 0-100
  adi: number; // Answer Depth Index 0-100
  scr: number; // Search Context Relevance 0-100
}

export interface AIVCalculation {
  baseComponents: AIVComponents;
  temporalWeight: TemporalWeight;
  entityConfidence: EntityConfidence;
  crawlBudgetMult: CrawlBudgetMult;
  inventoryTruthMult: InventoryTruthMult;
  clarityLayer: ClarityLayer;
  finalAIV: number; // 0-100
}

export interface ATIComponents {
  schemaCons: number; // Schema Consistency 0-100
  reviewLegit: number; // Review Legitimacy 0-100
  topicalAuth: number; // Topical Authority 0-100
  sourceCred: number; // Source Credibility 0-100
  srv: number; // Site Reliability Value 0-100
  fps: number; // First Page Score 0-100
  hp: number; // Host Penalty 0-1
  fraudGuard: number; // Fraud Guard Score 0-100
  localAccuracyMult: number; // Local Accuracy Multiplier 0-1
}

export interface ATICalculation {
  components: ATIComponents;
  finalATI: number; // 0-100
}

export interface CRSCalculation {
  aiv: number;
  ati: number;
  varianceWeight: number;
  finalCRS: number; // 0-100
}

export interface ElasticityMetrics {
  deltaRaR: number; // Revenue at Risk change
  deltaAIV: number; // AIV change
  elasticity: number; // $/AIV point
  rSquared: number; // Regression quality
  confidenceInterval: [number, number]; // 95% CI
  valid: boolean; // R² ≥ 0.70
}

export interface SHAPDrivers {
  aivDrivers: Array<{ feature: string; impact: number; direction: 'positive' | 'negative' }>;
  atiDrivers: Array<{ feature: string; impact: number; direction: 'positive' | 'negative' }>;
}

export interface RegionalMetrics {
  region: 'US' | 'CA' | 'UK' | 'AU';
  aiv: number;
  ati: number;
  crs: number;
  elasticity: number;
  marketMultiplier: number;
}

export interface ForecastProjection {
  week: number;
  p10: number; // 10th percentile
  p50: number; // 50th percentile (median)
  p90: number; // 90th percentile
  observed: number;
  counterfactual: number;
}

export interface RegimeDetection {
  regime: 'Normal' | 'Shift Detected' | 'Quarantine';
  rSquared: number;
  inputSigma: number;
  frozen: boolean;
  reason?: string;
}

// Core AIV Calculation
export function calculateAIV(
  components: AIVComponents,
  temporalWeight: TemporalWeight,
  entityConfidence: EntityConfidence,
  crawlBudgetMult: CrawlBudgetMult,
  inventoryTruthMult: InventoryTruthMult,
  clarityLayer: ClarityLayer
): AIVCalculation {
  // Base weighted calculation
  const baseAIV = 
    components.seo * 0.25 +
    components.aeo * 0.30 +
    components.geo * 0.25 +
    components.ugc * 0.10 +
    components.geoLocal * 0.05;

  // Apply modifiers
  const modifiedAIV = baseAIV * temporalWeight * entityConfidence * crawlBudgetMult * inventoryTruthMult;

  // Clarity layer boost (max +25%)
  const clarityBoost = Math.min(0.25, 
    (clarityLayer.scs + clarityLayer.sis + clarityLayer.adi + clarityLayer.scr) / 400
  );

  const finalAIV = Math.min(100, modifiedAIV * (1 + clarityBoost));

  return {
    baseComponents: components,
    temporalWeight,
    entityConfidence,
    crawlBudgetMult,
    inventoryTruthMult,
    clarityLayer,
    finalAIV
  };
}

// Core ATI Calculation
export function calculateATI(components: ATIComponents): ATICalculation {
  const baseATI = 
    components.schemaCons * 0.20 +
    components.reviewLegit * 0.25 +
    components.topicalAuth * 0.20 +
    components.sourceCred * 0.15 +
    components.srv * 0.10 +
    components.fps * 0.10;

  // Apply penalties and multipliers
  const penaltyFactor = (1 - components.hp) * components.fraudGuard / 100;
  const localMultiplier = components.localAccuracyMult;

  const finalATI = Math.min(100, baseATI * penaltyFactor * localMultiplier);

  return {
    components,
    finalATI
  };
}

// CRS Calculation (Bayesian fusion)
export function calculateCRS(aiv: number, ati: number, varianceWeight: number = 0.5): CRSCalculation {
  // Bayesian fusion with variance weighting
  const weightedAIV = aiv * varianceWeight;
  const weightedATI = ati * (1 - varianceWeight);
  
  const finalCRS = weightedAIV + weightedATI;

  return {
    aiv,
    ati,
    varianceWeight,
    finalCRS: Math.min(100, finalCRS)
  };
}

// Elasticity Calculation (8-week rolling regression)
export function calculateElasticity(
  aivHistory: number[],
  revenueHistory: number[],
  weeks: number = 8
): ElasticityMetrics {
  if (aivHistory.length < weeks || revenueHistory.length < weeks) {
    return {
      deltaRaR: 0,
      deltaAIV: 0,
      elasticity: 0,
      rSquared: 0,
      confidenceInterval: [0, 0],
      valid: false
    };
  }

  // Take last 8 weeks
  const recentAIV = aivHistory.slice(-weeks);
  const recentRevenue = revenueHistory.slice(-weeks);

  // Calculate deltas
  const deltaAIV = recentAIV[recentAIV.length - 1] - recentAIV[0];
  const deltaRaR = recentRevenue[recentRevenue.length - 1] - recentRevenue[0];

  // Simple linear regression
  const n = recentAIV.length;
  const sumX = recentAIV.reduce((a, b) => a + b, 0);
  const sumY = recentRevenue.reduce((a, b) => a + b, 0);
  const sumXY = recentAIV.reduce((sum, x, i) => sum + x * recentRevenue[i], 0);
  const sumXX = recentAIV.reduce((sum, x) => sum + x * x, 0);
  const sumYY = recentRevenue.reduce((sum, y) => sum + y * y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const yMean = sumY / n;
  const ssRes = recentRevenue.reduce((sum, y, i) => {
    const predicted = slope * recentAIV[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const ssTot = recentRevenue.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);

  // Calculate confidence interval (simplified)
  const standardError = Math.sqrt(ssRes / (n - 2));
  const margin = 1.96 * standardError; // 95% CI

  return {
    deltaRaR,
    deltaAIV,
    elasticity: slope,
    rSquared,
    confidenceInterval: [slope - margin, slope + margin],
    valid: rSquared >= 0.70
  };
}

// SHAP-style driver analysis
export function calculateSHAPDrivers(aivCalc: AIVCalculation, atiCalc: ATICalculation): SHAPDrivers {
  const aivDrivers = [
    { feature: 'AEO Score', impact: aivCalc.baseComponents.aeo * 0.30, direction: 'positive' as const },
    { feature: 'SEO Score', impact: aivCalc.baseComponents.seo * 0.25, direction: 'positive' as const },
    { feature: 'GEO Score', impact: aivCalc.baseComponents.geo * 0.25, direction: 'positive' as const },
    { feature: 'UGC Score', impact: aivCalc.baseComponents.ugc * 0.10, direction: 'positive' as const },
    { feature: 'Clarity Layer', impact: (aivCalc.clarityLayer.scs + aivCalc.clarityLayer.sis + aivCalc.clarityLayer.adi + aivCalc.clarityLayer.scr) / 4, direction: 'positive' as const }
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const atiDrivers = [
    { feature: 'Review Legitimacy', impact: atiCalc.components.reviewLegit * 0.25, direction: 'positive' as const },
    { feature: 'Schema Consistency', impact: atiCalc.components.schemaCons * 0.20, direction: 'positive' as const },
    { feature: 'Topical Authority', impact: atiCalc.components.topicalAuth * 0.20, direction: 'positive' as const },
    { feature: 'Source Credibility', impact: atiCalc.components.sourceCred * 0.15, direction: 'positive' as const },
    { feature: 'Fraud Guard', impact: atiCalc.components.fraudGuard, direction: 'positive' as const }
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return { aivDrivers, atiDrivers };
}

// Regional calculations
export function calculateRegionalMetrics(
  baseAIV: number,
  baseATI: number,
  baseCRS: number,
  baseElasticity: number,
  region: 'US' | 'CA' | 'UK' | 'AU'
): RegionalMetrics {
  const marketMultipliers = {
    US: 1.0,
    CA: 0.95,
    UK: 0.90,
    AU: 0.85
  };

  const multiplier = marketMultipliers[region];

  return {
    region,
    aiv: baseAIV * multiplier,
    ati: baseATI * multiplier,
    crs: baseCRS * multiplier,
    elasticity: baseElasticity * multiplier,
    marketMultiplier: multiplier
  };
}

// Regime detection
export function detectRegime(rSquared: number, inputSigma: number): RegimeDetection {
  if (rSquared < 0.70) {
    return {
      regime: 'Quarantine',
      rSquared,
      inputSigma,
      frozen: true,
      reason: 'R² below threshold'
    };
  }

  if (inputSigma > 4) {
    return {
      regime: 'Shift Detected',
      rSquared,
      inputSigma,
      frozen: true,
      reason: 'Input > 4σ'
    };
  }

  return {
    regime: 'Normal',
    rSquared,
    inputSigma,
    frozen: false
  };
}

// Demo data for testing
export const DEMO_AIV_COMPONENTS: AIVComponents = {
  seo: 78,
  aeo: 85,
  geo: 72,
  ugc: 68,
  geoLocal: 75
};

export const DEMO_CLARITY_LAYER: ClarityLayer = {
  scs: 82,
  sis: 78,
  adi: 85,
  scr: 80
};

export const DEMO_ATI_COMPONENTS: ATIComponents = {
  schemaCons: 88,
  reviewLegit: 75,
  topicalAuth: 82,
  sourceCred: 85,
  srv: 90,
  fps: 78,
  hp: 0.05, // 5% host penalty
  fraudGuard: 92,
  localAccuracyMult: 0.95
};

export const DEMO_AIV_HISTORY = [72, 74, 76, 78, 80, 82, 84, 86];
export const DEMO_REVENUE_HISTORY = [45000, 46500, 48000, 49500, 51000, 52500, 54000, 55500];
