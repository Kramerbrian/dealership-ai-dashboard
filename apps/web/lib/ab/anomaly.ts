/**
 * Anomaly Detection for A/B Testing
 * Uses Median Absolute Deviation (MAD) to identify outliers in CTR/CVR metrics
 */

export interface AnomalyDataPoint {
  timestamp: Date;
  value: number;
  variantId: string;
  metric: 'ctr' | 'cvr' | 'revenue' | 'bounce_rate';
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  threshold: number;
  method: 'mad' | 'iqr' | 'zscore';
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface AnomalyConfig {
  method: 'mad' | 'iqr' | 'zscore';
  sensitivity: number; // 1-5, higher = more sensitive
  minDataPoints: number;
  excludeAnomalies: boolean; // Whether to exclude anomalies from analysis
}

/**
 * Default anomaly detection configuration
 */
export const DEFAULT_ANOMALY_CONFIG: AnomalyConfig = {
  method: 'mad',
  sensitivity: 3,
  minDataPoints: 7,
  excludeAnomalies: true
};

/**
 * Detect anomalies in time series data using MAD
 * @param data Array of data points
 * @param config Anomaly detection configuration
 * @returns Array of anomaly results
 */
export function detectAnomalies(
  data: AnomalyDataPoint[],
  config: AnomalyConfig = DEFAULT_ANOMALY_CONFIG
): Array<AnomalyResult & { dataPoint: AnomalyDataPoint }> {
  if (data.length < config.minDataPoints) {
    return data.map(point => ({
      dataPoint: point,
      isAnomaly: false,
      score: 0,
      threshold: 0,
      method: config.method,
      severity: 'low' as const,
      recommendation: 'Insufficient data for anomaly detection'
    }));
  }

  const values = data.map(d => d.value);
  const results: Array<AnomalyResult & { dataPoint: AnomalyDataPoint }> = [];
  
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const value = values[i];
    
    let result: AnomalyResult;
    
    switch (config.method) {
      case 'mad':
        result = detectAnomalyMAD(values, i, config.sensitivity);
        break;
      case 'iqr':
        result = detectAnomalyIQR(values, i, config.sensitivity);
        break;
      case 'zscore':
        result = detectAnomalyZScore(values, i, config.sensitivity);
        break;
      default:
        result = detectAnomalyMAD(values, i, config.sensitivity);
    }
    
    results.push({
      ...result,
      dataPoint: point
    });
  }
  
  return results;
}

/**
 * Detect anomaly using Median Absolute Deviation (MAD)
 */
function detectAnomalyMAD(
  values: number[],
  index: number,
  sensitivity: number
): AnomalyResult {
  // Calculate median
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = calculateMedian(sortedValues);
  
  // Calculate MAD
  const deviations = values.map(v => Math.abs(v - median));
    const mad = calculateMedian(deviations);
    
  // Modified Z-score using MAD
  const modifiedZScore = mad > 0 ? 0.6745 * (values[index] - median) / mad : 0;
  const threshold = sensitivity * 2.5; // 2.5 is typical threshold for MAD
  
  const isAnomaly = Math.abs(modifiedZScore) > threshold;
  const score = Math.abs(modifiedZScore);
  
  let severity: 'low' | 'medium' | 'high';
  if (score > threshold * 1.5) {
    severity = 'high';
  } else if (score > threshold) {
    severity = 'medium';
  } else {
    severity = 'low';
  }
  
  return {
    isAnomaly,
    score,
    threshold,
    method: 'mad',
    severity,
    recommendation: getAnomalyRecommendation(severity, 'mad')
  };
}

/**
 * Detect anomaly using Interquartile Range (IQR)
 */
function detectAnomalyIQR(
  values: number[],
  index: number,
  sensitivity: number
): AnomalyResult {
  const sortedValues = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sortedValues, 25);
  const q3 = calculatePercentile(sortedValues, 75);
  const iqr = q3 - q1;
  
  const lowerBound = q1 - sensitivity * 1.5 * iqr;
  const upperBound = q3 + sensitivity * 1.5 * iqr;
  
  const value = values[index];
  const isAnomaly = value < lowerBound || value > upperBound;
  
  let score: number;
  if (value < lowerBound) {
    score = (lowerBound - value) / iqr;
  } else if (value > upperBound) {
    score = (value - upperBound) / iqr;
  } else {
    score = 0;
  }
  
  let severity: 'low' | 'medium' | 'high';
  if (score > sensitivity * 2) {
    severity = 'high';
  } else if (score > sensitivity) {
    severity = 'medium';
  } else {
    severity = 'low';
  }
  
  return {
    isAnomaly,
    score,
    threshold: sensitivity * 1.5,
    method: 'iqr',
    severity,
    recommendation: getAnomalyRecommendation(severity, 'iqr')
  };
}

