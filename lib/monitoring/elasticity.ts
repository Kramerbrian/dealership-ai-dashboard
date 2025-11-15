// Elasticity Monitoring & Guardrails
// DealershipAI - Prometheus metrics and R² stability guardrails

// @ts-ignore
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Prometheus Metrics
export const elasticityComputationCounter = new Counter({
  name: 'elasticity_computations_total',
  help: 'Total number of elasticity computations',
  labelNames: ['tenant_id', 'vertical', 'status']
});

export const elasticityComputationDuration = new Histogram({
  name: 'elasticity_computation_duration_seconds',
  help: 'Duration of elasticity computations in seconds',
  labelNames: ['tenant_id', 'vertical']
});

export const elasticityRSquaredGauge = new Gauge({
  name: 'elasticity_r_squared',
  help: 'R-squared value of elasticity models',
  labelNames: ['tenant_id', 'vertical']
});

export const elasticityConfidenceGauge = new Gauge({
  name: 'elasticity_confidence',
  help: 'Confidence level of elasticity models',
  labelNames: ['tenant_id', 'vertical']
});

export const elasticityDataPointsGauge = new Gauge({
  name: 'elasticity_data_points',
  help: 'Number of data points used in elasticity computation',
  labelNames: ['tenant_id', 'vertical']
});

// Register metrics
register.registerMetric(elasticityComputationCounter);
register.registerMetric(elasticityComputationDuration);
register.registerMetric(elasticityRSquaredGauge);
register.registerMetric(elasticityConfidenceGauge);
register.registerMetric(elasticityDataPointsGauge);

// Guardrails
export interface ElasticityGuardrails {
  minRSquared: number;
  minDataPoints: number;
  maxDataPoints: number;
  minConfidence: number;
  maxElasticityChange: number;
  maxDefinitionChange: number;
}

export const DEFAULT_GUARDRAILS: ElasticityGuardrails = {
  minRSquared: 0.3,
  minDataPoints: 10,
  maxDataPoints: 1000,
  minConfidence: 0.5,
  maxElasticityChange: 0.5, // 50% change from previous
  maxDefinitionChange: 0.1   // 10% change in methodology
};

export interface ElasticityValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

export function validateElasticityModel(
  current: { elasticity: number; rSquared: number; confidence: number; dataPoints: number },
  previous?: { elasticity: number; rSquared: number; confidence: number; dataPoints: number },
  guardrails: ElasticityGuardrails = DEFAULT_GUARDRAILS
): ElasticityValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations: string[] = [];

  // R² validation
  if (current.rSquared < guardrails.minRSquared) {
    errors.push(`R² (${current.rSquared.toFixed(3)}) below minimum threshold (${guardrails.minRSquared})`);
    recommendations.push('Collect more data or review AIV calculation methodology');
  } else if (current.rSquared < 0.5) {
    warnings.push(`Low R² (${current.rSquared.toFixed(3)}) indicates weak correlation`);
    recommendations.push('Consider improving data quality or increasing sample size');
  }

  // Data points validation
  if (current.dataPoints < guardrails.minDataPoints) {
    errors.push(`Insufficient data points (${current.dataPoints}) for reliable elasticity calculation`);
    recommendations.push('Wait for more data before computing elasticity');
  } else if (current.dataPoints > guardrails.maxDataPoints) {
    warnings.push(`Large dataset (${current.dataPoints} points) may include outdated data`);
    recommendations.push('Consider using a rolling window for more recent trends');
  }

  // Confidence validation
  if (current.confidence < guardrails.minConfidence) {
    errors.push(`Low confidence (${current.confidence.toFixed(3)}) in elasticity model`);
    recommendations.push('Improve data quality or increase sample size');
  }

  // Stability validation (if previous data available)
  if (previous) {
    const elasticityChange = Math.abs(current.elasticity - previous.elasticity) / previous.elasticity;
    if (elasticityChange > guardrails.maxElasticityChange) {
      warnings.push(`Significant elasticity change (${(elasticityChange * 100).toFixed(1)}%) detected`);
      recommendations.push('Review recent changes in business model or data collection');
    }

    const rSquaredChange = Math.abs(current.rSquared - previous.rSquared);
    if (rSquaredChange > guardrails.maxDefinitionChange) {
      warnings.push(`Significant R² change (${(rSquaredChange * 100).toFixed(1)}%) detected`);
      recommendations.push('Investigate potential changes in data quality or methodology');
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    warnings,
    errors,
    recommendations
  };
}

export function logElasticityMetrics(
  tenantId: string,
  vertical: string,
  elasticity: number,
  rSquared: number,
  confidence: number,
  dataPoints: number,
  status: 'success' | 'failed' | 'warning',
  duration: number
) {
  // Update counters
  elasticityComputationCounter.inc({ tenant_id: tenantId, vertical, status });
  
  // Update histograms
  elasticityComputationDuration.observe({ tenant_id: tenantId, vertical }, duration);
  
  // Update gauges
  elasticityRSquaredGauge.set({ tenant_id: tenantId, vertical }, rSquared);
  elasticityConfidenceGauge.set({ tenant_id: tenantId, vertical }, confidence);
  elasticityDataPointsGauge.set({ tenant_id: tenantId, vertical }, dataPoints);

  // Log to console
  console.log(`📊 Elasticity metrics logged for ${tenantId}/${vertical}:`, {
    elasticity: elasticity.toFixed(2),
    rSquared: rSquared.toFixed(3),
    confidence: confidence.toFixed(3),
    dataPoints,
    status,
    duration: `${duration.toFixed(2)}s`
  });
}

export function getElasticityMetrics() {
  return register.metrics();
}
