/**
 * Model Validation and Benchmarking Utilities
 * Implements residual analysis, RMSE, R², and confidence interval validation
 */

export interface ModelMetrics {
  rmse: number;
  r2: number;
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  confidence: number;
  month: string;
  sampleSize: number;
}

export interface PredictionResult {
  predicted: number;
  observed: number;
  residual: number;
  confidence: number;
  timestamp: string;
}

export interface BenchmarkLog {
  rmse: number;
  r2: number;
  month: string;
  timestamp: string;
  modelVersion: string;
  sampleSize: number;
}

/**
 * Calculate model validation metrics
 */
export function calculateModelMetrics(
  observedAIV: number[],
  predictedAIV: number[],
  month: string,
  confidence?: number
): ModelMetrics {
  if (observedAIV.length !== predictedAIV.length) {
    throw new Error('Observed and predicted arrays must have the same length');
  }

  const n = observedAIV.length;
  
  // Calculate residuals
  const residuals = observedAIV.map((obs, i) => obs - predictedAIV[i]);
  
  // RMSE (Root Mean Square Error)
  const rmse = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / n);
  
  // MAE (Mean Absolute Error)
  const mae = residuals.reduce((s, r) => s + Math.abs(r), 0) / n;
  
  // MAPE (Mean Absolute Percentage Error)
  const mape = residuals.reduce((s, r, i) => {
    const observed = observedAIV[i];
    return s + (observed !== 0 ? Math.abs(r / observed) : 0);
  }, 0) / n * 100;
  
  // R² (Coefficient of Determination)
  const meanObserved = observedAIV.reduce((s, obs) => s + obs, 0) / n;
  const ssRes = residuals.reduce((s, r) => s + r * r, 0); // Sum of squares of residuals
  const ssTot = observedAIV.reduce((s, obs) => s + Math.pow(obs - meanObserved, 2), 0); // Total sum of squares
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  
  return {
    rmse,
    r2,
    mae,
    mape,
    confidence: confidence || 0.85,
    month,
    sampleSize: n
  };
}

/**
 * Validate confidence intervals against observed data
 */
export function validateConfidenceIntervals(
  observedAIV: number[],
  predictedAIV: number[],
  confidenceIntervals: [number, number][]
): {
  coverageRate: number;
  averageWidth: number;
  validIntervals: number;
} {
  let validIntervals = 0;
  let totalWidth = 0;
  
  observedAIV.forEach((obs, i) => {
    const [lower, upper] = confidenceIntervals[i];
    const width = upper - lower;
    totalWidth += width;
    
    if (obs >= lower && obs <= upper) {
      validIntervals++;
    }
  });
  
  return {
    coverageRate: validIntervals / observedAIV.length,
    averageWidth: totalWidth / observedAIV.length,
    validIntervals
  };
}

/**
 * Log benchmark metrics for model performance tracking
 */
export function logBenchmark(metrics: ModelMetrics): BenchmarkLog {
  const benchmark: BenchmarkLog = {
    rmse: metrics.rmse,
    r2: metrics.r2,
    month: metrics.month,
    timestamp: new Date().toISOString(),
    modelVersion: 'v1.0',
    sampleSize: metrics.sampleSize
  };
  
  // In a real implementation, this would log to a database or monitoring service
  console.log('Model Benchmark:', benchmark);
  
  // Store in localStorage for development
  const existingLogs = JSON.parse(localStorage.getItem('aiv-benchmarks') || '[]');
  existingLogs.push(benchmark);
  localStorage.setItem('aiv-benchmarks', JSON.stringify(existingLogs));
  
  return benchmark;
}

/**
 * Get historical benchmark data
 */
export function getBenchmarkHistory(): BenchmarkLog[] {
  return JSON.parse(localStorage.getItem('aiv-benchmarks') || '[]');
}

/**
 * Calculate prediction accuracy with confidence weighting
 */
export function calculateWeightedAccuracy(
  observedAIV: number[],
  predictedAIV: number[],
  confidenceScores: number[]
): {
  weightedRMSE: number;
  weightedR2: number;
  averageConfidence: number;
} {
  const n = observedAIV.length;
  const totalConfidence = confidenceScores.reduce((s, c) => s + c, 0);
  const averageConfidence = totalConfidence / n;
  
  // Weight residuals by confidence scores
  const weightedResiduals = observedAIV.map((obs, i) => {
    const residual = obs - predictedAIV[i];
    const weight = confidenceScores[i] / averageConfidence;
    return residual * weight;
  });
  
  const weightedRMSE = Math.sqrt(
    weightedResiduals.reduce((s, r) => s + r * r, 0) / n
  );
  
  // Weighted R² calculation
  const meanObserved = observedAIV.reduce((s, obs) => s + obs, 0) / n;
  const weightedSSRes = weightedResiduals.reduce((s, r) => s + r * r, 0);
  const ssTot = observedAIV.reduce((s, obs) => s + Math.pow(obs - meanObserved, 2), 0);
  const weightedR2 = ssTot > 0 ? 1 - (weightedSSRes / ssTot) : 0;
  
  return {
    weightedRMSE,
    weightedR2,
    averageConfidence
  };
}

/**
 * Enhanced AIV prediction with validation
 */
export function predictAIVWithValidation(
  historicalData: Array<{ aiv: number; timestamp: string; confidence?: number }>,
  targetDate: string
): {
  prediction: number;
  confidenceInterval: [number, number];
  confidence: number;
  validation: ModelMetrics | null;
} {
  // Simple linear regression for prediction (in practice, use more sophisticated models)
  const n = historicalData.length;
  if (n < 2) {
    throw new Error('Insufficient historical data for prediction');
  }
  
  // Calculate trend
  const x = historicalData.map((_, i) => i);
  const y = historicalData.map(d => d.aiv);
  
  const sumX = x.reduce((s, xi) => s + xi, 0);
  const sumY = y.reduce((s, yi) => s + yi, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumXX = x.reduce((s, xi) => s + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Predict next value
  const prediction = slope * n + intercept;
  
  // Calculate confidence based on historical variance
  const residuals = y.map((yi, i) => yi - (slope * x[i] + intercept));
  const variance = residuals.reduce((s, r) => s + r * r, 0) / (n - 2);
  const standardError = Math.sqrt(variance * (1 + 1/n + Math.pow(n, 2) / (n * sumXX - sumX * sumX)));
  
  // 95% confidence interval
  const tValue = 1.96; // Approximate for large samples
  const marginOfError = tValue * standardError;
  const confidenceInterval: [number, number] = [
    Math.max(0, prediction - marginOfError),
    Math.min(100, prediction + marginOfError)
  ];
  
  // Calculate confidence score (0-1)
  const confidence = Math.max(0, Math.min(1, 1 - (standardError / 10)));
  
  // Validation metrics (if we have enough data)
  let validation: ModelMetrics | null = null;
  if (n >= 5) {
    const predicted = x.map(xi => slope * xi + intercept);
    validation = calculateModelMetrics(y, predicted, new Date().toISOString().slice(0, 7));
  }
  
  return {
    prediction: Math.max(0, Math.min(100, prediction)),
    confidenceInterval,
    confidence,
    validation
  };
}
