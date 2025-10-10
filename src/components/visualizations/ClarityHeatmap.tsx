"use client";

import { Card } from "@/components/ui/card";

interface ClarityHeatmapProps {
  clarity: {
    scs: number;
    sis: number;
    adi: number;
    scr: number;
    selComposite: number;
  };
  secondarySignals?: {
    engagementDepth?: number;
    technicalHealth?: number;
    localEntityAccuracy?: number;
    brandSemanticFootprint?: number;
  };
}

export default function ClarityHeatmap({ clarity, secondarySignals }: ClarityHeatmapProps) {
  const clarityData = [
    { key: 'scs', name: 'SCS', fullName: 'Semantic Clarity Score', value: clarity.scs, description: 'Content meaning and context accuracy' },
    { key: 'sis', name: 'SIS', fullName: 'Structural Information Score', value: clarity.sis, description: 'Schema and markup completeness' },
    { key: 'adi', name: 'ADI', fullName: 'AI Discovery Index', value: clarity.adi, description: 'LLM crawlability and parsing' },
    { key: 'scr', name: 'SCR', fullName: 'Signal Confidence Rating', value: clarity.scr, description: 'Data reliability and consistency' },
    { key: 'selComposite', name: 'SEL', fullName: 'SEL Composite', value: clarity.selComposite, description: 'Overall signal clarity composite' }
  ];

  const secondaryData = secondarySignals ? [
    { key: 'engagementDepth', name: 'Engagement Depth', value: secondarySignals.engagementDepth, description: 'User interaction quality' },
    { key: 'technicalHealth', name: 'Technical Health', value: secondarySignals.technicalHealth, description: 'Site performance and stability' },
    { key: 'localEntityAccuracy', name: 'Local Entity Accuracy', value: secondarySignals.localEntityAccuracy, description: 'NAP consistency and accuracy' },
    { key: 'brandSemanticFootprint', name: 'Brand Semantic Footprint', value: secondarySignals.brandSemanticFootprint, description: 'Brand presence in knowledge graphs' }
  ].filter(s => s.value !== undefined) : [];

  const getColorFromValue = (value: number, isPrimary: boolean = true) => {
    const normalized = isPrimary ? value : value / 100;
    if (normalized >= 0.9) return { bg: 'bg-green-500', text: 'text-green-400', intensity: 'rgba(16, 185, 129, 0.8)' };
    if (normalized >= 0.8) return { bg: 'bg-emerald-500', text: 'text-emerald-400', intensity: 'rgba(16, 185, 129, 0.6)' };
    if (normalized >= 0.7) return { bg: 'bg-yellow-500', text: 'text-yellow-400', intensity: 'rgba(245, 158, 11, 0.6)' };
    if (normalized >= 0.6) return { bg: 'bg-orange-500', text: 'text-orange-400', intensity: 'rgba(249, 115, 22, 0.6)' };
    return { bg: 'bg-red-500', text: 'text-red-400', intensity: 'rgba(239, 68, 68, 0.6)' };
  };

  const getScoreLabel = (value: number, isPrimary: boolean = true) => {
    const normalized = isPrimary ? value : value / 100;
    if (normalized >= 0.9) return 'Excellent';
    if (normalized >= 0.8) return 'Good';
    if (normalized >= 0.7) return 'Fair';
    if (normalized >= 0.6) return 'Needs Work';
    return 'Critical';
  };

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <h3 className="text-xl font-semibold mb-6 text-white">Signal Clarity Heatmap</h3>

      {/* Primary Clarity Metrics */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Primary Clarity Signals</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clarityData.map((metric) => {
            const color = getColorFromValue(metric.value);
            const score = getScoreLabel(metric.value);
            return (
              <div
                key={metric.key}
                className="p-4 rounded-lg border border-white/10 transition-all hover:scale-105"
                style={{ backgroundColor: `${color.intensity}15`, borderColor: color.intensity }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-lg font-bold text-white">{metric.name}</div>
                    <div className="text-xs text-gray-400">{metric.fullName}</div>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: color.intensity }}
                  >
                    {(metric.value * 100).toFixed(0)}
                  </div>
                </div>
                <p className="text-xs text-gray-300 mb-3">{metric.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${color.text}`}>{score}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded-sm ${i < Math.floor(metric.value * 5) ? color.bg : 'bg-white/10'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Signals */}
      {secondaryData.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Secondary Signals</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {secondaryData.map((signal) => {
              const color = getColorFromValue(signal.value!, false);
              const score = getScoreLabel(signal.value!, false);
              return (
                <div
                  key={signal.key}
                  className="p-4 rounded-lg border border-white/10"
                  style={{ backgroundColor: `${color.intensity}10`, borderColor: color.intensity }}
                >
                  <div className="text-sm font-semibold text-white mb-1">{signal.name}</div>
                  <div className="text-2xl font-bold text-white mb-2">{signal.value!.toFixed(1)}%</div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color.bg} transition-all duration-500`}
                      style={{ width: `${signal.value}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{signal.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Clarity Summary */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Average Clarity</div>
            <div className="text-3xl font-bold text-white">
              {(Object.values(clarity).reduce((sum, val) => sum + val, 0) / Object.values(clarity).length * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Strongest Signal</div>
            <div className="text-2xl font-bold text-green-400">
              {clarityData.reduce((max, m) => m.value > max.value ? m : max).name}
            </div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Needs Focus</div>
            <div className="text-2xl font-bold text-yellow-400">
              {clarityData.reduce((min, m) => m.value < min.value ? m : min).name}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
