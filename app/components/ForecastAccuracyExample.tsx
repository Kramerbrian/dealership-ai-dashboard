/**
 * Complete Forecast Accuracy Example
 * 
 * Demonstrates both manual and automatic forecast accuracy recording
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForecastAccuracy } from '@/hooks/useForecastAccuracy';
import { recordKPIForecastAccuracy, recordBatchForecastAccuracy } from '@/lib/forecast-learning';
import ForecastAccuracyRecorder from './ForecastAccuracyRecorder';

export default function ForecastAccuracyExample() {
  // Example: Fetch actual KPIs from API (simulated)
  const [actualKPIs, setActualKPIs] = useState<{
    AIV?: number;
    ATI?: number;
    CVI?: number;
    ORI?: number;
    GRI?: number;
    DPI?: number;
  } | null>(null);

  // Option 1: Automatic recording (recommended)
  // Automatically records when actualKPIs change
  useForecastAccuracy({
    actualKPIs: actualKPIs || undefined,
    useAPI: true,
    autoRecord: true,
  });

  // Simulate fetching actual KPIs
  useEffect(() => {
    // In production, fetch from your API
    const fetchActualKPIs = async () => {
      try {
        // Example API call
        // const res = await fetch('/api/kpi/current-month');
        // const data = await res.json();
        // setActualKPIs(data);

        // Simulated data for demo
        setTimeout(() => {
          setActualKPIs({
            AIV: 84.2,
            ATI: 78.5,
            CVI: 87.8,
            ORI: 82.1,
            GRI: 79.3,
            DPI: 83.1,
          });
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch actual KPIs:', error);
      }
    };

    fetchActualKPIs();
  }, []);

  // Option 2: Manual recording (for custom workflows)
  const handleManualRecord = async () => {
    if (!actualKPIs) return;

    try {
      // Record single KPI
      await recordKPIForecastAccuracy('AIV', 82.5, actualKPIs.AIV || 0, {
        useAPI: true,
      });

      // Or record batch
      await recordBatchForecastAccuracy(
        [
          { kpi: 'AIV', predicted: 82.5, actual: actualKPIs.AIV || 0 },
          { kpi: 'CVI', predicted: 89.3, actual: actualKPIs.CVI || 0 },
          { kpi: 'DPI', predicted: 82.4, actual: actualKPIs.DPI || 0 },
        ],
        { useAPI: true }
      );

      alert('Forecast accuracy recorded successfully!');
    } catch (error) {
      console.error('Failed to record accuracy:', error);
      alert('Failed to record accuracy. Check console for details.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Forecast Accuracy Recording
        </h2>

        <div className="space-y-4">
          {/* Automatic Recording Status */}
          <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-900 mb-2">
              ✓ Automatic Recording (Active)
            </h3>
            <p className="text-sm text-green-700">
              The <code className="bg-green-100 px-1 rounded">useForecastAccuracy</code> hook
              is automatically recording forecast accuracy when actual KPIs are available.
            </p>
            {actualKPIs && (
              <div className="mt-2 text-xs text-green-600">
                Current KPIs: AIV={actualKPIs.AIV}, CVI={actualKPIs.CVI}, DPI={actualKPIs.DPI}
              </div>
            )}
          </div>

          {/* Manual Recording Option */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Manual Recording
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              For custom workflows or one-off recordings, use the manual recording functions.
            </p>
            <button
              onClick={handleManualRecord}
              disabled={!actualKPIs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Record Accuracy Manually
            </button>
          </div>

          {/* UI Component */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Forecast Accuracy Recorder Component
            </h3>
            <ForecastAccuracyRecorder
              actualKPIs={actualKPIs || undefined}
              showManualControls={true}
            />
          </div>

          {/* Code Examples */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2">
              Usage Examples
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded mb-1">
                  {`// Automatic (Recommended)
import { useForecastAccuracy } from '@/hooks/useForecastAccuracy';

useForecastAccuracy({ 
  actualKPIs: { AIV: 84.2, CVI: 87.8 }, 
  useAPI: true 
});`}
                </p>
              </div>
              <div>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded mb-1">
                  {`// Manual (Single KPI)
import { recordKPIForecastAccuracy } from '@/lib/forecast-learning';

await recordKPIForecastAccuracy('AIV', 82.5, 84.2, { useAPI: true });`}
                </p>
              </div>
              <div>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                  {`// Manual (Batch)
import { recordBatchForecastAccuracy } from '@/lib/forecast-learning';

await recordBatchForecastAccuracy([
  { kpi: 'AIV', predicted: 82.5, actual: 84.2 },
  { kpi: 'CVI', predicted: 89.3, actual: 87.8 },
], { useAPI: true });`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

