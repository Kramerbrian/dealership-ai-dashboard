"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModifiersGaugeProps {
  modifiers: {
    temporalWeight: number;
    entityConfidence: number;
    crawlBudgetMult: number;
    inventoryTruthMult: number;
  };
}

export default function ModifiersGauge({ modifiers }: ModifiersGaugeProps) {
  const modifierData = [
    {
      key: 'temporalWeight',
      name: 'Temporal Weight',
      value: modifiers.temporalWeight,
      description: 'Time-decay weighting for recent signals',
      max: 2,
      optimal: 1.2,
      unit: '×'
    },
    {
      key: 'entityConfidence',
      name: 'Entity Confidence',
      value: modifiers.entityConfidence,
      description: 'AI entity recognition accuracy',
      max: 1,
      optimal: 0.85,
      unit: ''
    },
    {
      key: 'crawlBudgetMult',
      name: 'Crawl Budget Multiplier',
      value: modifiers.crawlBudgetMult,
      description: 'Search engine crawl allocation boost',
      max: 2,
      optimal: 1.3,
      unit: '×'
    },
    {
      key: 'inventoryTruthMult',
      name: 'Inventory Truth Multiplier',
      value: modifiers.inventoryTruthMult,
      description: 'Data accuracy and freshness factor',
      max: 2,
      optimal: 1.4,
      unit: '×'
    }
  ];

  const getStatusColor = (value: number, optimal: number, max: number) => {
    const ratio = value / optimal;
    if (ratio >= 0.95) return 'text-green-400';
    if (ratio >= 0.75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (value: number, optimal: number) => {
    const ratio = value / optimal;
    if (ratio >= 0.95) return { text: 'Excellent', className: 'bg-green-500/20 text-green-400 border-green-500/50' };
    if (ratio >= 0.85) return { text: 'Good', className: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
    if (ratio >= 0.75) return { text: 'Fair', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
    return { text: 'Needs Attention', className: 'bg-red-500/20 text-red-400 border-red-500/50' };
  };

  const GaugeArc = ({ value, max }: { value: number; max: number }) => {
    const percentage = (value / max) * 100;
    const centerX = 60;
    const centerY = 60;
    const radius = 45;
    const strokeWidth = 8;
    const circumference = Math.PI * radius; // Half circle
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <svg width="120" height="80" className="mx-auto">
        {/* Background arc */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* Center text */}
        <text x={centerX} y={centerY - 5} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
          {value.toFixed(2)}
        </text>
        <text x={centerX} y={centerY + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
          of {max}
        </text>
      </svg>
    );
  };

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <h3 className="text-xl font-semibold mb-6 text-white">Performance Modifiers</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modifierData.map((modifier) => {
          const status = getStatusBadge(modifier.value, modifier.optimal);
          return (
            <div
              key={modifier.key}
              className="p-5 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-lg border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-1">{modifier.name}</h4>
                  <p className="text-xs text-gray-400">{modifier.description}</p>
                </div>
                <Badge className={status.className}>{status.text}</Badge>
              </div>

              <GaugeArc value={modifier.value} max={modifier.max} />

              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Value</span>
                  <span className={`font-bold ${getStatusColor(modifier.value, modifier.optimal, modifier.max)}`}>
                    {modifier.value.toFixed(2)}{modifier.unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Target Optimal</span>
                  <span className="font-semibold text-green-400">{modifier.optimal.toFixed(2)}{modifier.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Performance</span>
                  <span className="font-semibold text-white">
                    {Math.min(100, (modifier.value / modifier.optimal) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Modifier Score */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div>
            <div className="text-sm text-gray-300 mb-1">Composite Modifier Score</div>
            <div className="text-xs text-gray-400">Weighted average of all modifiers</div>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {(
              (modifiers.temporalWeight / 2 * 0.25 +
              modifiers.entityConfidence * 0.25 +
              modifiers.crawlBudgetMult / 2 * 0.25 +
              modifiers.inventoryTruthMult / 2 * 0.25) * 100
            ).toFixed(1)}%
          </div>
        </div>
      </div>
    </Card>
  );
}
