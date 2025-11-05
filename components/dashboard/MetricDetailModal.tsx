'use client';

import { X, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricDetailModalProps {
  metric: 'aiv' | 'ati' | 'crs' | 'rank';
  data: any;
  onClose: () => void;
}

export function MetricDetailModal({ metric, data, onClose }: MetricDetailModalProps) {
  const metricConfig = {
    aiv: {
      title: 'AI Visibility Index',
      description: 'Measures how often your dealership appears in AI search results',
      currentValue: data?.aiv?.overall || 0,
      trend: data?.aiv?.trend || 0,
      chartData: data?.aiv?.history || [],
      breakdown: data?.aiv?.breakdown || []
    },
    ati: {
      title: 'Algorithmic Trust Index',
      description: 'Evaluates trust signals that AI models use to rank your dealership',
      currentValue: data?.ati?.overall || 0,
      trend: data?.ati?.trend || 0,
      chartData: data?.ati?.history || [],
      breakdown: data?.ati?.breakdown || []
    },
    crs: {
      title: 'Composite Reputation Score',
      description: 'Overall reputation across review platforms and social media',
      currentValue: data?.crs || 0,
      trend: data?.crs_trend || 0,
      chartData: data?.crs_history || [],
      breakdown: data?.crs_breakdown || []
    },
    rank: {
      title: 'Market Rank',
      description: 'Your position among competitors in AI visibility',
      currentValue: `#${data?.market_rank || 0}`,
      trend: data?.rank_trend || 0,
      chartData: data?.rank_history || [],
      breakdown: null
    }
  };

  const config = metricConfig[metric];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] 
                    overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 
                      dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {config.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                     transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Value + Trend */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 
                        dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Current Score
                </div>
                <div className="text-5xl font-light text-gray-900 dark:text-white">
                  {config.currentValue}
                </div>
              </div>
              
              {config.trend !== 0 && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  config.trend > 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  <TrendingUp className={`w-5 h-5 ${config.trend < 0 ? 'rotate-180' : ''}`} />
                  <span className="font-semibold">
                    {config.trend > 0 ? '+' : ''}{config.trend}
                  </span>
                  <span className="text-sm">(7 days)</span>
                </div>
              )}
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          {config.chartData && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                7-Day Trend
              </h3>
              <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={config.chartData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Component Breakdown */}
          {config.breakdown && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Component Breakdown
              </h3>
              <div className="space-y-3">
                {config.breakdown.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.value}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's Helping / Hurting */}
          {config.breakdown && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  What's Helping
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  {config.breakdown.filter((b: any) => b.value >= 70).map((item: any, idx: number) => (
                    <li key={idx}>• {item.label}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  What's Hurting
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {config.breakdown.filter((b: any) => b.value < 70).map((item: any, idx: number) => (
                    <li key={idx}>• {item.label}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/analytics'}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white 
                       rounded-lg font-semibold transition-colors"
            >
              View Full Analytics
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                       dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
