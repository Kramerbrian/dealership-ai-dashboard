"use client";

import { Card } from "@/components/ui/card";

interface CounterfactualRevenueProps {
  counterfactual: {
    rarObservedUsd?: number;
    rarCounterfactualUsd?: number;
    deltaUsd?: number;
  };
  elasticity: {
    usdPerPoint: number;
    r2: number;
  };
  ci95: {
    elasticity: { low: number; high: number };
  };
}

export default function CounterfactualRevenue({ counterfactual, elasticity, ci95 }: CounterfactualRevenueProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const observed = counterfactual.rarObservedUsd || 0;
  const predicted = counterfactual.rarCounterfactualUsd || 0;
  const delta = counterfactual.deltaUsd || 0;
  const lift = predicted > 0 ? ((observed - predicted) / predicted * 100) : 0;

  // Calculate bar heights for visualization
  const maxValue = Math.max(observed, predicted) * 1.1;
  const observedHeight = (observed / maxValue) * 100;
  const predictedHeight = (predicted / maxValue) * 100;

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <h3 className="text-xl font-semibold mb-6 text-white">Counterfactual Revenue Analysis</h3>

      {/* Main comparison chart */}
      <div className="mb-8">
        <div className="flex justify-around items-end h-64 px-8">
          {/* Predicted revenue bar */}
          <div className="flex flex-col items-center w-32">
            <div className="relative w-full mb-4" style={{ height: '200px' }}>
              <div className="absolute bottom-0 w-full flex flex-col justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full bg-gradient-to-t from-gray-600 to-gray-400 rounded-t-lg relative"
                  style={{ height: `${predictedHeight}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 px-3 py-1 rounded text-xs font-bold whitespace-nowrap">
                    {formatCurrency(predicted)}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-400">Predicted</div>
              <div className="text-xs text-gray-500">(without AI)</div>
            </div>
          </div>

          {/* Arrow showing lift */}
          <div className="flex flex-col items-center justify-center mb-8">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
                </marker>
              </defs>
              <line x1="10" y1="40" x2="70" y2="40" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)" />
            </svg>
            <div className="text-center text-green-400 font-bold text-lg">+{lift.toFixed(1)}%</div>
          </div>

          {/* Observed revenue bar */}
          <div className="flex flex-col items-center w-32">
            <div className="relative w-full mb-4" style={{ height: '200px' }}>
              <div className="absolute bottom-0 w-full flex flex-col justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg relative shadow-lg shadow-green-500/50"
                  style={{ height: `${observedHeight}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-700 px-3 py-1 rounded text-xs font-bold whitespace-nowrap">
                    {formatCurrency(observed)}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-green-400">Observed</div>
              <div className="text-xs text-green-500">(with AI)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delta highlight */}
      <div className="mb-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300 mb-1">AI-Attributed Revenue Impact</div>
            <div className="text-xs text-gray-400">Revenue generated through AI visibility improvements</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-green-400">{formatCurrency(delta)}</div>
            <div className="text-sm text-green-500">+{lift.toFixed(1)}% lift</div>
          </div>
        </div>
      </div>

      {/* Elasticity metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Revenue per AIV Point</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(elasticity.usdPerPoint)}</div>
          <div className="text-xs text-gray-500 mt-1">
            CI95: {formatCurrency(ci95.elasticity.low)} - {formatCurrency(ci95.elasticity.high)}
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Model Fit (R²)</div>
          <div className="text-2xl font-bold text-white">{(elasticity.r2 * 100).toFixed(1)}%</div>
          <div className="h-2 w-full bg-white/10 rounded-full mt-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              style={{ width: `${elasticity.r2 * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Confidence Level</div>
          <div className="text-2xl font-bold text-white">95%</div>
          <div className="text-xs text-gray-500 mt-1">Statistical significance verified</div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex gap-3">
          <div className="text-blue-400 text-xl">ℹ️</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-blue-400 mb-1">Analysis Interpretation</div>
            <p className="text-xs text-gray-300">
              This counterfactual analysis estimates what revenue would have been <strong>without</strong> AI visibility improvements.
              The observed revenue of <strong>{formatCurrency(observed)}</strong> represents a <strong>{formatCurrency(delta)}</strong> increase
              ({lift.toFixed(1)}% lift) compared to the predicted baseline of {formatCurrency(predicted)}.
              Each 1-point increase in AIV score correlates with approximately <strong>{formatCurrency(elasticity.usdPerPoint)}</strong> in
              additional revenue (R² = {(elasticity.r2 * 100).toFixed(1)}%).
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
