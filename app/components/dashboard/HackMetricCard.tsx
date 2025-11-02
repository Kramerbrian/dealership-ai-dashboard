'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info, Lock, ExternalLink } from 'lucide-react';

interface Hack {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: number[];
  formula: string;
  insights: string;
  actionable: boolean;
}

interface HackMetricCardProps {
  hack: Hack;
  userTier: 'free' | 'pro' | 'enterprise';
  onUnlock: () => void;
}

export const HackMetricCard: React.FC<HackMetricCardProps> = ({
  hack,
  userTier,
  onUnlock
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isLocked = userTier === 'free';

  // Status configuration
  const statusConfig = {
    good: { color: 'text-green-500', bg: 'bg-green-500/10', dot: 'bg-green-500' },
    warning: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
    critical: { color: 'text-red-500', bg: 'bg-red-500/10', dot: 'bg-red-500' }
  };

  const config = statusConfig[hack.status];

  // Trend direction
  const trendDirection = hack.trend.length > 0 && hack.trend[hack.trend.length - 1] > hack.trend[0] ? 'up' : 'down';
  const trendColor = trendDirection === 'up' 
    ? (hack.status === 'critical' ? 'text-red-500' : 'text-green-500')
    : (hack.status === 'good' ? 'text-red-500' : 'text-green-500');

  return (
    <div className="relative group">
      {/* Card Container */}
      <div className={`p-4 rounded-xl border transition-all duration-200
        bg-gray-800 border-gray-700 hover:border-purple-500/30
        ${isLocked ? 'opacity-50 cursor-pointer' : 'cursor-default'}
      `}
        onClick={isLocked ? onUnlock : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          {/* Status Dot + Name */}
          <div className="flex items-start gap-2 flex-1">
            <div className={`w-2 h-2 rounded-full ${config.dot} flex-shrink-0 mt-1.5`} />
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold text-white leading-tight mb-1
                ${isLocked ? 'blur-sm select-none' : ''}
              `}>
                {hack.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${config.color} font-medium capitalize`}>
                  {hack.status}
                </span>
                {hack.actionable && !isLocked && (
                  <span className="text-xs text-purple-500">• Fixable</span>
                )}
              </div>
            </div>
          </div>

          {/* Info Button */}
          <button
            onMouseEnter={() => !isLocked && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Value Display */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${config.color}
              ${isLocked ? 'blur-md select-none' : ''}
            `}>
              {isLocked ? '88.8' : hack.value.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">{hack.unit}</span>
          </div>
        </div>

        {/* Trend Sparkline */}
        <div className="mb-3">
          {isLocked ? (
            <div className="h-8 rounded bg-gray-700/30 blur-sm" />
          ) : (
            <div className="h-8 rounded bg-gray-700/30 flex items-end gap-1 px-1 py-1">
              {hack.trend.slice(-10).map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t"
                  style={{ height: `${(value / Math.max(...hack.trend)) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">30-day trend</span>
          {!isLocked && hack.trend.length > 0 && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              {trendDirection === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="font-medium">
                {Math.abs((hack.trend[hack.trend.length - 1] - hack.trend[0]) / hack.trend[0] * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center 
            bg-gray-900/60 backdrop-blur-[2px] rounded-xl">
            <div className="text-center">
              <Lock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-purple-500 font-medium">
                Pro Feature
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && !isLocked && (
        <div className="absolute right-0 top-8 w-80 z-50 bg-gray-800 rounded-lg border border-gray-700 shadow-2xl p-3">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-gray-400">Formula</span>
            </div>
            <div className="p-2 rounded bg-gray-900/50 border border-gray-700">
              <code className="text-xs text-white font-mono break-words">
                {hack.formula}
              </code>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-gray-400">Insights</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {hack.insights}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