/**
 * Detect anomaly using Z-Score
 */
function detectAnomalyZScore(
  values: number[],
  index: number,
  sensitivity: number
): AnomalyResult {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) {
    return {
      isAnomaly: false,
      score: 0,
      threshold: sensitivity,
      method: 'zscore',
      severity: 'low',
      recommendation: 'No variance in data'
    };
  }
  
  const zScore = (values[index] - mean) / stdDev;
  const threshold = sensitivity * 2; // 2 standard deviations
  
  const isAnomaly = Math.abs(zScore) > threshold;
  const score = Math.abs(zScore);
  
  let severity: 'low' | 'medium' | 'high';
  if (score > threshold * 1.5) {
    severity = 'high';
  } else if (score > threshold) {
    severity = 'medium';
  } else {
    severity = 'low';
  }
  
  return {
    isAnomaly,
    score,
    threshold,
    method: 'zscore',
    severity,
    recommendation: getAnomalyRecommendation(severity, 'zscore')
  };
}

/**
 * Calculate median of sorted array
 */
function calculateMedian(sortedValues: number[]): number {
  const n = sortedValues.length;
  if (n % 2 === 0) {
    return (sortedValues[n / 2 - 1] + sortedValues[n / 2]) / 2;
  } else {
    return sortedValues[Math.floor(n / 2)];
  }
}

/**
 * Calculate percentile of sorted array
 */
function calculatePercentile(sortedValues: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (upper >= sortedValues.length) {
    return sortedValues[sortedValues.length - 1];
  }
  
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Get recommendation based on anomaly severity and method
 */
function getAnomalyRecommendation(
  severity: 'low' | 'medium' | 'high',
  method: string
): string {
  const recommendations = {
    low: 'Monitor closely - may be normal variation',
    medium: 'Investigate potential causes - could indicate issues',
    high: 'Immediate attention required - likely indicates significant problem'
  };
  
  const methodSpecific = {
    mad: 'MAD method is robust to outliers',
    iqr: 'IQR method is good for skewed distributions',
    zscore: 'Z-score method assumes normal distribution'
  };
  
  return `${recommendations[severity]}. ${methodSpecific[method as keyof typeof methodSpecific]}`;
}

/**
 * Filter out anomalies from data
 */
export function filterAnomalies(
  data: AnomalyDataPoint[],
  config: AnomalyConfig = DEFAULT_ANOMALY_CONFIG
): AnomalyDataPoint[] {
  if (!config.excludeAnomalies) {
    return data;
  }
  
  const anomalyResults = detectAnomalies(data, config);
  return data.filter((_, index) => !anomalyResults[index].isAnomaly);
}

/**
 * Calculate anomaly rate for a dataset
 */
export function calculateAnomalyRate(
  data: AnomalyDataPoint[],
  config: AnomalyConfig = DEFAULT_ANOMALY_CONFIG
): number {
  const anomalyResults = detectAnomalies(data, config);
  const anomalyCount = anomalyResults.filter(r => r.isAnomaly).length;
  return data.length > 0 ? anomalyCount / data.length : 0;
}

/**
 * Get anomaly summary statistics
 */
export function getAnomalySummary(
  data: AnomalyDataPoint[],
  config: AnomalyConfig = DEFAULT_ANOMALY_CONFIG
): {
  totalPoints: number;
  anomalyCount: number;
  anomalyRate: number;
  severityBreakdown: Record<string, number>;
  method: string;
} {
  const anomalyResults = detectAnomalies(data, config);
  const anomalyCount = anomalyResults.filter(r => r.isAnomaly).length;
  
  const severityBreakdown = anomalyResults
    .filter(r => r.isAnomaly)
    .reduce((acc, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  return {
    totalPoints: data.length,
    anomalyCount,
    anomalyRate: data.length > 0 ? anomalyCount / data.length : 0,
    severityBreakdown,
    method: config.method
  };
}