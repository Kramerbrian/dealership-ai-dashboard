"use client";

/**
 * GPT Analytics Dashboard
 * 
 * Visualizes GPT interaction metrics, function call performance, and feedback
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AnalyticsData {
  totalInteractions: number;
  successful: number;
  errors: number;
  positiveFeedback: number;
  negativeFeedback: number;
  conversions: number;
  avgFunctionsPerInteraction: number;
  uniqueUsers: number;
  dailyTrends: Array<{
    date: string;
    total: number;
    successful: number;
    errors: number;
    conversions: number;
  }>;
  functionPerformance: Array<{
    function_name: string;
    total_calls: number;
    successful_calls: number;
    avg_execution_time_ms: number;
    error_count: number;
  }>;
}

export function GPTAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['gpt-analytics', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/gpt/analytics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-red-600">Error loading analytics</div>;
  }

  const successRate = data.totalInteractions > 0 
    ? ((data.successful / data.totalInteractions) * 100).toFixed(1)
    : '0';

  const conversionRate = data.totalInteractions > 0
    ? ((data.conversions / data.totalInteractions) * 100).toFixed(1)
    : '0';

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GPT Analytics Dashboard</h1>
          <p className="text-sm text-gray-600">Interaction metrics and function performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Interactions"
          value={data.totalInteractions.toLocaleString()}
          icon={<Activity className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          trend={parseFloat(successRate) > 90 ? 'up' : 'down'}
        />
        <MetricCard
          title="Conversions"
          value={data.conversions.toLocaleString()}
          subtitle={`${conversionRate}% rate`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <MetricCard
          title="Unique Users"
          value={data.uniqueUsers.toLocaleString()}
          icon={<Activity className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* Daily Trends */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Daily Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
            <Line type="monotone" dataKey="successful" stroke="#10b981" name="Successful" />
            <Line type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
            <Line type="monotone" dataKey="conversions" stroke="#8b5cf6" name="Conversions" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Function Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Function Call Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.functionPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="function_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_calls" fill="#3b82f6" name="Total Calls" />
              <Bar dataKey="successful_calls" fill="#10b981" name="Successful" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Function Performance</h2>
          <div className="space-y-4">
            {data.functionPerformance.map((fn, idx) => {
              const successRate = fn.total_calls > 0
                ? ((fn.successful_calls / fn.total_calls) * 100).toFixed(1)
                : '0';
              
              return (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{fn.function_name}</span>
                    <span className="text-sm text-gray-600">{successRate}% success</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{fn.total_calls} calls</span>
                    <span>{fn.avg_execution_time_ms.toFixed(0)}ms avg</span>
                    {fn.error_count > 0 && (
                      <span className="text-red-600">{fn.error_count} errors</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">User Feedback</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{data.positiveFeedback}</div>
            <div className="text-sm text-gray-600">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {data.totalInteractions - data.positiveFeedback - data.negativeFeedback}
            </div>
            <div className="text-sm text-gray-600">Neutral</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{data.negativeFeedback}</div>
            <div className="text-sm text-gray-600">Negative</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string; 
  subtitle?: string;
  icon: React.ReactNode; 
  color: string;
  trend?: 'up' | 'down';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        {trend && (
          trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

