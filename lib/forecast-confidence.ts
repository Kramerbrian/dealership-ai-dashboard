/**
 * Forecast Confidence Interval Calculations
 * 
 * Calculates confidence intervals and detects downward drift in forecasts
 */

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  mean: number;
  confidence: number; // 0-1, where 1 = 100% confidence
}

export interface DriftAlert {
  detected: boolean;
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedKPIs: string[];
  recommendation: string;
}

/**
 * Calculate confidence interval for a forecast value
 * Uses historical error distribution to estimate uncertainty
 */
export function calculateConfidenceInterval(
  predicted: number,
  historicalErrors: number[],
  confidenceLevel: number = 0.95
): ConfidenceInterval {
  if (historicalErrors.length === 0) {
    // No history - use default ±10% uncertainty
    return {
      lower: predicted * 0.9,
      upper: predicted * 1.1,
      mean: predicted,
      confidence: 0.5,
    };
  }

  // Calculate error statistics
  const meanError = historicalErrors.reduce((a, b) => a + b, 0) / historicalErrors.length;
  const variance = historicalErrors.reduce((sum, err) => sum + Math.pow(err - meanError, 2), 0) / historicalErrors.length;
  const stdDev = Math.sqrt(variance);

  // Use z-score for confidence interval (1.96 for 95% confidence)
  const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.58 : 1.65;
  const margin = zScore * stdDev;

  // Calculate confidence score (inverse of relative error)
  const relativeError = stdDev / Math.abs(predicted);
  const confidence = Math.max(0, Math.min(1, 1 - relativeError));

  return {
    lower: Math.max(0, predicted - margin),
    upper: Math.min(100, predicted + margin),
    mean: predicted,
    confidence,
  };
}

/**
 * Detect downward drift in forecast trends
 * Compares current predictions with historical averages
 */
export function detectDrift(
  currentPredictions: Record<string, number>,
  historicalAverages: Record<string, number>,
  threshold: number = 0.05 // 5% decline threshold
): DriftAlert {
  const affectedKPIs: string[] = [];
  const declines: Array<{ kpi: string; decline: number }> = [];

  Object.keys(currentPredictions).forEach((kpi) => {
    const current = currentPredictions[kpi];
    const historical = historicalAverages[kpi];

    if (historical && current < historical) {
      const decline = (historical - current) / historical;
      if (decline >= threshold) {
        affectedKPIs.push(kpi);
        declines.push({ kpi, decline });
      }
    }
  });

  if (affectedKPIs.length === 0) {
    return {
      detected: false,
      severity: 'low',
      message: 'No significant drift detected',
      affectedKPIs: [],
      recommendation: 'Continue monitoring',
    };
  }

  // Determine severity based on decline magnitude
  const maxDecline = Math.max(...declines.map(d => d.decline));
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (maxDecline >= 0.15) severity = 'high';
  else if (maxDecline >= 0.10) severity = 'medium';

  const recommendations: Record<string, string> = {
    high: 'Immediate action required. Review schema fixes, review velocity, and operational efficiency.',
    medium: 'Investigate root causes. Check for schema issues, review response rates, and inventory aging.',
    low: 'Monitor trends. Review recent changes and ensure optimization initiatives are on track.',
  };

  return {
    detected: true,
    severity,
    message: `Downward drift detected in ${affectedKPIs.length} KPI(s): ${affectedKPIs.join(', ')}. Max decline: ${(maxDecline * 100).toFixed(1)}%`,
    affectedKPIs,
    recommendation: recommendations[severity],
  };
}

/**
 * Calculate confidence intervals for all KPIs in a forecast
 */
export function calculateForecastConfidenceIntervals(
  predictions: Record<string, number>,
  historicalErrors: Record<string, number[]>,
  confidenceLevel: number = 0.95
): Record<string, ConfidenceInterval> {
  const intervals: Record<string, ConfidenceInterval> = {};

  Object.keys(predictions).forEach((kpi) => {
    intervals[kpi] = calculateConfidenceInterval(
      predictions[kpi],
      historicalErrors[kpi] || [],
      confidenceLevel
    );
  });

  return intervals;
}

