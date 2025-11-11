'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TrendAnalysis } from '@/lib/pulse/trends';

interface TrendChartProps {
  dealerId: string;
  metric?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export function TrendChart({ dealerId, metric = 'pulse_score', timeRange }: TrendChartProps) {
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      dealerId,
      metric,
    });

    if (timeRange) {
      params.append('start', timeRange.start.toISOString());
      params.append('end', timeRange.end.toISOString());
    }

    fetch(`/api/pulse/trends?${params}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch trend data');
        }
        return res.json();
      })
      .then((data: TrendAnalysis) => {
        setTrends(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch trend data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      });
  }, [dealerId, metric, timeRange]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !trends) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <p className="text-gray-500" role="alert">{error || 'Failed to load trend data'}</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = trends.historical.map((point) => ({
    timestamp: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: point.pulseScore,
    aiv: point.signals.aiv,
    ati: point.signals.ati,
    zero_click: point.signals.zero_click,
    ugc_health: point.signals.ugc_health,
    geo_trust: point.signals.geo_trust,
  }));

  const getTrendColor = (direction: string) => {
    if (direction === 'up') return 'text-green-600';
    if (direction === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (direction: string) => {
    if (direction === 'up') return '↗';
    if (direction === 'down') return '↘';
    return '→';
  };

  const formatMetricName = (metric: string): string => {
    const nameMap: Record<string, string> = {
      pulse_score: 'Pulse Score',
      aiv: 'AI Visibility',
      ati: 'Algorithmic Trust',
      zero_click: 'Zero-Click Defense',
      ugc_health: 'UGC Health',
      geo_trust: 'Geo Trust',
    };
    return nameMap[metric] || metric;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatMetricName(metric)} • {trends.timeRange.days.toFixed(0)} days
          </p>
        </div>
        <div className={`text-2xl font-bold ${getTrendColor(trends.trend.direction)}`}>
          {getTrendIcon(trends.trend.direction)}
        </div>
      </div>

      {/* Trend Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-xs text-blue-700 mb-1">Current Score</div>
          <div className="text-xl font-bold text-blue-900">{trends.current.score.toFixed(1)}</div>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
          <div className="text-xs text-purple-700 mb-1">Velocity</div>
          <div className="text-xl font-bold text-purple-900">
            {trends.trend.velocity > 0 ? '+' : ''}{trends.trend.velocity.toFixed(2)}/day
          </div>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="text-xs text-amber-700 mb-1">Acceleration</div>
          <div className="text-xl font-bold text-amber-900">
            {trends.trend.acceleration > 0 ? '+' : ''}{trends.trend.acceleration.toFixed(3)}/day²
          </div>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-700 mb-1">Confidence</div>
          <div className="text-xl font-bold text-gray-900">{(trends.trend.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
            />
            {metric === 'pulse_score' && (
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
                name="Pulse Score"
              />
            )}
            {metric === 'aiv' && (
              <Line
                type="monotone"
                dataKey="aiv"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
                activeDot={{ r: 5 }}
                name="AI Visibility"
              />
            )}
            {metric === 'ati' && (
              <Line
                type="monotone"
                dataKey="ati"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5 }}
                name="Algorithmic Trust"
              />
            )}
            {metric === 'zero_click' && (
              <Line
                type="monotone"
                dataKey="zero_click"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 3 }}
                activeDot={{ r: 5 }}
                name="Zero-Click"
              />
            )}
            {metric === 'ugc_health' && (
              <Line
                type="monotone"
                dataKey="ugc_health"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: '#ec4899', r: 3 }}
                activeDot={{ r: 5 }}
                name="UGC Health"
              />
            )}
            {metric === 'geo_trust' && (
              <Line
                type="monotone"
                dataKey="geo_trust"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 5 }}
                name="Geo Trust"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <div className="text-xs font-semibold text-gray-700 mb-3">Forecast</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">Next 7 Days</div>
            <div className="text-lg font-bold text-gray-900">{trends.forecast.next7Days.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Next 30 Days</div>
            <div className="text-lg font-bold text-gray-900">{trends.forecast.next30Days.toFixed(1)}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Confidence: {(trends.forecast.confidence * 100).toFixed(0)}%
        </div>
      </div>

      {/* Insights */}
      {trends.insights.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="text-xs font-semibold text-amber-900 mb-2">Key Insights</div>
          <ul className="space-y-1">
            {trends.insights.map((insight, i) => (
              <li key={i} className="text-xs text-amber-800">• {insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
