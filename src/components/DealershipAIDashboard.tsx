"use client";
import { useEffect } from "react";
import { useAIVContext } from "@/context/AIVMetricsContext";
import { useAIVMetrics } from "@/hooks/useAIVMetrics";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface DealershipAIDashboardProps {
  domain?: string;
  className?: string;
}

export default function DealershipAIDashboard({
  domain = "naplesfordfl.com",
  className = ""
}: DealershipAIDashboardProps) {
  const { data, history, setData, setHistory } = useAIVContext();
  const { data: fetched, history: hist, error, loading } = useAIVMetrics({
    domain,
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Sync context when new data arrives
  useEffect(() => {
    if (fetched) setData(fetched);
    if (hist.length) setHistory(hist);
  }, [fetched, hist, setData, setHistory]);

  if (loading) return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700">
      <div className="animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
      </div>
  );

  if (error) return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-red-500">
      <p className="text-red-400">Error: {error}</p>
    </div>
  );

  if (!data) return null;

  return (
    <div className={`bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">DealershipAI Metrics</h1>
        <div className="text-sm text-slate-400">
          Domain: {domain}
        </div>
      </div>

      {/* Current snapshot with deltas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Tile 
          label="AIV (%)" 
          value={data.aiv.toFixed(1)} 
          delta={data.deltas?.deltaAIV}
          confidence={data.confidence?.ci95}
        />
        <Tile 
          label="ATI (%)" 
          value={data.ati.toFixed(1)} 
          delta={data.deltas?.deltaATI}
        />
        <Tile 
          label="CRS (%)" 
          value={data.crs.toFixed(1)} 
          delta={data.deltas?.deltaCRS}
        />
        <Tile 
          label="Elasticity ($/pt)" 
          value={data.elasticity_usd_per_pt.toFixed(2)} 
        />
      </div>

      {/* Model quality indicator */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-400">Model Quality: R² = {data.r2.toFixed(2)}</p>
        {data.confidence && (
          <p className="text-slate-400">
            95% CI: [{data.confidence.ci95[0].toFixed(1)}, {data.confidence.ci95[1].toFixed(1)}]
          </p>
        )}
      </div>

      {/* 8-week elasticity trend with confidence bands */}
      {history.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-2">AIV Trend (Kalman Smoothed)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history}>
              <XAxis 
                dataKey="week_start" 
                stroke="#888" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#1e293b", 
                  border: "none",
                  borderRadius: "8px"
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="aiv"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Additional metrics */}
      {data.confidence && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400">Standard Error</p>
            <p className="text-white font-semibold">{data.confidence.standardError}</p>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400">Sample Size</p>
            <p className="text-white font-semibold">{data.confidence.sampleSize}</p>
          </div>
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400">Algorithm</p>
            <p className="text-white font-semibold">{data.metadata?.algorithm || 'Standard'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface TileProps {
  label: string;
  value: string;
  delta?: number;
  confidence?: [number, number];
}

function Tile({ label, value, delta, confidence }: TileProps) {
  const deltaColor = delta && delta > 0 ? 'text-green-400' : delta && delta < 0 ? 'text-red-400' : 'text-slate-400';
  const deltaSymbol = delta && delta > 0 ? '+' : '';

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-blue-400 mb-1">{value}</p>
      {delta !== undefined && (
        <p className={`text-sm ${deltaColor}`}>
          {deltaSymbol}{delta.toFixed(1)}
        </p>
      )}
      {confidence && (
        <p className="text-xs text-slate-500 mt-1">
          [{confidence[0].toFixed(1)}, {confidence[1].toFixed(1)}]
        </p>
      )}
    </div>
  );
}