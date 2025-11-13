/**
 * DealershipAI Hyper-Intelligence Scoring Engine
 * Advanced scoring algorithms for inventory freshness, retail readiness, and compliance
 */

export interface InventoryItem {
  id: string;
  vin: string;
  dealerId: string;
  freshnessScore: number;
  lastPriceChange: Date;
  lastPhotoRefresh: Date;
  lastMileageUpdate: Date;
  retailReadyScore: number;
  parityMatchRate: number;
  stickerParityScore: number;
  policyComplianceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoringWeights {
  freshness: number;
  parity: number;
  sticker: number;
  policy: number;
}

export interface ScoringResult {
  score: number;
  breakdown: {
    freshness: number;
    parity: number;
    sticker: number;
    policy: number;
  };
  recommendations: string[];
  confidence: number;
}

/**
 * Calculate freshness score based on data recency
 * Formula: 100 - 0.5*(hours_price/168) - 0.3*(hours_photo/720) - 0.2*(hours_mileage/168)
 */
export function calculateFreshnessScore(item: InventoryItem): number {
  const now = new Date();
  
  const priceHours = (now.getTime() - item.lastPriceChange.getTime()) / (1000 * 60 * 60);
  const photoHours = (now.getTime() - item.lastPhotoRefresh.getTime()) / (1000 * 60 * 60);
  const mileageHours = (now.getTime() - item.lastMileageUpdate.getTime()) / (1000 * 60 * 60);
  
  const freshnessScore = Math.max(0, 100 - 
    (0.5 * (priceHours / 168)) - 
    (0.3 * (photoHours / 720)) - 
    (0.2 * (mileageHours / 168))
  );
  
  return Math.round(freshnessScore * 100) / 100;
}

/**
 * Calculate retail readiness score
 * Formula: 0.3*freshness + 0.35*matchRate + 0.2*sticker + 0.15*policy
 */
export function calculateRetailReadiness(
  item: InventoryItem,
  weights: ScoringWeights = {
    freshness: 0.3,
    parity: 0.35,
    sticker: 0.2,
    policy: 0.15
  }
): ScoringResult {
  const freshness = item.freshnessScore;
  const parity = item.parityMatchRate;
  const sticker = item.stickerParityScore;
  const policy = item.policyComplianceScore;
  
  const score = (
    weights.freshness * freshness +
    weights.parity * parity +
    weights.sticker * sticker +
    weights.policy * policy
  );
  
  const breakdown = {
    freshness: Math.round(freshness * 100) / 100,
    parity: Math.round(parity * 100) / 100,
    sticker: Math.round(sticker * 100) / 100,
    policy: Math.round(policy * 100) / 100
  };
  
  const recommendations = generateRecommendations(breakdown);
  const confidence = calculateConfidence(breakdown);
  
  return {
    score: Math.round(score * 100) / 100,
    breakdown,
    recommendations,
    confidence
  };
}

/**
 * Calculate policy compliance score based on pricing transparency
 */
export function calculatePolicyComplianceScore(item: InventoryItem): number {
  let score = 100;
  
  // Check for deceptive pricing patterns
  if (item.parityMatchRate < 90) {
    score -= 20; // Penalty for price inconsistencies
  }
  
  // Check for missing disclosures
  if (item.stickerParityScore < 95) {
    score -= 15; // Penalty for incomplete sticker data
  }
  
  // Check for stale data
  if (item.freshnessScore < 70) {
    score -= 25; // Penalty for outdated information
  }
  
  return Math.max(0, score);
}

/**
 * Calculate sticker parity score using OCR validation
 */
export function calculateStickerParityScore(item: InventoryItem): number {
  // This would integrate with OCR service in production
  // For now, return a mock score based on data completeness
  let score = 100;
  
  // Penalize for missing or stale data
  if (item.freshnessScore < 80) {
    score -= 10;
  }
  
  if (item.parityMatchRate < 85) {
    score -= 15;
  }
  
  return Math.max(0, score);
}

/**
 * Generate recommendations based on score breakdown
 */
function generateRecommendations(breakdown: any): string[] {
  const recommendations: string[] = [];
  
  if (breakdown.freshness < 70) {
    recommendations.push('Update pricing and photos more frequently');
  }
  
  if (breakdown.parity < 80) {
    recommendations.push('Fix data inconsistencies across sales channels');
  }
  
  if (breakdown.sticker < 90) {
    recommendations.push('Improve window sticker data accuracy');
  }
  
  if (breakdown.policy < 85) {
    recommendations.push('Review pricing policies for transparency');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Data quality is excellent - maintain current practices');
  }
  
  return recommendations;
}

/**
 * Calculate confidence level based on data quality
 */
function calculateConfidence(breakdown: any): number {
  let confidence = 0.8; // Base confidence
  
  // Adjust based on individual scores
  const avgScore = (breakdown.freshness + breakdown.parity + breakdown.sticker + breakdown.policy) / 4;
  
  if (avgScore >= 90) {
    confidence = 0.95;
  } else if (avgScore >= 80) {
    confidence = 0.9;
  } else if (avgScore >= 70) {
    confidence = 0.85;
  } else if (avgScore >= 60) {
    confidence = 0.8;
  } else {
    confidence = 0.7;
  }
  
  return Math.round(confidence * 100) / 100;
}

/**
 * Calculate inventory integrity score
 */
export function calculateInventoryIntegrity(items: InventoryItem[]): number {
  if (items.length === 0) return 0;
  
  const totalScore = items.reduce((sum, item) => sum + item.retailReadyScore, 0);
  const avgScore = totalScore / items.length;
  
  // Weight by number of items
  const integrityScore = avgScore * Math.min(1, items.length / 100);
  
  return Math.round(integrityScore * 100) / 100;
}

/**
 * Calculate pricing consistency score
 */
export function calculatePricingConsistency(items: InventoryItem[]): number {
  if (items.length === 0) return 0;
  
  const totalParity = items.reduce((sum, item) => sum + item.parityMatchRate, 0);
  const avgParity = totalParity / items.length;
  
  return Math.round(avgParity * 100) / 100;
}

/**
 * Calculate checkout reliability score
 */
export function calculateCheckoutReliability(items: InventoryItem[]): number {
  if (items.length === 0) return 0;
  
  const retailReadyItems = items.filter(item => item.retailReadyScore >= 85);
  const reliabilityScore = (retailReadyItems.length / items.length) * 100;
  
  return Math.round(reliabilityScore * 100) / 100;
}

/**
 * Calculate revenue at risk
 */
export function calculateRevenueAtRisk(items: InventoryItem[]): number {
  const avgVehicleValue = 35000; // Average vehicle value
  const riskItems = items.filter(item => item.retailReadyScore < 85);
  const riskPercentage = riskItems.length / items.length;
  
  return Math.round(riskPercentage * avgVehicleValue * items.length);
}

/**
 * Batch scoring for multiple items
 */
export function batchScoreItems(items: InventoryItem[]): ScoringResult[] {
  return items.map(item => calculateRetailReadiness(item));
}

/**
 * Get scoring summary for dealer
 */
export function getScoringSummary(items: InventoryItem[]) {
  const scores = batchScoreItems(items);
  
  const summary = {
    totalItems: items.length,
    avgRetailReady: 0,
    retailReadyCount: 0,
    highRiskCount: 0,
    recommendations: [] as string[],
    confidence: 0
  };
  
  if (items.length > 0) {
    const totalScore = scores.reduce((sum, result) => sum + result.score, 0);
    summary.avgRetailReady = Math.round((totalScore / items.length) * 100) / 100;
    summary.retailReadyCount = scores.filter(result => result.score >= 85).length;
    summary.highRiskCount = scores.filter(result => result.score < 70).length;
    
    // Aggregate recommendations
    const allRecommendations = scores.flatMap(result => result.recommendations);
    summary.recommendations = [...new Set(allRecommendations)];
    
    // Average confidence
    const totalConfidence = scores.reduce((sum, result) => sum + result.confidence, 0);
    summary.confidence = Math.round((totalConfidence / items.length) * 100) / 100;
  }
  
  return summary;
}