'use client';

import { useEffect, useState } from 'react';
import { PulseScoreOutput } from '@/lib/ai/formulas';

interface PulseScoreCardProps {
  dealerId: string;
}

export function PulseScoreCard({ dealerId }: PulseScoreCardProps) {
  const [score, setScore] = useState<PulseScoreOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pulse/score?dealerId=${dealerId}`)
      .then(res => res.json())
      .then(data => {
        setScore(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch pulse score:', err);
        setLoading(false);
      });
  }, [dealerId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <p className="text-gray-500">Failed to load pulse score</p>
      </div>
    );
  }

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-red-600';
    if (value < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBg = (value: number) => {
    if (value < 50) return 'bg-red-50 border-red-200';
    if (value < 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className={`rounded-2xl border ${getStatusBg(score.pulse_score)} bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pulse Score</h3>
        <span className={`text-sm font-medium ${getStatusColor(score.pulse_score)}`}>
          {score.trends.direction === 'up' ? '↗' : score.trends.direction === 'down' ? '↘' : '→'}
        </span>
      </div>
      
      <div className="mb-4">
        <div className={`text-4xl font-mono tabular-nums font-bold ${getStatusColor(score.pulse_score)}`}>
          {score.pulse_score.toFixed(1)}
        </div>
        <p className="text-sm text-gray-500 mt-1">Confidence: {(score.confidence * 100).toFixed(0)}%</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">AI Visibility</div>
          <div className="text-sm font-semibold">{score.signals.aiv.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Trust Index</div>
          <div className="text-sm font-semibold">{score.signals.ati.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Zero-Click</div>
          <div className="text-sm font-semibold">{score.signals.zero_click.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">UGC Health</div>
          <div className="text-sm font-semibold">{score.signals.ugc_health.toFixed(0)}</div>
        </div>
      </div>

      {score.recommendations.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="text-xs font-semibold text-gray-700 mb-2">Recommendations</div>
          <ul className="space-y-1">
            {score.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-gray-600">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
