/**
 * DealershipAI Core Scoring Algorithm (dAI Model)
 * 
 * Implements the deterministic scoring engine for:
 * - ATI (Algorithmic Trust Index)
 * - AIV (AI Visibility Index) 
 * - VLI (Vehicle Listing Integrity)
 * - OI (Offer Integrity)
 * - GBP (Google Business Profile Health)
 * - RRS (Review & Reputation Score)
 * - WX (Web Experience)
 * - IFR (Inventory Freshness Recency)
 * - CIS (Clarity Intelligence Score)
 * 
 * @version 2.0.0
 * @author DealershipAI Team
 */

export interface KPIMetrics {
  // Core Visibility Metrics
  ati: number;           // Algorithmic Trust Index (0-100)
  aiv: number;           // AI Visibility Index (0-100)
  vli: number;           // Vehicle Listing Integrity (0-100)
  oi: number;            // Offer Integrity (0-100)
  gbp: number;           // Google Business Profile Health (0-100)
  rrs: number;           // Review & Reputation Score (0-100)
  wx: number;            // Web Experience (0-100)
  ifr: number;           // Inventory Freshness Recency (0-100)
  cis: number;           // Clarity Intelligence Score (0-100)
  
  // Penalty Factors
  policyViolations: number;    // Policy violations count
  parityDeltas: number;        // Data parity inconsistencies
  stalenessScore: number;      // Data staleness (0-100, higher = more stale)
  
  // Context Data
  tenantId: string;
  timestamp: Date;
  domain: string;
  marketRegion: string;
}

export interface ScoringWeights {
  // Core Pillar Weights (must sum to 1.0)
  ati: number;
  aiv: number;
  vli: number;
  oi: number;
  gbp: number;
  rrs: number;
  wx: number;
  ifr: number;
  cis: number;
  
  // Penalty Multipliers
  policyPenalty: number;      // Multiplier for policy violations
  parityPenalty: number;      // Multiplier for parity issues
  stalenessPenalty: number;   // Multiplier for stale data
}

export interface ScoringResult {
  overallScore: number;        // Final weighted score (0-100)
  pillarScores: KPIMetrics;   // Individual pillar scores
  weights: ScoringWeights;    // Applied weights
  penalties: {
    policy: number;
    parity: number;
    staleness: number;
    total: number;
  };
  diagnostics: {
    confidence: number;        // Confidence in score (0-100)
    dataQuality: number;      // Data quality score (0-100)
    lastUpdated: Date;
    version: string;
  };
  recommendations: string[];   // Actionable recommendations
}

// Default weights (calibrated from historical data)
const DEFAULT_WEIGHTS: ScoringWeights = {
  ati: 0.15,      // Algorithmic Trust Index
  aiv: 0.20,      // AI Visibility Index (highest weight)
  vli: 0.12,      // Vehicle Listing Integrity
  oi: 0.10,       // Offer Integrity
  gbp: 0.12,      // Google Business Profile
  rrs: 0.10,      // Review & Reputation
  wx: 0.08,       // Web Experience
  ifr: 0.08,      // Inventory Freshness
  cis: 0.05,      // Clarity Intelligence
  
  // Penalty multipliers
  policyPenalty: 0.15,     // 15% reduction per policy violation
  parityPenalty: 0.10,     // 10% reduction per parity issue
  stalenessPenalty: 0.05,  // 5% reduction per staleness point
};

/**
 * Calculate the overall DealershipAI score
 * @param metrics - KPI metrics
 * @param weights - Scoring weights (optional)
 * @param dealerId - Dealer ID for RaR pressure lookup (optional, async RaR integration)
 */
