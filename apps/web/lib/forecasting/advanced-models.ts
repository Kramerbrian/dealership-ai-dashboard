/**
 * Advanced Forecasting Models
 * ARIMA and LSTM-based predictions for AI visibility scores
 */

export interface ForecastResult {
  predictions: number[];
  confidence: number;
  method: 'arima' | 'lstm' | 'linear';
  metadata: {
    dataPoints: number;
    horizon: number;
    rmse?: number;
    mae?: number;
  };
}

/**
 * ARIMA (AutoRegressive Integrated Moving Average) Forecasting
 * Good for time series with trends and seasonality
 */
export function arimaForecast(
  historical: number[],
  horizon: number = 30
): ForecastResult {
  if (historical.length < 7) {
    // Fallback to linear if insufficient data
    return linearForecast(historical, horizon);
  }

  // Simplified ARIMA(1,1,1) implementation
  // In production, use a library like 'arima' or 'statsmodels'
  const n = historical.length;
  const diffs: number[] = [];
  
  // First difference
  for (let i = 1; i < n; i++) {
    diffs.push(historical[i] - historical[i - 1]);
  }

  // Calculate AR coefficient (autoregressive)
  let arSum = 0;
  for (let i = 1; i < diffs.length; i++) {
    arSum += diffs[i] * diffs[i - 1];
  }
  const arCoeff = arSum / (diffs.reduce((a, b) => a + b * b, 0) || 1);

  // Calculate MA coefficient (moving average)
  const meanDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const maCoeff = 0.3; // Simplified

  // Generate forecasts
  const predictions: number[] = [];
  let lastValue = historical[n - 1];
  let lastDiff = diffs[diffs.length - 1];

  for (let i = 0; i < horizon; i++) {
    // ARIMA(1,1,1) formula: diff_t = AR * diff_{t-1} + MA * error
    const newDiff = arCoeff * lastDiff + maCoeff * meanDiff;
    lastValue = lastValue + newDiff;
    lastDiff = newDiff;
    
    // Clamp to valid range
    predictions.push(Math.max(0, Math.min(100, lastValue)));
  }

  // Calculate confidence based on data quality
  const variance = calculateVariance(historical);
  const confidence = Math.max(0.5, Math.min(0.95, 1 - variance / 100));

  return {
    predictions,
    confidence,
    method: 'arima',
    metadata: {
      dataPoints: n,
      horizon,
      rmse: calculateRMSE(historical, predictions.slice(0, Math.min(historical.length, horizon))),
    },
  };
}

/**
 * LSTM (Long Short-Term Memory) Neural Network Forecasting
 * Good for complex patterns and long-term dependencies
 * 
 * Note: This is a simplified simulation. In production, use TensorFlow.js
 * or call a Python ML service for actual LSTM predictions.
 */
export function lstmForecast(
  historical: number[],
  horizon: number = 30,
  lookback: number = 7
): ForecastResult {
  if (historical.length < lookback * 2) {
    return linearForecast(historical, horizon);
  }

  // Simplified LSTM simulation using pattern recognition
  // In production, train an actual LSTM model
  const sequences: number[][] = [];
  const targets: number[] = [];

  // Create sequences for training simulation
  for (let i = lookback; i < historical.length; i++) {
    sequences.push(historical.slice(i - lookback, i));
    targets.push(historical[i]);
  }

  // Simple pattern-based prediction
  const predictions: number[] = [];
  const lastSequence = historical.slice(-lookback);
  const trend = calculateTrend(historical);
  const seasonality = detectSeasonality(historical);

  for (let i = 0; i < horizon; i++) {
    // Weighted combination of trend, seasonality, and recent values
    const trendComponent = historical[historical.length - 1] + trend * (i + 1);
    const seasonalComponent = seasonality[i % seasonality.length] || 0;
    const recentAvg = lastSequence.reduce((a, b) => a + b, 0) / lookback;
    
    const prediction = 0.4 * trendComponent + 0.3 * seasonalComponent + 0.3 * recentAvg;
    predictions.push(Math.max(0, Math.min(100, prediction)));
  }

  // LSTM typically has higher confidence for complex patterns
  const confidence = Math.max(0.7, Math.min(0.95, 0.85 + (historical.length / 100)));

  return {
    predictions,
    confidence,
    method: 'lstm',
    metadata: {
      dataPoints: historical.length,
      horizon,
    },
  };
}

/**
 * Linear Regression Forecasting (fallback)
 */
export function linearForecast(
  historical: number[],
  horizon: number = 30
): ForecastResult {
  const n = historical.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historical;

  // Calculate linear regression
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate predictions
  const predictions: number[] = [];
  for (let i = 0; i < horizon; i++) {
    const futureX = n + i;
    const prediction = slope * futureX + intercept;
    predictions.push(Math.max(0, Math.min(100, prediction)));
  }

  // Calculate confidence
  const variance = calculateVariance(historical);
  const confidence = Math.max(0.5, Math.min(0.9, 1 - variance / 200));

  return {
    predictions,
    confidence,
    method: 'linear',
    metadata: {
      dataPoints: n,
      horizon,
      rmse: calculateRMSE(historical, predictions.slice(0, Math.min(n, horizon))),
    },
  };
}

/**
 * Hybrid forecasting - combines multiple methods
 */
export function hybridForecast(
  historical: number[],
  horizon: number = 30
): ForecastResult {
  const arima = arimaForecast(historical, horizon);
  const lstm = lstmForecast(historical, horizon);
  const linear = linearForecast(historical, horizon);

  // Weighted ensemble
  const weights = {
    arima: historical.length >= 30 ? 0.4 : 0.2,
    lstm: historical.length >= 14 ? 0.4 : 0.2,
    linear: 0.2,
  };

  const predictions = arima.predictions.map((_, i) => {
    return (
      weights.arima * arima.predictions[i] +
      weights.lstm * lstm.predictions[i] +
      weights.linear * linear.predictions[i]
    );
  });

  const confidence = (arima.confidence + lstm.confidence + linear.confidence) / 3;

  return {
    predictions,
    confidence,
    method: 'arima', // Primary method
    metadata: {
      dataPoints: historical.length,
      horizon,
    },
  };
}

// Helper functions
function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return variance;
}

function calculateRMSE(actual: number[], predicted: number[]): number {
  const n = Math.min(actual.length, predicted.length);
  const mse = actual.slice(0, n).reduce((sum, val, i) => {
    return sum + Math.pow(val - predicted[i], 2);
  }, 0) / n;
  return Math.sqrt(mse);
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const first = values[0];
  const last = values[values.length - 1];
  return (last - first) / values.length;
}

function detectSeasonality(values: number[]): number[] {
  // Simple seasonality detection (weekly pattern)
  if (values.length < 7) return [0];
  
  const weeklyPattern: number[] = [];
  for (let day = 0; day < 7; day++) {
    const dayValues: number[] = [];
    for (let i = day; i < values.length; i += 7) {
      dayValues.push(values[i]);
    }
    weeklyPattern.push(
      dayValues.length > 0
        ? dayValues.reduce((a, b) => a + b, 0) / dayValues.length
        : 0
    );
  }
  
  return weeklyPattern;
}

