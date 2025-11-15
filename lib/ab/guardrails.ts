// @ts-nocheck
/**
 * A/B Testing Guardrails Module
 * Prevents harmful experiments and ensures ethical testing
 */

export interface GuardrailConfig {
  maxExperimentDuration: number // Maximum experiment duration in days
  minSignificanceLevel: number // Minimum statistical significance
  maxRiskLevel: number // Maximum acceptable risk level
  requireApproval: boolean // Whether experiments require approval
  blockedMetrics: string[] // Metrics that cannot be tested
  blockedSegments: string[] // User segments that cannot be tested
}

export interface ExperimentRequest {
  name: string
  description: string
  variants: string[]
  metrics: string[]
  segments: string[]
  duration: number
  trafficAllocation: number
  hypothesis: string
}

export interface GuardrailResult {
  approved: boolean
  warnings: string[]
  errors: string[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
  requiredApprovals: string[]
}

const DEFAULT_CONFIG: GuardrailConfig = {
  maxExperimentDuration: 30, // 30 days max
  minSignificanceLevel: 0.05, // 5% significance level
  maxRiskLevel: 0.7, // 70% max risk
  requireApproval: true,
  blockedMetrics: ['revenue', 'conversion_rate', 'customer_satisfaction'],
  blockedSegments: ['premium_customers', 'enterprise_customers']
}

/**
 * Check experiment guardrails
 */
export function checkExperimentGuardrails(
  request: ExperimentRequest,
  config: GuardrailConfig = DEFAULT_CONFIG
): GuardrailResult {
  const warnings: string[] = []
  const errors: string[] = []
  const recommendations: string[] = []
  const requiredApprovals: string[] = []
  
  // Check experiment duration
  if (request.duration > config.maxExperimentDuration) {
    errors.push(`Experiment duration too long: ${request.duration} days > ${config.maxExperimentDuration} days`)
    recommendations.push('Reduce experiment duration or request exception')
  }
  
  // Check blocked metrics
  const blockedMetrics = request.metrics.filter(metric => 
    config.blockedMetrics.includes(metric)
  )
  if (blockedMetrics.length > 0) {
    errors.push(`Blocked metrics detected: ${blockedMetrics.join(', ')}`)
    recommendations.push('Remove blocked metrics or request approval')
    requiredApprovals.push('blocked_metrics')
  }
  
  // Check blocked segments
  const blockedSegments = request.segments.filter(segment => 
    config.blockedSegments.includes(segment)
  )
  if (blockedSegments.length > 0) {
    errors.push(`Blocked segments detected: ${blockedSegments.join(', ')}`)
    recommendations.push('Remove blocked segments or request approval')
    requiredApprovals.push('blocked_segments')
  }
  
  // Check traffic allocation
  if (request.trafficAllocation > 50) {
    warnings.push(`High traffic allocation: ${request.trafficAllocation}%`)
    recommendations.push('Consider reducing traffic allocation for safety')
    requiredApprovals.push('high_traffic')
  }
  
  // Check hypothesis quality
  if (!request.hypothesis || request.hypothesis.length < 50) {
    warnings.push('Hypothesis too short or missing')
    recommendations.push('Provide a detailed hypothesis explaining expected outcomes')
  }
  
  // Calculate risk level
  let riskScore = 0
  if (request.duration > 14) riskScore += 0.2
  if (request.trafficAllocation > 30) riskScore += 0.2
  if (blockedMetrics.length > 0) riskScore += 0.3
  if (blockedSegments.length > 0) riskScore += 0.3
  
  const riskLevel = riskScore > 0.6 ? 'high' : riskScore > 0.3 ? 'medium' : 'low'
  
  // Check if approval is required
  if (config.requireApproval && (requiredApprovals.length > 0 || riskLevel === 'high')) {
    requiredApprovals.push('general_approval')
  }
  
  const approved = errors.length === 0 && (!config.requireApproval || requiredApprovals.length === 0)
  
  return {
    approved,
    warnings,
    errors,
    recommendations,
    riskLevel,
    requiredApprovals
  }
}

/**
 * Validate experiment request
 */
export function validateExperimentRequest(request: ExperimentRequest): string[] {
  const errors: string[] = []
  
  if (!request.name || request.name.length < 3) {
    errors.push('Experiment name must be at least 3 characters')
  }
  
  if (!request.variants || request.variants.length < 2) {
    errors.push('At least 2 variants are required')
  }
  
  if (!request.metrics || request.metrics.length === 0) {
    errors.push('At least one metric is required')
  }
  
  if (request.duration <= 0) {
    errors.push('Experiment duration must be positive')
  }
  
  if (request.trafficAllocation <= 0 || request.trafficAllocation > 100) {
    errors.push('Traffic allocation must be between 0 and 100')
  }
  
  return errors
}

/**
 * Check statistical significance
 */
export function checkStatisticalSignificance(
  controlValue: number,
  treatmentValue: number,
  sampleSize: number,
  significanceLevel: number = 0.05
): { significant: boolean; pValue: number; confidence: number } {
  // Simplified statistical test
  const difference = Math.abs(treatmentValue - controlValue)
  const standardError = Math.sqrt((controlValue * (1 - controlValue)) / sampleSize)
  const zScore = difference / standardError
  
  // Approximate p-value calculation
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))
  const significant = pValue < significanceLevel
  const confidence = (1 - pValue) * 100
  
  return {
    significant,
    pValue: Math.round(pValue * 10000) / 10000,
    confidence: Math.round(confidence * 100) / 100
  }
}

/**
 * Evaluate guardrails for metrics
 */
export function evaluateGuardrails(metrics: any[], customGuardrails: any[] = []): any {
  const results = {
    passed: true,
    violations: [],
    warnings: [],
    score: 100
  }
  
  // Basic guardrail checks
  metrics.forEach((metric, index) => {
    if (metric.value < 0) {
      results.violations.push(`Metric ${index}: Negative value not allowed`)
      results.passed = false
      results.score -= 10
    }
    
    if (metric.value > 100 && metric.type === 'percentage') {
      results.warnings.push(`Metric ${index}: Percentage value exceeds 100%`)
      results.score -= 5
    }
  })
  
  return results
}

/**
 * Validate guardrail configuration
 */
export function validateGuardrailConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.maxExperimentDuration || config.maxExperimentDuration <= 0) {
    errors.push('maxExperimentDuration must be positive')
  }
  
  if (!config.minSignificanceLevel || config.minSignificanceLevel <= 0 || config.minSignificanceLevel >= 1) {
    errors.push('minSignificanceLevel must be between 0 and 1')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Calculate guardrail score
 */
export function calculateGuardrailScore(
  experiment: ExperimentRequest,
  config: GuardrailConfig = DEFAULT_CONFIG
): number {
  let score = 100
  
  // Duration penalty
  if (experiment.duration > config.maxExperimentDuration) {
    score -= 20
  }
  
  // Traffic allocation penalty
  if (experiment.trafficAllocation > 50) {
    score -= 15
  }
  
  // Blocked metrics penalty
  const blockedMetrics = experiment.metrics.filter(m => config.blockedMetrics.includes(m))
  score -= blockedMetrics.length * 10
  
  // Blocked segments penalty
  const blockedSegments = experiment.segments.filter(s => config.blockedSegments.includes(s))
  score -= blockedSegments.length * 10
  
  return Math.max(0, score)
}

/**
 * Normal CDF approximation
 */
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)))
}

/**
 * Error function approximation
 */
function erf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  
  return sign * y
}