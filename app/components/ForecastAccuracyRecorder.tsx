/**
 * ForecastAccuracyRecorder Component
 * 
 * Example component showing how to use the forecast accuracy recording system.
 * This component can be integrated into your dashboard to automatically record
 * forecast accuracy when actual KPI data becomes available.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForecastAccuracy } from '@/hooks/useForecastAccuracy';
import { recordKPIForecastAccuracy } from '@/lib/forecast-learning';

interface ForecastAccuracyRecorderProps {
  /** Actual KPI scores from current period */
  actualKPIs?: {
    AIV?: number;
    ATI?: number;
    CVI?: number;
    ORI?: number;
    GRI?: number;
    DPI?: number;
  };
  /** Tenant ID for multi-tenant isolation */
  tenantId?: string;
  /** Show UI for manual recording */
  showManualControls?: boolean;
}

export default function ForecastAccuracyRecorder({
  actualKPIs,
  tenantId,
  showManualControls = false,
}: ForecastAccuracyRecorderProps) {
  const { recordAccuracy, loadStoredPredictions, isRecording } = useForecastAccuracy({
    actualKPIs,
    useAPI: true,
    tenantId,
    autoRecord: true,
  });

  const [storedPredictions, setStoredPredictions] = useState<any>(null);
  const [recordedKPIs, setRecordedKPIs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const predictions = loadStoredPredictions();
    setStoredPredictions(predictions);
  }, [loadStoredPredictions]);

  const handleManualRecord = async (kpi: 'AIV' | 'ATI' | 'CVI' | 'ORI' | 'GRI' | 'DPI') => {
    if (!actualKPIs || !storedPredictions) return;

    const actual = actualKPIs[kpi];
    const predicted = storedPredictions[kpi];

    if (actual === undefined || predicted === undefined) {
      alert(`Missing ${kpi} data. Actual: ${actual}, Predicted: ${predicted}`);
      return;
    }

    try {
      await recordKPIForecastAccuracy(kpi, predicted, actual, {
        useAPI: true,
        tenantId,
      });
      setRecordedKPIs((prev) => new Set(prev).add(kpi));
    } catch (error) {
      console.error(`Failed to record ${kpi} accuracy:`, error);
      alert(`Failed to record ${kpi} accuracy. Check console for details.`);
    }
  };

  if (!showManualControls && !storedPredictions) {
    return null; // Silent mode - no UI if no predictions stored
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-4 shadow-sm">
      <h4 className="text-sm font-semibold mb-3 text-gray-900">Forecast Accuracy Recording</h4>
      
      {storedPredictions ? (
        <div className="space-y-2 text-xs text-gray-600">
          <p className="mb-2">Stored predictions found. Recording accuracy automatically...</p>
          
          {showManualControls && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700 mb-2">Manual Recording:</div>
              {(['AIV', 'ATI', 'CVI', 'ORI', 'GRI', 'DPI'] as const).map((kpi) => {
                const predicted = storedPredictions[kpi];
                const actual = actualKPIs?.[kpi];
                const isRecorded = recordedKPIs.has(kpi);
                const canRecord = actual !== undefined && predicted !== undefined;

                return (
                  <div key={kpi} className="flex items-center justify-between py-1">
                    <span className="text-gray-700">
                      {kpi}: {predicted?.toFixed(1)} → {actual?.toFixed(1) || 'N/A'}
                    </span>
                    <button
                      onClick={() => handleManualRecord(kpi)}
                      disabled={!canRecord || isRecorded || isRecording}
                      className={`px-2 py-1 text-xs rounded ${
                        isRecorded
                          ? 'bg-green-100 text-green-700'
                          : canRecord
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isRecorded ? '✓ Recorded' : canRecord ? 'Record' : 'Missing Data'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          No stored predictions found. Forecast Mode will store predictions automatically.
        </p>
      )}
    </div>
  );
}

