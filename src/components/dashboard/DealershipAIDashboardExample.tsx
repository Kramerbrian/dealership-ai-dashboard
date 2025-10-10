"use client";

import { useEffect } from "react";
import { useAIVMetrics } from "@/hooks/useAIVMetrics";

export default function DealershipAIDashboard() {
  const { data: fetched, history: hist, error, loading } = useAIVMetrics({
    domain: "naplesfordfl.com",
  });

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!fetched) return null;

  return (
    <div className="p-6 bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">DealershipAI Dashboard</h1>
      
      {/* Display current AIV data */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">AIV Score</h3>
          <div className="text-2xl font-bold text-white">{fetched.aiv}</div>
          {fetched.deltas && (
            <div className="text-sm text-green-400">
              {fetched.deltas.deltaAIV > 0 ? '↗' : '↘'} {Math.abs(fetched.deltas.deltaAIV).toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">ATI Score</h3>
          <div className="text-2xl font-bold text-white">{fetched.ati}</div>
          {fetched.deltas && (
            <div className="text-sm text-green-400">
              {fetched.deltas.deltaATI > 0 ? '↗' : '↘'} {Math.abs(fetched.deltas.deltaATI).toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">CRS Score</h3>
          <div className="text-2xl font-bold text-white">{fetched.crs}</div>
          {fetched.deltas && (
            <div className="text-sm text-green-400">
              {fetched.deltas.deltaCRS > 0 ? '↗' : '↘'} {Math.abs(fetched.deltas.deltaCRS).toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Display confidence interval */}
      {fetched.ci95 && (
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h3 className="text-sm text-gray-400 mb-2">95% Confidence Interval</h3>
          <div className="text-lg text-white">
            {fetched.ci95[0].toFixed(1)} - {fetched.ci95[1].toFixed(1)}
          </div>
        </div>
      )}

      {/* Display historical trend */}
      {hist.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-2">8-Week Trend (Kalman-Smoothed)</h3>
          <div className="h-24 flex items-end gap-1">
            {hist.slice(0, 8).map((point, index) => (
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

