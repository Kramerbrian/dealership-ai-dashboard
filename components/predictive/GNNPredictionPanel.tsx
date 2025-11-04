'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface GNNPrediction {
  intent: string;
  fix: string;
  confidence: number;
  dealerId?: string;
  topFeatures?: string[];
}

interface GNNPredictionPanelProps {
  dealerId?: string;
  threshold?: number;
}

export default function GNNPredictionPanel({
  dealerId,
  threshold = 0.85,
}: GNNPredictionPanelProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch predictions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['gnn-predictions', dealerId, threshold],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dealerId) params.set('dealerId', dealerId);
      params.set('threshold', threshold.toString());

      const response = await fetch(`/api/gnn/predict?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const result = await response.json();
      return result.data.predictions as GNNPrediction[];
    },
    staleTime: 60000, // 1 minute
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30s if enabled
  });

  const predictions = data || [];
  const highConfidence = predictions.filter((p) => p.confidence >= 0.9);
  const mediumConfidence = predictions.filter(
    (p) => p.confidence >= 0.85 && p.confidence < 0.9
  );

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-white/60">Loading predictions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load predictions. GNN engine may be unavailable.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Predicted Fix Opportunities</h2>
            <p className="text-sm text-white/60">
              {predictions.length} predictions above {threshold * 100}% confidence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh predictions"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60 mb-1">Total</div>
          <div className="text-2xl font-bold text-white">{predictions.length}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60 mb-1">High Confidence</div>
          <div className="text-2xl font-bold text-green-400">{highConfidence.length}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60 mb-1">Medium Confidence</div>
          <div className="text-2xl font-bold text-yellow-400">{mediumConfidence.length}</div>
        </div>
      </div>

      {/* Predictions List */}
      {predictions.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No predictions above {threshold * 100}% confidence threshold</p>
          <p className="text-sm mt-2">Try lowering the threshold or check GNN engine status</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <motion.div
              key={`${prediction.intent}-${prediction.fix}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">{prediction.intent}</span>
                    <span className="text-white/40">→</span>
                    <span className="text-green-400 font-medium">{prediction.fix}</span>
                  </div>

                  {prediction.topFeatures && prediction.topFeatures.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="text-xs text-white/40">Top features:</span>
                      {prediction.topFeatures.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white/10 rounded text-xs text-white/60"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  {prediction.dealerId && (
                    <div className="text-xs text-white/40 mt-2">Dealer: {prediction.dealerId}</div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <div
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      prediction.confidence >= 0.9
                        ? 'bg-green-500/20 text-green-400'
                        : prediction.confidence >= 0.85
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                  <TrendingUp className="w-4 h-4 text-white/40" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

