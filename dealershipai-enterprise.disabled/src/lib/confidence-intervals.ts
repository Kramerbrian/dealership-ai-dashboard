/**
 * Confidence Interval Calculations for DealershipAI Analytics
 * Provides statistical confidence intervals for various metrics
 */

interface ConfidenceInterval {
  mean: number
  lower: number
  upper: number
  confidence: number
  sampleSize: number
}

/**
 * Calculate confidence interval for AI Visibility scores
 * @param scores Array of AI visibility scores
 * @param confidence Confidence level (default: 0.95 for 95%)
 * @returns Confidence interval object
 */
export function aiVisibilityCI(scores: number[], confidence: number = 0.95): ConfidenceInterval {
  const n = scores.length
  const mean = scores.reduce((sum, score) => sum + score, 0) / n
  
  // Calculate standard deviation
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  
  // Calculate standard error
  const standardError = stdDev / Math.sqrt(n)
  
  // Get critical value (t-distribution for small samples, normal for large)
  const criticalValue = n < 30 ? getTValue(confidence, n - 1) : getZValue(confidence)
  
  // Calculate margin of error
  const marginOfError = criticalValue * standardError
  
  return {
    mean: Math.round(mean * 10) / 10,
    lower: Math.round((mean - marginOfError) * 10) / 10,
    upper: Math.round((mean + marginOfError) * 10) / 10,
    confidence,
    sampleSize: n
  }
}

/**
 * Calculate confidence interval for conversion rate
 * @param conversions Number of conversions
 * @param total Number of total visitors/impressions
 * @param confidence Confidence level (default: 0.95 for 95%)
 * @returns Confidence interval object
 */
export function conversionRateCI(conversions: number, total: number, confidence: number = 0.95): ConfidenceInterval {
  const p = conversions / total
  const n = total
  
  // Use normal approximation for large samples
  if (n * p >= 5 && n * (1 - p) >= 5) {
    const standardError = Math.sqrt((p * (1 - p)) / n)
    const criticalValue = getZValue(confidence)
    const marginOfError = criticalValue * standardError
    
    return {
      mean: Math.round(p * 1000) / 1000,
      lower: Math.max(0, Math.round((p - marginOfError) * 1000) / 1000),
      upper: Math.min(1, Math.round((p + marginOfError) * 1000) / 1000),
      confidence,
      sampleSize: n
    }
  }
  
  // Use Wilson score interval for small samples
  return wilsonScoreInterval(conversions, total, confidence)
}

/**
 * Calculate confidence interval for revenue data
 * @param revenues Array of revenue values
 * @param confidence Confidence level (default: 0.95 for 95%)
 * @returns Confidence interval object
 */
