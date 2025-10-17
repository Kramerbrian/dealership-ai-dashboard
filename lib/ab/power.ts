/**
 * A/B Testing Statistical Power Analysis
 * Calculates statistical power and sample size requirements
 */

export interface PowerAnalysisConfig {
  significanceLevel: number // Alpha level (default 0.05)
  power: number // Desired power (default 0.8)
  effectSize: number // Minimum detectable effect size
  baselineRate: number // Baseline conversion rate
  allocationRatio: number // Traffic allocation ratio (default 0.5)
}

export interface PowerAnalysisResult {
  requiredSampleSize: number
  actualPower: number
  detectableEffect: number
  confidence: number
  recommendations: string[]
}

const DEFAULT_CONFIG: PowerAnalysisConfig = {
  significanceLevel: 0.05,
  power: 0.8,
  effectSize: 0.1, // 10% relative effect
  baselineRate: 0.1, // 10% baseline conversion
  allocationRatio: 0.5
}

/**
 * Calculate required sample size for A/B test
 */
export function calculateRequiredSampleSize(
  config: PowerAnalysisConfig = DEFAULT_CONFIG
): PowerAnalysisResult {
  const { significanceLevel, power, effectSize, baselineRate, allocationRatio } = config
  
  // Calculate effect size in absolute terms
  const absoluteEffect = baselineRate * effectSize
  const treatmentRate = baselineRate + absoluteEffect
  
  // Calculate pooled standard error
  const pooledRate = baselineRate * allocationRatio + treatmentRate * (1 - allocationRatio)
  const standardError = Math.sqrt(
    pooledRate * (1 - pooledRate) * (1 / allocationRatio + 1 / (1 - allocationRatio))
  )
  
  // Calculate z-scores
  const zAlpha = inverseNormalCDF(1 - significanceLevel / 2)
  const zBeta = inverseNormalCDF(power)
  
  // Calculate required sample size
  const requiredSampleSize = Math.ceil(
    Math.pow((zAlpha + zBeta) * standardError / absoluteEffect, 2)
  )
  
  // Calculate actual power with this sample size
  const actualPower = calculateActualPower(
    requiredSampleSize,
    baselineRate,
    treatmentRate,
    allocationRatio,
    significanceLevel
  )
  
  // Calculate detectable effect
  const detectableEffect = (zAlpha + zBeta) * standardError / Math.sqrt(requiredSampleSize)
  
  const recommendations: string[] = []
  
  if (requiredSampleSize > 10000) {
    recommendations.push('Large sample size required - consider increasing effect size or reducing significance level')
  }
  
  if (actualPower < 0.7) {
    recommendations.push('Low statistical power - consider increasing sample size or effect size')
  }
  
  if (effectSize < 0.05) {
    recommendations.push('Very small effect size - ensure practical significance')
  }
  
  return {
    requiredSampleSize,
    actualPower: Math.round(actualPower * 1000) / 1000,
    detectableEffect: Math.round(detectableEffect * 1000) / 1000,
    confidence: (1 - significanceLevel) * 100,
    recommendations
  }
}

/**
 * Calculate actual power for given sample size
 */
function calculateActualPower(
  sampleSize: number,
  baselineRate: number,
  treatmentRate: number,
  allocationRatio: number,
  significanceLevel: number
): number {
  const pooledRate = baselineRate * allocationRatio + treatmentRate * (1 - allocationRatio)
  const standardError = Math.sqrt(
    pooledRate * (1 - pooledRate) * (1 / allocationRatio + 1 / (1 - allocationRatio)) / sampleSize
  )
  
  const zAlpha = inverseNormalCDF(1 - significanceLevel / 2)
  const effectSize = Math.abs(treatmentRate - baselineRate)
  
  const zBeta = (effectSize / standardError) - zAlpha
  
  return normalCDF(zBeta)
}

/**
 * Calculate minimum detectable effect
 */
export function calculateMinimumDetectableEffect(
  sampleSize: number,
  baselineRate: number,
  allocationRatio: number = 0.5,
  significanceLevel: number = 0.05,
  power: number = 0.8
): number {
  const zAlpha = inverseNormalCDF(1 - significanceLevel / 2)
  const zBeta = inverseNormalCDF(power)
  
  const pooledRate = baselineRate * allocationRatio + baselineRate * (1 - allocationRatio)
  const standardError = Math.sqrt(
    pooledRate * (1 - pooledRate) * (1 / allocationRatio + 1 / (1 - allocationRatio)) / sampleSize
  )
  
  return (zAlpha + zBeta) * standardError
}

/**
 * Normal CDF approximation
 */
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)))
}

/**
 * Inverse normal CDF approximation
 */
function inverseNormalCDF(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('Probability must be between 0 and 1')
  }
  
  // Beasley-Springer-Moro algorithm
  const a = [0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239]
  const b = [0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [0, -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [0, 7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
  
  const pLow = 0.02425
  const pHigh = 1 - pLow
  
  let x: number
  
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p))
    x = (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
        ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1)
  } else if (p <= pHigh) {
    const q = p - 0.5
    const r = q * q
    x = (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q /
        (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1)
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p))
    x = -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
        ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1)
  }
  
  return x
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

/**
 * Calculate sample size for A/B test
 */
export function calculateSampleSize(
  baseline: number,
  uplift: number,
  alpha: number = 0.05,
  power: number = 0.8,
  alternative: 'two-sided' | 'one-sided' = 'two-sided'
): number {
  const p1 = baseline
  const p2 = p1 * (1 + uplift)
  
  const zAlpha = alternative === 'two-sided' ? inverseNormalCDF(1 - alpha / 2) : inverseNormalCDF(1 - alpha)
  const zBeta = inverseNormalCDF(power)
  
  const pooledP = (p1 + p2) / 2
  const standardError = Math.sqrt(pooledP * (1 - pooledP) * 2)
  
  const effectSize = Math.abs(p2 - p1)
  const sampleSize = Math.pow((zAlpha + zBeta) * standardError / effectSize, 2)
  
  return Math.ceil(sampleSize)
}

/**
 * Validate test parameters
 */
export function validateTestParameters(params: {
  baseline: number
  uplift: number
  alpha: number
  power: number
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (params.baseline <= 0 || params.baseline >= 1) {
    errors.push('Baseline must be between 0 and 1')
  }
  
  if (params.uplift <= 0) {
    errors.push('Uplift must be positive')
  }
  
  if (params.alpha <= 0 || params.alpha >= 1) {
    errors.push('Alpha must be between 0 and 1')
  }
  
  if (params.power <= 0 || params.power >= 1) {
    errors.push('Power must be between 0 and 1')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Calculate power for given parameters
 */
export function calculatePower(
  sampleSize: number,
  baseline: number,
  uplift: number,
  alpha: number = 0.05,
  alternative: 'two-sided' | 'one-sided' = 'two-sided'
): number {
  const p1 = baseline
  const p2 = p1 * (1 + uplift)
  
  const zAlpha = alternative === 'two-sided' ? inverseNormalCDF(1 - alpha / 2) : inverseNormalCDF(1 - alpha)
  
  const pooledP = (p1 + p2) / 2
  const standardError = Math.sqrt(pooledP * (1 - pooledP) * 2 / sampleSize)
  
  const effectSize = Math.abs(p2 - p1)
  const zBeta = (effectSize / standardError) - zAlpha
  
  return normalCDF(zBeta)
}