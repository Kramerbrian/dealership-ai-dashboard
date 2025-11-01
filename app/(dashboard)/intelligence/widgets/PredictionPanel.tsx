'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Sparkles, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

interface Prediction {
  intent_id: string;
  intent_name: string;
  fix_id: string;
  fix_name: string;
  confidence: number;
  prediction_id: string;
  explanation?: {
    top_features: string[];
  };
}

interface PredictionPanelProps {
  dealerId?: string;
  threshold?: number;
  maxPredictions?: number;
}

export default function PredictionPanel({
  dealerId,
  threshold = 0.85,
  maxPredictions = 50,
}: PredictionPanelProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [explanation, setExplanation] = useState<any>(null);

  const params = new URLSearchParams();
  if (dealerId) params.append('dealerId', dealerId);
  params.append('threshold', threshold.toString());
  params.append('maxPredictions', maxPredictions.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/gnn/predict?${params.toString()}`,
    (url) =>
      fetch(url)
        .then((r) => r.json())
        .then((d) => d.predictions || [])
  );

  const predictions: Prediction[] = data || [];

  const handleVerify = async (prediction: Prediction, verified: boolean) => {
    try {
      await fetch('/api/gnn/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealerId || 'unknown',
          intent: prediction.intent_name,
          fix: prediction.fix_name,
          verified,
          confidence: prediction.confidence,
        }),
      });

      // Refresh predictions
      mutate();
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleExplain = async (prediction: Prediction) => {
    if (selectedPrediction?.prediction_id === prediction.prediction_id && explanation) {
      // Toggle off
      setSelectedPrediction(null);
      setExplanation(null);
      return;
    }

    setSelectedPrediction(prediction);
    try {
      const res = await fetch(
        `/api/gnn/explain?prediction_id=${prediction.prediction_id}&dealer_id=${dealerId || 'all'}`
      );
      const data = await res.json();
      setExplanation(data.explanation || data);
    } catch (error) {
      console.error('Explanation error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <h2 className="text-xl font-semibold">Loading Predictions...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-semibold">Prediction Error</h2>
        </div>
        <p className="text-sm text-slate-400">{error.message || 'Failed to load predictions'}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold">Predicted Fix Opportunities</h2>
        </div>
        <div className="text-sm text-slate-400">
          {predictions.length} predictions
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No predictions above {threshold * 100}% confidence threshold</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {predictions.map((prediction, i) => (
            <li
              key={prediction.prediction_id || i}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-medium text-sm">
                      {prediction.intent_name}
                    </span>
                    <span className="text-slate-500">→</span>
                    <span className="text-green-400 font-medium text-sm">
                      {prediction.fix_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      Confidence: {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                    {explanation?.top_features && selectedPrediction?.prediction_id === prediction.prediction_id && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>Top features:</span>
                        {explanation.top_features.slice(0, 3).map((feat: string, idx: number) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-600 rounded text-slate-300">
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExplain(prediction)}
                    className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                    title="Explain prediction"
                  >
                    {selectedPrediction?.prediction_id === prediction.prediction_id ? 'Hide' : 'Explain'}
                  </button>
                  <button
                    onClick={() => handleVerify(prediction, true)}
                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded transition-colors"
                    title="Mark as verified"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleVerify(prediction, false)}
                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded transition-colors"
                    title="Mark as rejected"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {selectedPrediction?.prediction_id === prediction.prediction_id && explanation && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="text-xs text-slate-400 space-y-1">
                    {explanation.top_intent_features && (
                      <div>
                        <span className="font-medium">Intent factors:</span>
                        {explanation.top_intent_features.map((feat: any, idx: number) => (
                          <span key={idx} className="ml-2">
                            {feat.name} ({feat.contribution.toFixed(3)})
                          </span>
                        ))}
                      </div>
                    )}
                    {explanation.top_fix_features && (
                      <div>
                        <span className="font-medium">Fix factors:</span>
                        {explanation.top_fix_features.map((feat: any, idx: number) => (
                          <span key={idx} className="ml-2">
                            {feat.name} ({feat.contribution.toFixed(3)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
        <p>
          Predictions are generated by a Graph Neural Network analyzing dealer intent patterns and
          successful fix outcomes.
        </p>
      </div>
    </div>
  );
}

