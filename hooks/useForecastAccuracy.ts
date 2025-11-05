/**
 * useForecastAccuracy Hook
 * 
 * Automatically records forecast accuracy when actual KPI data becomes available.
 * Compares stored predictions with actual results and updates the learning model.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { recordKPIForecastAccuracy, recordBatchForecastAccuracy } from '@/lib/forecast-learning';

interface KPIScores {
  AIV?: number;
  ATI?: number;
  CVI?: number;
  ORI?: number;
  GRI?: number;
  DPI?: number;
}

interface UseForecastAccuracyOptions {
  /** Actual KPI scores (from current period) */
  actualKPIs?: KPIScores;
  /** Whether to record to API (default: true) */
  useAPI?: boolean;
  /** Tenant ID for multi-tenant isolation */
  tenantId?: string;
  /** Automatically record when actualKPIs change (default: true) */
  autoRecord?: boolean;
  /** Minimum time between recordings (ms) to prevent duplicate records */
  debounceMs?: number;
}

/**
 * Hook to automatically record forecast accuracy
 * 
 * @example
 * ```tsx
 * const { recordAccuracy, isRecording } = useForecastAccuracy({
 *   actualKPIs: { AIV: 84.2, CVI: 87.8, DPI: 83.1 },
 *   useAPI: true,
 *   tenantId: 'tenant-123'
 * });
 * ```
 */
export function useForecastAccuracy(options: UseForecastAccuracyOptions = {}) {
  const {
    actualKPIs,
    useAPI = true,
    tenantId,
    autoRecord = true,
    debounceMs = 5000, // 5 seconds default debounce
  } = options;

  const lastRecordedRef = useRef<Record<string, number>>({});
  const isRecordingRef = useRef(false);

  /**
   * Record accuracy for a single KPI
   */
  const recordAccuracy = useCallback(
    async (kpi: keyof KPIScores, predicted: number, actual: number) => {
      const key = `${kpi}-${predicted.toFixed(1)}`;
      const now = Date.now();
      
      // Debounce: don't record same prediction twice within debounce window
      if (
        lastRecordedRef.current[key] &&
        now - lastRecordedRef.current[key] < debounceMs
      ) {
        return;
      }

      if (isRecordingRef.current) return;

      isRecordingRef.current = true;
      try {
        await recordKPIForecastAccuracy(kpi, predicted, actual, {
          useAPI,
          tenantId,
        });
        lastRecordedRef.current[key] = now;
      } catch (error) {
        console.error(`Failed to record forecast accuracy for ${kpi}:`, error);
      } finally {
        isRecordingRef.current = false;
      }
    },
    [useAPI, tenantId, debounceMs]
  );

  /**
   * Record accuracy for multiple KPIs at once
   */
  const recordBatchAccuracy = useCallback(
    async (
      comparisons: Array<{
        kpi: keyof KPIScores;
        predicted: number;
        actual: number;
      }>
    ) => {
      if (isRecordingRef.current) return;

      isRecordingRef.current = true;
      try {
        await recordBatchForecastAccuracy(comparisons, { useAPI, tenantId });
        
        // Update last recorded timestamps
        const now = Date.now();
        comparisons.forEach(({ kpi, predicted }) => {
          const key = `${kpi}-${predicted.toFixed(1)}`;
          lastRecordedRef.current[key] = now;
        });
      } catch (error) {
        console.error('Failed to record batch forecast accuracy:', error);
      } finally {
        isRecordingRef.current = false;
      }
    },
    [useAPI, tenantId]
  );

  /**
   * Load stored predictions from localStorage
   */
  const loadStoredPredictions = useCallback((): KPIScores | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem('forecast_predictions');
      if (!stored) return null;

      const data = JSON.parse(stored);
      // Remove timestamp before returning
      const { timestamp, ...predictions } = data;
      return predictions;
    } catch {
      return null;
    }
  }, []);

  /**
   * Automatically record accuracy when actual KPIs are available
   */
  useEffect(() => {
    if (!autoRecord || !actualKPIs) return;

    const storedPredictions = loadStoredPredictions();
    if (!storedPredictions) return;

    // Compare and record accuracy for each KPI
    const comparisons: Array<{
      kpi: keyof KPIScores;
      predicted: number;
      actual: number;
    }> = [];

    (Object.keys(actualKPIs) as Array<keyof KPIScores>).forEach((kpi) => {
      const actual = actualKPIs[kpi];
      const predicted = storedPredictions[kpi];

      if (
        actual !== undefined &&
        predicted !== undefined &&
        typeof actual === 'number' &&
        typeof predicted === 'number'
      ) {
        comparisons.push({ kpi, predicted, actual });
      }
    });

    if (comparisons.length > 0) {
      recordBatchAccuracy(comparisons);
    }
  }, [actualKPIs, autoRecord, loadStoredPredictions, recordBatchAccuracy]);

  return {
    recordAccuracy,
    recordBatchAccuracy,
    loadStoredPredictions,
    isRecording: isRecordingRef.current,
  };
}

