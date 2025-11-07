/**
 * Forecast Feedback Loop Component
 * 
 * Displays feedback loop results and allows manual triggering of recalibration
 */

'use client';

import React, { useState } from 'react';
import { calculateFeedbackLoop } from '@/lib/forecast-feedback-loop';
import type { ForecastRecord, PerformanceInputs } from '@/lib/forecast-feedback-loop';
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

interface ForecastFeedbackLoopProps {
  forecastRecords?: ForecastRecord[];
  performanceInputs?: PerformanceInputs;
  previousConfidence?: number;
  onConfidenceUpdate?: (newConfidence: number) => void;
}

export default function ForecastFeedbackLoop({
  forecastRecords,
  performanceInputs,
  previousConfidence = 0.89,
  onConfidenceUpdate,
}: ForecastFeedbackLoopProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!forecastRecords || !performanceInputs) {
      setError('Missing required inputs: forecastRecords and performanceInputs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate locally first
      const localResult = calculateFeedbackLoop({
        forecast_records: forecastRecords,
        performance_inputs: performanceInputs,
        previous_confidence_score: previousConfidence,
      });

      setResult(localResult);

      // Also send to API for persistence
      const response = await fetch('/api/forecast/feedback-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecast_records: forecastRecords,
          performance_inputs: performanceInputs,
          previous_confidence_score: previousConfidence,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save feedback loop to API');
      }

      // Notify parent of confidence update
      if (onConfidenceUpdate) {
        onConfidenceUpdate(localResult.new_confidence_score);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate feedback loop');
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Forecast Feedback Loop
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Process forecast feedback to recalibrate confidence scores based on actual vs predicted ROI.
        </p>
        <button
          onClick={handleCalculate}
          disabled={loading || !forecastRecords || !performanceInputs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Calculate Feedback Loop'}
        </button>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  const confidenceChange = result.new_confidence_score - previousConfidence;
  const confidenceChangePct = (confidenceChange / previousConfidence) * 100;

  return (
    <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Forecast Feedback Loop Results
      </h3>

      {/* Confidence Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Confidence Score</span>
          <div className="flex items-center gap-2">
            {confidenceChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${
              confidenceChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {confidenceChange > 0 ? '+' : ''}{(confidenceChangePct).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900">
              {(result.new_confidence_score * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Previous: {(previousConfidence * 100).toFixed(1)}%
            </div>
          </div>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${result.new_confidence_score * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Analysis */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Forecast Error</div>
          <div className="text-lg font-semibold text-gray-900">
            {(result.forecast_error * 100).toFixed(2)}%
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Error Category</div>
          <div className={`text-lg font-semibold ${
            result.error_category === 'minor' ? 'text-green-600' :
            result.error_category === 'moderate' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {result.error_category}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Adjustment Factor</div>
          <div className="text-lg font-semibold text-gray-900">
            {result.adjustment_factor.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Reinforcement Factors */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Reinforcement Factors</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Behavioral (45% influence)</span>
            <span className="text-sm font-medium text-gray-900">
              {(result.behavioral_reinforcement * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${result.behavioral_reinforcement * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-700">Performance (40% influence)</span>
            <span className="text-sm font-medium text-gray-900">
              {(result.performance_reinforcement * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${result.performance_reinforcement * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-700">Contextual (15% influence)</span>
            <span className="text-sm font-medium text-gray-900">
              {(result.contextual_decay * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${result.contextual_decay * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Recommendations</h4>
        <ul className="space-y-2">
          {result.recommendations.map((rec: string, index: number) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setResult(null)}
        className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
      >
        Recalculate
      </button>
    </div>
  );
}

