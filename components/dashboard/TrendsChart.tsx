'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendsChartProps {
  historical: Array<{
    date: string;
    overall: number;
    aiVisibility: number;
    zeroClickShield: number;
    ugcHealth: number;
    geoTrust: number;
    sgpIntegrity: number;
  }>;
  predictions?: {
    next7Days: number;
    next30Days: number;
    confidence: number;
  };
}

export default function TrendsChart({ historical, predictions }: TrendsChartProps) {
  // Format data for chart
  const chartData = historical.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Overall: point.overall,
    'AI Visibility': point.aiVisibility,
    'Zero-Click': point.zeroClickShield,
    'UGC Health': point.ugcHealth,
    'Geo Trust': point.geoTrust,
    'Schema': point.sgpIntegrity,
  }));

  // Add prediction points if available
  if (predictions && chartData.length > 0) {
    const lastDate = new Date(historical[historical.length - 1].date);
    const next7Date = new Date(lastDate);
    next7Date.setDate(next7Date.getDate() + 7);
    const next30Date = new Date(lastDate);
    next30Date.setDate(next30Date.getDate() + 30);

    chartData.push({
      date: next7Date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Overall: predictions.next7Days,
      'AI Visibility': 0,
      'Zero-Click': 0,
      'UGC Health': 0,
      'Geo Trust': 0,
      'Schema': 0,
    });

    chartData.push({
      date: next30Date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Overall: predictions.next30Days,
      'AI Visibility': 0,
      'Zero-Click': 0,
      'UGC Health': 0,
      'Geo Trust': 0,
      'Schema': 0,
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Historical Trends & Predictions</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            domain={[0, 100]}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey="Overall" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ fill: '#10B981', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="AI Visibility" 
            stroke="#3B82F6" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="Zero-Click" 
            stroke="#8B5CF6" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
      {predictions && (
        <div className="mt-4 text-sm text-gray-400">
          <div className="flex items-center justify-between">
            <span>7-Day Forecast: <span className="text-emerald-400 font-semibold">{predictions.next7Days.toFixed(1)}</span></span>
            <span>30-Day Forecast: <span className="text-emerald-400 font-semibold">{predictions.next30Days.toFixed(1)}</span></span>
            <span>Confidence: <span className="text-blue-400 font-semibold">{(predictions.confidence * 100).toFixed(0)}%</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

