'use client';

import { useState, useEffect } from 'react';
import { LineChart, TrendingUp } from 'lucide-react';

interface DataPoint {
  date: string;
  score: number;
}

export default function AIVisibilityChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const fetchChartData = async () => {
    const res = await fetch(`/api/dashboard/timeline?range=${timeRange}`);
    const result = await res.json();
    setData(result.data);
  };

  const maxScore = Math.max(...data.map((d) => d.score));
  const minScore = Math.min(...data.map((d) => d.score));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Visibility Trend</h3>
            <p className="text-sm text-slate-500">Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => (
            <line
              key={val}
              x1="0"
              y1={200 - val * 2}
              x2="800"
              y2={200 - val * 2}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Line path */}
          <polyline
            points={data
              .map((point, i) => {
                const x = (i / (data.length - 1)) * 800;
                const y = 200 - point.score * 2;
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient fill */}
          <polygon
            points={`0,200 ${data
              .map((point, i) => {
                const x = (i / (data.length - 1)) * 800;
                const y = 200 - point.score * 2;
                return `${x},${y}`;
              })
              .join(' ')} 800,200`}
            fill="url(#areaGradient)"
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 -ml-8">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Score</p>
          <p className="text-lg font-bold text-slate-900">{data[data.length - 1]?.score || 0}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Peak Score</p>
          <p className="text-lg font-bold text-emerald-600">{maxScore}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Avg Score</p>
          <p className="text-lg font-bold text-blue-600">
            {Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)}
          </p>
        </div>
      </div>
    </div>
  );
}
