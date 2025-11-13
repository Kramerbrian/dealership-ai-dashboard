"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

interface AVIHeaderProps {
  aiv: number;
  ati: number;
  crs: number;
  iti: number;
  cis: number;
  elasticity: number;
  r2: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export function AVIHeader({
  aiv,
  ati,
  crs,
  iti,
  cis,
  elasticity,
  r2,
  trend = 'neutral',
  trendValue = 0
}: AVIHeaderProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Visibility Intelligence™</h1>
          <p className="text-blue-100">Comprehensive algorithmic trust and visibility metrics</p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
        >
          <Info className="w-4 h-4" />
          <span>Details</span>
        </button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MetricCard
          title="AIV™"
          subtitle="Algorithmic Visibility Index"
          value={aiv.toFixed(1)}
          unit="%"
          description="Overall AI search visibility"
        />
        <MetricCard
          title="ATI™"
          subtitle="Algorithmic Trust Index"
          value={ati.toFixed(1)}
          unit="%"
          description="Trustworthiness in AI systems"
        />
        <MetricCard
          title="CRS™"
          subtitle="Content Reliability Score"
          value={crs.toFixed(1)}
          unit="%"
          description="Content precision and freshness"
        />
        <MetricCard
          title="ITI™"
          subtitle="Inventory Truth Index"
          value={iti.toFixed(1)}
          unit="%"
          description="Inventory accuracy and consistency"
        />
        <MetricCard
          title="CIS™"
          subtitle="Clarity Intelligence Score"
          value={cis.toFixed(1)}
          unit=""
          description="How well you're understood"
        />
      </div>

      {/* Elasticity and Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-sm text-blue-100 mb-1">Elasticity</div>
            <div className="text-2xl font-bold">${elasticity.toFixed(0)}/pt</div>
            <div className="text-xs text-blue-200">R² = {r2.toFixed(2)}</div>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trendValue > 0 ? '+' : ''}{trendValue}% this week
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-blue-100 mb-1">Overall Performance</div>
          <div className="text-3xl font-bold">
            {((aiv + ati + crs + iti + cis) / 5).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-medium mb-2">Visibility Components</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Search Engine Presence</span>
                  <span>{(aiv * 0.4).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Model Citations</span>
                  <span>{(aiv * 0.3).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Content Discoverability</span>
                  <span>{(aiv * 0.3).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-medium mb-2">Trust Components</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Review Authenticity</span>
                  <span>{(ati * 0.35).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Entity Accuracy</span>
                  <span>{(ati * 0.25).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Content Authority</span>
                  <span>{(ati * 0.4).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  subtitle,
  value,
  unit,
  description
}: {
  title: string;
  subtitle: string;
  value: string;
  unit: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
      <div className="text-xs text-blue-100 mb-1">{subtitle}</div>
      <div className="text-2xl font-bold mb-1">{value}{unit}</div>
      <div className="text-xs text-blue-200">{description}</div>
    </div>
  );
}
