'use client';

import React, { useState, useEffect } from 'react';
import { useAIVContext } from '@/src/context/AIVMetricsContext';
import { useAIVMetrics } from '@/src/hooks/useAIVMetricsEnhanced';

interface AIVMetricsPanelEnhancedProps {
  domain: string;
  className?: string;
}

export function AIVMetricsPanelEnhanced({ domain, className = '' }: AIVMetricsPanelEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: contextData, history: contextHistory, setData, setHistory } = useAIVContext();
  
  const { data: fetched, history: hist, error, loading, refetch } = useAIVMetrics({
    domain,
    refetchInterval: 300000, // 5 minutes
  });

  // Sync context when new data arrives
  useEffect(() => {
    if (fetched) setData(fetched);
    if (hist.length) setHistory(hist);
  }, [fetched, hist, setData, setHistory]);

  // Use context data if available, otherwise use fetched data
  const data = contextData || fetched;
  const history = contextHistory.length ? contextHistory : hist;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-400';
    if (delta < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return '↗';
    if (delta < 0) return '↘';
    return '→';
  };

  if (loading) {
    return (
      <div className={`bg-white/5 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-red-400 mb-2">AIV Metrics Error</h3>
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white/5 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">AI Visibility Index</h3>
        <p className="text-gray-400 mb-4">No AIV data available for this domain.</p>
        <button
          onClick={() => refetch()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          Load AIV Data
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">AI Visibility Index (Enhanced)</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={() => refetch()}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Main AIV Score with Delta and Confidence */}
      <div className="mb-6">
        <div className={`${getScoreBg(data.aiv)} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm text-gray-400 mb-1">Overall AIV Score</h4>
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${getScoreColor(data.aiv)}`}>
                  {data.aiv}
                </div>
                {data.deltas && (
                  <div className={`text-sm font-medium ${getDeltaColor(data.deltas.deltaAIV)}`}>
                    {getDeltaIcon(data.deltas.deltaAIV)} {Math.abs(data.deltas.deltaAIV).toFixed(1)}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Elasticity</div>
              <div className="text-lg font-semibold text-white">
                ${data.elasticity_usd_per_pt.toFixed(0)}/pt
              </div>
              {data.deltas && (
                <div className={`text-xs ${getDeltaColor(data.deltas.deltaAIV)}`}>
                  {getDeltaIcon(data.deltas.deltaAIV)} ${Math.abs(data.deltas.deltaAIV * data.elasticity_usd_per_pt).toFixed(0)}
                </div>
              )}
            </div>
          </div>
          
          {/* Confidence Interval */}
          {data.ci95 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-1">95% Confidence Interval</div>
              <div className="text-sm text-white">
                {data.ci95[0].toFixed(1)} - {data.ci95[1].toFixed(1)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-scores with Deltas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="text-sm text-gray-400 mb-1">ATI Score</h5>
          <div className="flex items-center gap-2">
            <div className={`text-xl font-bold ${getScoreColor(data.ati)}`}>
              {data.ati}
            </div>
            {data.deltas && (
              <div className={`text-xs ${getDeltaColor(data.deltas.deltaATI)}`}>
                {getDeltaIcon(data.deltas.deltaATI)} {Math.abs(data.deltas.deltaATI).toFixed(1)}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">Answer Engine</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="text-sm text-gray-400 mb-1">CRS Score</h5>
          <div className="flex items-center gap-2">
            <div className={`text-xl font-bold ${getScoreColor(data.crs)}`}>
              {data.crs}
            </div>
            {data.deltas && (
              <div className={`text-xs ${getDeltaColor(data.deltas.deltaCRS)}`}>
                {getDeltaIcon(data.deltas.deltaCRS)} {Math.abs(data.deltas.deltaCRS).toFixed(1)}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">Citation Relevance</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <h5 className="text-sm text-gray-400 mb-1">R² Coefficient</h5>
          <div className={`text-xl font-bold ${getScoreColor(data.r2 * 100)}`}>
            {(data.r2 * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Kalman-Smoothed Trends Chart */}
          {history.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-white mb-3">8-Week Trend (Kalman-Smoothed)</h5>
              <div className="h-32 flex items-end gap-1">
                {history.slice(0, 8).map((point, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-blue-500/30 to-blue-500/60 rounded-t"
                    style={{ height: `${(point.aiv / 100) * 100}%` }}
                    title={`Week ${index + 1}: ${point.aiv.toFixed(1)}`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Predictive smoothing applied for trend analysis
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div className="bg-white/5 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-white mb-3">Technical Details</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Last Updated:</span>
                <div className="text-white">
                  {new Date(data.timestamp).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-gray-400">R² Confidence:</span>
                <div className="text-white">
                  {(data.r2 * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-gray-400">Data Source:</span>
                <div className="text-white">Enhanced API</div>
              </div>
              <div>
                <span className="text-gray-400">Smoothing:</span>
                <div className="text-green-400">Kalman Filter</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Data
            </button>
            <button
              onClick={() => {
                // Clear context cache
                setData(null);
                setHistory([]);
                refetch();
              }}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-4 py-2 rounded-lg transition-colors"
            >
              Clear Cache & Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
