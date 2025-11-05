/**
 * Forecast Learning Utilities
 * 
 * Helper functions for adaptive forecast learning using exponential smoothing
 */

import { recordForecastAccuracy } from '@/app/components/GroupExecutiveSummary';

export interface ForecastComparison {
  kpi: 'AIV' | 'ATI' | 'CVI' | 'ORI' | 'GRI' | 'DPI';
  predicted: number;
  actual: number;
  timestamp: Date;
}

/**
 * Record forecast accuracy for a single KPI
 * Call this when actual KPI data becomes available (e.g., end of month)
 */
export async function recordKPIForecastAccuracy(
  kpi: 'AIV' | 'ATI' | 'CVI' | 'ORI' | 'GRI' | 'DPI',
  predicted: number,
  actual: number,
  options?: { useAPI?: boolean; tenantId?: string }
) {
  // Use client-side function by default (localStorage)
  recordForecastAccuracy(kpi, predicted, actual);

  // Optionally also send to API for server-side persistence
  if (options?.useAPI && typeof window !== 'undefined') {
    try {
      await fetch('/api/forecast/record-accuracy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpi,
          predicted,
          actual,
          tenantId: options.tenantId,
        }),
      });
    } catch (error) {
      console.warn('Failed to record forecast accuracy to API:', error);
      // Continue with localStorage fallback
    }
  }
}

/**
 * Batch record forecast accuracy for multiple KPIs
 * Useful when comparing full forecast vs actual results
 */
export async function recordBatchForecastAccuracy(
  comparisons: Array<{ kpi: 'AIV' | 'ATI' | 'CVI' | 'ORI' | 'GRI' | 'DPI'; predicted: number; actual: number }>,
  options?: { useAPI?: boolean; tenantId?: string }
) {
  await Promise.all(
    comparisons.map(({ kpi, predicted, actual }) =>
      recordKPIForecastAccuracy(kpi, predicted, actual, options)
    )
  );
}

/**
 * Calculate forecast accuracy metrics
 */
export function calculateForecastAccuracy(
  predictions: number[],
  actuals: number[]
): {
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  avgError: number;
} {
  if (predictions.length !== actuals.length) {
    throw new Error('Predictions and actuals must have the same length');
  }

  const errors = predictions.map((pred, i) => actuals[i] - pred);
  const absErrors = errors.map(e => Math.abs(e));
  const pctErrors = errors.map((e, i) => Math.abs(e / predictions[i]) * 100);

  const mae = absErrors.reduce((a, b) => a + b, 0) / absErrors.length;
  const mape = pctErrors.reduce((a, b) => a + b, 0) / pctErrors.length;
  const rmse = Math.sqrt(errors.reduce((a, b) => a + b * b, 0) / errors.length);
  const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;

  return { mae, mape, rmse, avgError };
}

