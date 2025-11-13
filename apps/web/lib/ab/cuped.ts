/**
 * CUPED (Controlled-experiment Using Pre-Experiment Data) Implementation
 * Reduces variance in A/B testing by using pre-experiment metrics as covariates
 */

export interface CupedStats {
  theta: number;
  meanX: number;
  variance: number;
  correlation: number;
}

export interface CupedDataPoint {
  x: number; // pre-experiment metric (e.g., prior CTR)
  y: number; // current metric (e.g., current CTR)
}

/**
 * Fit CUPED model using pre-experiment data
 * @param data Array of {x, y} pairs where x is pre-experiment, y is current
 * @returns CUPED statistics including theta coefficient
 */
export function fitCupedModel(data: CupedDataPoint[]): CupedStats {
  if (data.length === 0) {
    return { theta: 0, meanX: 0, variance: 0, correlation: 0 };
  }

  const n = data.length;
  const meanX = data.reduce((sum, d) => sum + d.x, 0) / n;
  const meanY = data.reduce((sum, d) => sum + d.y, 0) / n;

  // Calculate covariance and variance
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (const point of data) {
    const dx = point.x - meanX;
    const dy = point.y - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }

  covariance /= n;
  varianceX /= n;
  varianceY /= n;

  // Calculate theta (regression coefficient)
  const theta = varianceX > 0 ? covariance / varianceX : 0;

  // Calculate correlation
  const correlation = Math.sqrt(varianceX * varianceY) > 0 
    ? covariance / Math.sqrt(varianceX * varianceY) 
    : 0;

  return {
    theta,
    meanX,
    variance: varianceX,
    correlation: Math.abs(correlation)
  };
}

/**
 * Apply CUPED adjustment to current metric
 * @param y Current metric value
 * @param x Pre-experiment metric value
 * @param stats CUPED model statistics
 * @returns Adjusted metric value
 */
export function cupedAdjust(y: number, x: number, stats: CupedStats): number {
  return y - stats.theta * (x - stats.meanX);
}

/**
 * Calculate variance reduction from CUPED
 * @param stats CUPED model statistics
 * @returns Variance reduction factor (0-1, where 1 = 100% reduction)
 */
export function cupedVarianceReduction(stats: CupedStats): number {
  return stats.correlation * stats.correlation;
}

/**
 * Batch process CUPED adjustments for multiple data points
 * @param data Array of current metrics with pre-experiment values
 * @param stats CUPED model statistics
 * @returns Array of adjusted metrics
 */
export function batchCupedAdjust(
  data: Array<{ y: number; x: number }>,
  stats: CupedStats
): number[] {
  return data.map(point => cupedAdjust(point.y, point.x, stats));
}

/**
 * Calculate confidence interval for CUPED-adjusted metric
 * @param adjustedValue CUPED-adjusted metric value
 * @param originalVariance Original metric variance
 * @param cupedStats CUPED model statistics
 * @param confidenceLevel Confidence level (default 0.95)
 * @returns Confidence interval bounds
 */
export function cupedConfidenceInterval(
  adjustedValue: number,
  originalVariance: number,
  cupedStats: CupedStats,
  confidenceLevel: number = 0.95
): { lower: number; upper: number; margin: number } {
  const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;
  
  // CUPED reduces variance by correlation^2
  const varianceReduction = cupedVarianceReduction(cupedStats);
  const adjustedVariance = originalVariance * (1 - varianceReduction);
  const standardError = Math.sqrt(adjustedVariance);
  const margin = zScore * standardError;

  return {
    lower: adjustedValue - margin,
    upper: adjustedValue + margin,
    margin
  };
}