export async function calculateDealershipAIScore(
  metrics: KPIMetrics,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  dealerId?: string
): Promise<ScoringResult> {
  // Validate weights sum to 1.0
  const weightSum = Object.values(weights).slice(0, 9).reduce((sum, w) => sum + w, 0);
  if (Math.abs(weightSum - 1.0) > 0.01) {
    throw new Error(`Weights must sum to 1.0, got ${weightSum}`);
  }

  // Apply RaR pressure adjustments if dealerId provided
  let adjustedAIV = metrics.aiv;
  let adjustedATI = metrics.ati;
  let rarDeltas: {
    aivDelta: number;
    atiDelta: number;
    qaiDelta: number;
  } | null = null;

  if (dealerId) {
    try {
      const { getRaRPressure, calculateRaRScoreDeltas } = await import('@/lib/scoring/rar-integration');
      const rarData = await getRaRPressure(dealerId);
      
      const deltas = calculateRaRScoreDeltas(
        metrics.aiv,
        metrics.ati,
        metrics.cis, // Using CIS as QAI proxy
        rarData.pressure,
        rarData.trend
      );
      
      adjustedAIV = deltas.aivAdjusted;
      adjustedATI = deltas.atiAdjusted;
      rarDeltas = {
        aivDelta: deltas.aivDelta,
        atiDelta: deltas.atiDelta,
        qaiDelta: deltas.qaiDelta,
      };
    } catch (error) {
      console.warn('RaR integration error, using base scores:', error);
    }
  }

  // Calculate weighted pillar score with RaR-adjusted metrics
  const pillarScore = 
    (adjustedATI * weights.ati) +
    (adjustedAIV * weights.aiv) +
    (metrics.vli * weights.vli) +
    (metrics.oi * weights.oi) +
    (metrics.gbp * weights.gbp) +
    (metrics.rrs * weights.rrs) +
    (metrics.wx * weights.wx) +
    (metrics.ifr * weights.ifr) +
    (metrics.cis * weights.cis);

  // Calculate penalties
  const policyPenalty = Math.min(metrics.policyViolations * weights.policyPenalty, 0.5);
  const parityPenalty = Math.min(metrics.parityDeltas * weights.parityPenalty, 0.3);
  const stalenessPenalty = Math.min(metrics.stalenessScore * weights.stalenessPenalty, 0.2);
  
  const totalPenalty = policyPenalty + parityPenalty + stalenessPenalty;

  // Apply penalties to get final score
  const finalScore = Math.max(0, Math.min(100, pillarScore * (1 - totalPenalty)));

  // Calculate confidence based on data quality
  const dataQuality = calculateDataQuality(metrics);
  const confidence = Math.min(95, dataQuality * 0.8 + 20);

  // Generate recommendations
  const recommendations = generateRecommendations(metrics, weights);

  return {
    overallScore: Math.round(finalScore * 100) / 100,
    pillarScores: {
      ...metrics,
      aiv: adjustedAIV, // Include RaR-adjusted values
      ati: adjustedATI,
    },
    weights,
    penalties: {
      policy: policyPenalty,
      parity: parityPenalty,
      staleness: stalenessPenalty,
      total: totalPenalty,
    },
    diagnostics: {
      confidence,
      dataQuality,
      lastUpdated: new Date(),
      version: '2.0.0',
      ...(rarDeltas && { rarDeltas }), // Include RaR deltas in diagnostics
    },
    recommendations,
  };
}

/**
 * Calculate data quality score based on completeness and consistency
 */
function calculateDataQuality(metrics: KPIMetrics): number {
  const scores = [
    metrics.ati, metrics.aiv, metrics.vli, metrics.oi,
    metrics.gbp, metrics.rrs, metrics.wx, metrics.ifr, metrics.cis
  ];
  
  // Check for missing data (0 scores)
  const missingData = scores.filter(score => score === 0).length;
  const completeness = 1 - (missingData / scores.length);
  
  // Check for consistency (scores should be in reasonable range)
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
  const consistency = Math.max(0, 1 - (variance / 1000)); // Normalize variance
  
  return Math.round((completeness * 0.6 + consistency * 0.4) * 100);
}

/**
 * Generate actionable recommendations based on scores and penalties
 */
