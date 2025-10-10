"use client";

import { useEffect } from "react";
import { useAIVContext } from "@/src/context/AIVMetricsContext";
import { useAIVMetrics } from "@/src/hooks/useAIVMetricsEnhanced";

export default function DealershipAIDashboard() {
  const { data, history, setData, setHistory } = useAIVContext();
  const { data: fetched, history: hist, error, loading } = useAIVMetrics({
    domain: "naplesfordfl.com",
  });

  // sync context when new data arrives
  useEffect(() => {
    if (fetched) setData(fetched);
    if (hist.length) setHistory(hist);
  }, [fetched, hist, setData, setHistory]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!data) return null;

  return (
    <div className="p-6 bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">DealershipAI Dashboard</h1>
      
      {/* Display current AIV data */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">AIV Score</h3>
          <div className="text-2xl font-bold text-white">{data.aiv}</div>
          {data.deltas && (
            <div className="text-sm text-green-400">
              {data.deltas.deltaAIV > 0 ? '↗' : '↘'} {Math.abs(data.deltas.deltaAIV).toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">ATI Score</h3>
          <div className="text-2xl font-bold text-white">{data.ati}</div>
          {data.deltas && (
            <div className="text-sm text-green-400">
              {data.deltas.deltaATI > 0 ? '↗' : '↘'} {Math.abs(data.deltas.deltaATI).toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">CRS Score</h3>
          <div className="text-2xl font-bold text-white">{data.crs}</div>
          {data.deltas && (
            <div className="text-sm text-green-400">
              {data.deltas.deltaCRS > 0 ? '↗' : '↘'} {Math.abs(data.deltas.deltaCRS).toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Display confidence interval */}
      {data.ci95 && (
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h3 className="text-sm text-gray-400 mb-2">95% Confidence Interval</h3>
          <div className="text-lg text-white">
            {data.ci95[0].toFixed(1)} - {data.ci95[1].toFixed(1)}
          </div>
        </div>
      )}

      {/* Display historical trend */}
      {history.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-2">8-Week Trend (Kalman-Smoothed)</h3>
          <div className="h-24 flex items-end gap-1">
            {history.slice(0, 8).map((point, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-blue-500/30 to-blue-500/60 rounded-t"
                style={{ height: `${(point.aiv / 100) * 100}%` }}
                title={`Week ${index + 1}: ${point.aiv.toFixed(1)}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
