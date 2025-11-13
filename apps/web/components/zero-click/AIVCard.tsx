/**
 * AI Visibility Index (AVI) Card
 * Shows "How visible your store is in AI answers" with confidence bands
 */

'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface AVIData {
  date: string;
  avi: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export default function AIVCard({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<AVIData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ai-visibility?tenantId=${tenantId}&days=30`)
      .then(r => r.json())
      .then(d => {
        setData(d.series || []);
        setLoading(false);
      })
      .catch(() => {
        // Mock data for development
        setData(generateMockAVIData());
        setLoading(false);
      });
  }, [tenantId]);

  const latest = data.at(-1);
  const trend = data.length > 1 
    ? ((data[data.length - 1]?.avi || 0) - (data[data.length - 2]?.avi || 0))
    : 0;

  return (
    <div className="rounded-2xl p-6 bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Visibility Index</h3>
        </div>
        <span className="text-xs text-gray-500 font-medium">AVI</span>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-mono font-semibold tabular-nums text-gray-900 mb-1">
          {latest ? `${(latest.avi * 100).toFixed(1)}%` : loading ? '—' : '—'}
        </div>
        <div className="text-sm text-gray-600">
          {latest && (
            <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend * 100).toFixed(1)}% vs last week
            </span>
          )}
          {!latest && !loading && 'How visible your store is in AI answers.'}
        </div>
      </div>

      <div className="h-44 mb-4">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="aviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                hide 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 1]} 
                tickCount={5}
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'AVI']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="avi" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#aviGradient)"
              />
              {/* Confidence bands */}
              <Area 
                type="monotone" 
                dataKey="confidenceLow" 
                stroke="none" 
                fill="#e5e7eb" 
                fillOpacity={0.2}
              />
              <Area 
                type="monotone" 
                dataKey="confidenceHigh" 
                stroke="none" 
                fill="#e5e7eb" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {latest && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confidence range</span>
            <span className="font-medium text-gray-900">
              {(latest.confidenceLow * 100).toFixed(0)}% - {(latest.confidenceHigh * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function generateMockAVIData(): AVIData[] {
  const data: AVIData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseAvi = 0.72 + (Math.random() - 0.5) * 0.1;
    const confidence = 0.08;
    
    data.push({
      date: date.toISOString().split('T')[0],
      avi: Math.max(0, Math.min(1, baseAvi)),
      confidenceLow: Math.max(0, baseAvi - confidence),
      confidenceHigh: Math.min(1, baseAvi + confidence)
    });
  }
  
  return data;
}