function generateRecommendations(metrics: KPIMetrics, weights: ScoringWeights): string[] {
  const recommendations: string[] = [];
  
  // Low scoring pillars
  if (metrics.ati < 60) {
    recommendations.push("Improve algorithmic trust by fixing schema markup and data consistency");
  }
  if (metrics.aiv < 70) {
    recommendations.push("Boost AI visibility by optimizing for search engines and AI platforms");
  }
  if (metrics.vli < 65) {
    recommendations.push("Enhance vehicle listing integrity with complete, accurate data");
  }
  if (metrics.oi < 60) {
    recommendations.push("Improve offer integrity by ensuring transparent pricing and terms");
  }
  if (metrics.gbp < 70) {
    recommendations.push("Optimize Google Business Profile with complete information and recent reviews");
  }
  if (metrics.rrs < 65) {
    recommendations.push("Build reputation through customer reviews and testimonials");
  }
  if (metrics.wx < 70) {
    recommendations.push("Enhance web experience with faster loading and better mobile optimization");
  }
  if (metrics.ifr < 60) {
    recommendations.push("Keep inventory fresh with regular updates and removal of sold vehicles");
  }
  if (metrics.cis < 50) {
    recommendations.push("Improve clarity with better content structure and clear value propositions");
  }
  
  // Penalty-based recommendations
  if (metrics.policyViolations > 0) {
    recommendations.push(`Address ${metrics.policyViolations} policy violations immediately`);
  }
  if (metrics.parityDeltas > 0) {
    recommendations.push("Fix data parity issues across all platforms");
  }
  if (metrics.stalenessScore > 30) {
    recommendations.push("Update stale data to improve accuracy and trust");
  }
  
  // High-impact recommendations
  if (metrics.aiv < 50 && weights.aiv > 0.15) {
    recommendations.push("PRIORITY: Focus on AI visibility - this is your highest weighted metric");
  }
  
  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Elastic Net weight learning for weekly recalibration
 */
export function learnWeights(
  historicalData: Array<{ metrics: KPIMetrics; outcomes: { leads: number; revenue: number } }>,
  currentWeights: ScoringWeights = DEFAULT_WEIGHTS
): ScoringWeights {
  // Simple ridge regression implementation
  // In production, this would use a proper ML library
  
  const learningRate = 0.01;
  const regularization = 0.1;
  
  // Calculate gradients based on correlation with outcomes
  const gradients = calculateGradients(historicalData);
  
  // Update weights with regularization
  const newWeights = { ...currentWeights };
  
  Object.keys(gradients).forEach(key => {
    if (key in newWeights) {
      const gradient = gradients[key as keyof ScoringWeights];
      if (gradient !== undefined) {
        const currentWeight = newWeights[key as keyof ScoringWeights] as number;
        newWeights[key as keyof ScoringWeights] = Math.max(0, 
          currentWeight - learningRate * (gradient + regularization * currentWeight)
        ) as any;
      }
    }
  });
  
  // Normalize weights to sum to 1.0
  return normalizeWeights(newWeights);
}

/**
 * Calculate gradients for weight learning
 */
function calculateGradients(
  data: Array<{ metrics: KPIMetrics; outcomes: { leads: number; revenue: number } }>
): Partial<ScoringWeights> {
  const gradients: Partial<ScoringWeights> = {};
  
  // Calculate correlation between each pillar and outcomes
  const pillars = ['ati', 'aiv', 'vli', 'oi', 'gbp', 'rrs', 'wx', 'ifr', 'cis'] as const;
  
  pillars.forEach(pillar => {
    const pillarScores = data.map(d => d.metrics[pillar]);
    const outcomes = data.map(d => d.outcomes.leads + d.outcomes.revenue * 0.1); // Weighted outcome
    
    const correlation = calculateCorrelation(pillarScores, outcomes);
    gradients[pillar] = -correlation; // Negative gradient for minimization
  });
  
  return gradients;
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * (y[i] ?? 0), 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Normalize weights to sum to 1.0
 */
function normalizeWeights(weights: ScoringWeights): ScoringWeights {
  const pillars = ['ati', 'aiv', 'vli', 'oi', 'gbp', 'rrs', 'wx', 'ifr', 'cis'] as const;
  const pillarSum = pillars.reduce((sum, pillar) => sum + (weights[pillar] || 0), 0);
  
  if (pillarSum === 0) return weights;
  
  const normalized = { ...weights };
  pillars.forEach(pillar => {
    normalized[pillar] = (weights[pillar] || 0) / pillarSum;
  });
  
  return normalized;
}

/**
 * Generate mock metrics for testing
 */
export function generateMockMetrics(tenantId: string, domain: string): KPIMetrics {
  return {
    ati: Math.floor(Math.random() * 40) + 50,  // 50-90
    aiv: Math.floor(Math.random() * 40) + 50,  // 50-90
    vli: Math.floor(Math.random() * 40) + 50,  // 50-90
    oi: Math.floor(Math.random() * 40) + 50,   // 50-90
    gbp: Math.floor(Math.random() * 40) + 50,  // 50-90
    rrs: Math.floor(Math.random() * 40) + 50,  // 50-90
    wx: Math.floor(Math.random() * 40) + 50,   // 50-90
    ifr: Math.floor(Math.random() * 40) + 50,  // 50-90
    cis: Math.floor(Math.random() * 40) + 50,  // 50-90
    
    policyViolations: Math.floor(Math.random() * 3),      // 0-2
    parityDeltas: Math.floor(Math.random() * 5),          // 0-4
    stalenessScore: Math.floor(Math.random() * 30) + 10,  // 10-40
    
    tenantId,
    timestamp: new Date(),
    domain,
    marketRegion: 'US-CA',
  };
}


// Export default weights for external use
export { DEFAULT_WEIGHTS };

// Export singleton instance for new API
export const scoringEngine = {
  calculateScore: calculateDealershipAIScore,
  learnWeights,
  generateMockMetrics,
};

export default {
  calculateDealershipAIScore,
  learnWeights,
  generateMockMetrics,
  DEFAULT_WEIGHTS,
};