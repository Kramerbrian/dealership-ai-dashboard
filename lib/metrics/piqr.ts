/**
 * PIQR (Performance Impact Quality Risk) Calculator
 * Calculates risk scores based on performance metrics
 */

export interface PIQRInput {
  complianceFails: number;
  warningMultipliers: number;
  schemaLatencyMin: number;
  schemaLatencyBudgetMin: number;
  dupHashCollisionRate: number;
}

export interface PIQRResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  breakdown: {
    compliance: number;
    performance: number;
    quality: number;
  };
  recommendations: string[];
}

export function calculatePIQR(input: PIQRInput): PIQRResult {
  // Calculate individual risk components
  const complianceRisk = Math.min(100, input.complianceFails * 10);
  const performanceRisk = Math.min(100, 
    (input.schemaLatencyMin / input.schemaLatencyBudgetMin) * 50
  );
  const qualityRisk = Math.min(100, input.dupHashCollisionRate * 1000);
  const warningRisk = Math.min(100, input.warningMultipliers * 100);

  // Weighted risk score
  const riskScore = 
    (complianceRisk * 0.3) +
    (performanceRisk * 0.3) +
    (qualityRisk * 0.2) +
    (warningRisk * 0.2);

  return {
    riskScore,
    riskLevel: determineRiskLevel(riskScore),
    breakdown: {
      compliance: complianceRisk,
      performance: performanceRisk,
      quality: qualityRisk
    },
    recommendations: generatePIQRRecommendations(riskScore, {
      compliance: complianceRisk,
      performance: performanceRisk,
      quality: qualityRisk
    })
  };
}

function determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function generatePIQRRecommendations(overallRisk: number, breakdown: any): string[] {
  const recommendations: string[] = [];

  if (breakdown.compliance > 50) {
    recommendations.push('Address compliance failures immediately');
  }
  if (breakdown.performance > 50) {
    recommendations.push('Optimize schema and query performance');
  }
  if (breakdown.quality > 50) {
    recommendations.push('Reduce data quality issues and duplications');
  }

  if (overallRisk > 70) {
    recommendations.push('Implement comprehensive risk mitigation strategy');
  }

  return recommendations;
}