export function revenueCI(revenues: number[], confidence: number = 0.95): ConfidenceInterval {
  const n = revenues.length
  const mean = revenues.reduce((sum, revenue) => sum + revenue, 0) / n
  
  // Calculate standard deviation
  const variance = revenues.reduce((sum, revenue) => sum + Math.pow(revenue - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  
  // Calculate standard error
  const standardError = stdDev / Math.sqrt(n)
  
  // Get critical value
  const criticalValue = n < 30 ? getTValue(confidence, n - 1) : getZValue(confidence)
  
  // Calculate margin of error
  const marginOfError = criticalValue * standardError
  
  return {
    mean: Math.round(mean),
    lower: Math.round(mean - marginOfError),
    upper: Math.round(mean + marginOfError),
    confidence,
    sampleSize: n
  }
}

/**
 * Calculate confidence interval for click-through rate
 * @param clicks Number of clicks
 * @param impressions Number of impressions
 * @param confidence Confidence level (default: 0.95 for 95%)
 * @returns Confidence interval object
 */
export function clickThroughRateCI(clicks: number, impressions: number, confidence: number = 0.95): ConfidenceInterval {
  return conversionRateCI(clicks, impressions, confidence)
}

/**
 * Calculate confidence interval for average session duration
 * @param durations Array of session durations in seconds
 * @param confidence Confidence level (default: 0.95 for 95%)
 * @returns Confidence interval object
 */
export function sessionDurationCI(durations: number[], confidence: number = 0.95): ConfidenceInterval {
  const n = durations.length
  const mean = durations.reduce((sum, duration) => sum + duration, 0) / n
  
  const variance = durations.reduce((sum, duration) => sum + Math.pow(duration - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  const standardError = stdDev / Math.sqrt(n)
  
  const criticalValue = n < 30 ? getTValue(confidence, n - 1) : getZValue(confidence)
  const marginOfError = criticalValue * standardError
  
  return {
    mean: Math.round(mean),
    lower: Math.round(mean - marginOfError),
    upper: Math.round(mean + marginOfError),
    confidence,
    sampleSize: n
  }
}

/**
 * Calculate confidence interval for bounce rate
 * @param bounces Number of bounces
 * @param sessions Number of sessions
 * @param confidence Confidence level (default: 0.95 for 95%)
 * @returns Confidence interval object
 */
export function bounceRateCI(bounces: number, sessions: number, confidence: number = 0.95): ConfidenceInterval {
  return conversionRateCI(bounces, sessions, confidence)
}

/**
 * Wilson Score Interval for binomial proportions
 * More accurate for small samples and extreme proportions
 */
function wilsonScoreInterval(successes: number, trials: number, confidence: number = 0.95): ConfidenceInterval {
  const p = successes / trials
  const n = trials
  const z = getZValue(confidence)
  
  const denominator = 1 + (z * z) / n
  const centreAdjustedProbability = (p + (z * z) / (2 * n)) / denominator
  const adjustedStandardDeviation = Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n) / denominator
  
  const lower = centreAdjustedProbability - z * adjustedStandardDeviation
  const upper = centreAdjustedProbability + z * adjustedStandardDeviation
  
  return {
    mean: Math.round(p * 1000) / 1000,
    lower: Math.max(0, Math.round(lower * 1000) / 1000),
    upper: Math.min(1, Math.round(upper * 1000) / 1000),
    confidence,
    sampleSize: n
  }
}

/**
 * Get Z-value for given confidence level
 */
function getZValue(confidence: number): number {
  const zValues: Record<number, number> = {
    0.80: 1.282,
    0.85: 1.440,
    0.90: 1.645,
    0.95: 1.960,
    0.99: 2.576,
    0.999: 3.291
  }
  
  return zValues[confidence] || 1.960
}

/**
 * Get T-value for given confidence level and degrees of freedom
 * Simplified t-distribution critical values
 */
function getTValue(confidence: number, df: number): number {
  // Simplified t-distribution table for common values
  const tTable: Record<number, Record<number, number>> = {
    0.95: {
      1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
      6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
      15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042
    },
    0.99: {
      1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032,
      6: 3.707, 7: 3.499, 8: 3.355, 9: 3.250, 10: 3.169,
      15: 2.947, 20: 2.845, 25: 2.787, 30: 2.750
    }
  }
  
  // For df > 30, use normal approximation
  if (df > 30) {
    return getZValue(confidence)
  }
  
  // Find closest df in table
  const availableDfs = Object.keys(tTable[confidence] || {}).map(Number).sort((a, b) => a - b)
  const closestDf = availableDfs.find(d => d >= df) || availableDfs[availableDfs.length - 1]
  
  return tTable[confidence]?.[closestDf] || getZValue(confidence)
}

/**
 * Format confidence interval for display
 */
export function formatCI(ci: ConfidenceInterval, currency: boolean = false): string {
  const formatValue = (value: number) => {
    if (currency) {
      return `$${value.toLocaleString()}`
    }
    return value.toString()
  }
  
  const confidencePercent = Math.round(ci.confidence * 100)
  return `${formatValue(ci.mean)} (${confidencePercent}% CI: ${formatValue(ci.lower)}-${formatValue(ci.upper)})`
}

/**
 * Calculate statistical significance between two metrics
 */
export function isSignificantDifference(
  metric1: number, 
  metric2: number, 
  se1: number, 
  se2: number, 
  confidence: number = 0.95
): boolean {
  const z = getZValue(confidence)
  const seDiff = Math.sqrt(se1 * se1 + se2 * se2)
  const marginOfError = z * seDiff
  const difference = Math.abs(metric1 - metric2)
  
  return difference > marginOfError
}

/**
 * Calculate sample size needed for desired margin of error
 */
export function calculateSampleSize(
  expectedProportion: number,
  marginOfError: number,
  confidence: number = 0.95
): number {
  const z = getZValue(confidence)
  const n = (z * z * expectedProportion * (1 - expectedProportion)) / (marginOfError * marginOfError)
  return Math.ceil(n)
}

// Example usage functions
export const examples = {
  aiVisibility: () => {
    const scores = [78, 82, 75, 85, 79, 81, 77, 83, 80, 76]
    return aiVisibilityCI(scores)
  },
  
  conversionRate: () => {
    return conversionRateCI(45, 1000)
  },
  
  revenue: () => {
    const revenues = [15000, 18000, 16500, 22000, 19500]
    return revenueCI(revenues)
  }
}

export default {
  aiVisibilityCI,
  conversionRateCI,
  revenueCI,
  clickThroughRateCI,
  sessionDurationCI,
  bounceRateCI,
  formatCI,
  isSignificantDifference,
  calculateSampleSize,
  examples
}
