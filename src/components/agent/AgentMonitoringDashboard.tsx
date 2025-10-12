'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Zap, Globe, BarChart3, RefreshCw } from 'lucide-react';

interface MonitoringData {
  totalQueries: number;
  cacheHitRate: number;
  averageCost: number;
  totalCost: number;
  geographicPools: Record<string, number>;
  queryTypes: Record<string, number>;
  lastUpdated: string;
}

export default function AgentMonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/agent-monitoring');
      if (response.ok) {
        const monitoringData = await response.json();
        setData(monitoringData);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="text-center text-gray-500">
          Failed to load monitoring data
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Agent Performance</h3>
        <button
          onClick={fetchData}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Queries</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {data.totalQueries.toLocaleString()}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Cache Hit Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatPercentage(data.cacheHitRate)}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Avg Cost</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(data.averageCost)}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {formatCurrency(data.totalCost)}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Geographic Distribution</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(data.geographicPools).map(([city, count]) => (
            <div key={city} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-gray-900">{city}</div>
              <div className="text-lg font-bold text-gray-700">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Query Types */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Query Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.queryTypes).map(([type, count]) => (
            <div key={type} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-gray-900 capitalize">
                {type.replace('_', ' ')}
              </div>
              <div className="text-lg font-bold text-gray-700">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Optimization Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">Cost Optimization Status</span>
        </div>
        <div className="text-sm text-gray-700">
          <div className="flex justify-between items-center">
            <span>Cache Hit Rate:</span>
            <span className={`font-medium ${data.cacheHitRate > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
              {formatPercentage(data.cacheHitRate)} {data.cacheHitRate > 0.8 ? '✅' : '⚠️'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Average Cost per Query:</span>
            <span className={`font-medium ${data.averageCost < 0.02 ? 'text-green-600' : 'text-yellow-600'}`}>
              {formatCurrency(data.averageCost)} {data.averageCost < 0.02 ? '✅' : '⚠️'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total Monthly Cost:</span>
            <span className={`font-medium ${data.totalCost < 10 ? 'text-green-600' : 'text-yellow-600'}`}>
              {formatCurrency(data.totalCost)} {data.totalCost < 10 ? '✅' : '⚠️'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4 text-center">
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
