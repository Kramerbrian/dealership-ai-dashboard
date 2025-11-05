/**
 * ForecastDriftAlert Component
 * 
 * Displays alerts when downward drift is detected in forecast trends
 */

'use client';

import React, { useEffect, useState } from 'react';
import { detectDrift, calculateForecastConfidenceIntervals } from '@/lib/forecast-confidence';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface ForecastDriftAlertProps {
  currentPredictions: Record<string, number>;
  historicalAverages?: Record<string, number>;
  threshold?: number;
}

export default function ForecastDriftAlert({
  currentPredictions,
  historicalAverages,
  threshold = 0.05,
}: ForecastDriftAlertProps) {
  const [driftAlert, setDriftAlert] = useState<any>(null);

  useEffect(() => {
    if (!historicalAverages || Object.keys(historicalAverages).length === 0) {
      setDriftAlert(null);
      return;
    }

    const alert = detectDrift(currentPredictions, historicalAverages, threshold);
    setDriftAlert(alert.detected ? alert : null);
  }, [currentPredictions, historicalAverages, threshold]);

  if (!driftAlert) {
    return null;
  }

  const severityColors = {
    high: 'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    low: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const severityIcons = {
    high: <AlertTriangle className="w-5 h-5" />,
    medium: <TrendingDown className="w-5 h-5" />,
    low: <TrendingUp className="w-5 h-5" />,
  };

  return (
    <div className={`rounded-xl border p-4 ${severityColors[driftAlert.severity]}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {severityIcons[driftAlert.severity]}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Forecast Drift Alert</h4>
          <p className="text-sm mb-2">{driftAlert.message}</p>
          <div className="text-sm">
            <strong>Affected KPIs:</strong> {driftAlert.affectedKPIs.join(', ')}
          </div>
          <div className="text-sm mt-2">
            <strong>Recommendation:</strong> {driftAlert.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}

