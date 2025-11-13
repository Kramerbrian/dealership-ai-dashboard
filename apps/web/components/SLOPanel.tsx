'use client';
import { useState, useEffect } from 'react';

interface SLOData {
  overall: {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    total: number;
    healthy: number;
    warning: number;
    breached: number;
    healthPercentage: number;
  };
  metrics: Array<{
    name: string;
    p95ms: number;
    sloMs: number;
    breached: boolean;
    status: 'OK' | 'WARNING' | 'BREACHED';
  }>;
  detailed: Record<string, any>;
  ts: string;
}

const fetcher = (url: string): Promise<SLOData> => 
  fetch(url).then(r => r.json());

export default function SLOPanel() {
  const [data, setData] = useState<SLOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      if (!loading) setRefreshing(true);
      const result = await fetcher('/api/observability');
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SLO data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-700 bg-green-100 border-green-200';
      case 'WARNING': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'BREACHED': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 bg-green-50 border-green-200';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
      case 'WARNING': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
      case 'BREACHED': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
      default: return null;
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'WARNING': return (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
      case 'CRITICAL': return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      default: return null;
    }
  };

  if (loading && !data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="font-semibold text-red-800">SLO Monitors - Error</div>
        </div>
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button 
          onClick={fetchData}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">SLO Monitors</h3>
            <p className="text-sm text-gray-500">Real-time performance tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            Auto-refresh
          </label>
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overall Health Status */}
      <div className={`mb-6 p-4 rounded-xl border ${getOverallStatusColor(data.overall.status)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getHealthIcon(data.overall.status)}
            <span className="text-sm font-semibold">Overall Health</span>
          </div>
          <span className={`text-sm font-bold ${getOverallStatusColor(data.overall.status).split(' ')[0]}`}>
            {data.overall.status}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{data.overall.healthy}</div>
            <div className="text-gray-600">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{data.overall.warning}</div>
            <div className="text-gray-600">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{data.overall.breached}</div>
            <div className="text-gray-600">Breached</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{data.overall.healthPercentage}%</div>
            <div className="text-gray-600">Health</div>
          </div>
        </div>
      </div>

      {/* SLO Metrics Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700">Endpoint</th>
              <th className="text-center p-4 font-semibold text-gray-700">p95 Latency</th>
              <th className="text-center p-4 font-semibold text-gray-700">SLO Target</th>
              <th className="text-center p-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.metrics.map((metric, index) => (
              <tr key={metric.name} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-mono text-sm text-gray-700">
                      {metric.name.replace('api.', '')}
                    </span>
                  </div>
                </td>
                <td className="text-center p-4">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {metric.p95ms}ms
                  </span>
                </td>
                <td className="text-center p-4">
                  <span className="font-mono text-sm text-gray-500">
                    {metric.sloMs}ms
                  </span>
                </td>
                <td className="text-center p-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                    <span className="ml-1">{metric.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live monitoring active</span>
        </div>
        <span>Last updated: {new Date(data.ts).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
