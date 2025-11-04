'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  database: {
    healthy: boolean;
    latency?: number;
    error?: string;
  };
  queries: {
    avgQueryTime: number;
    slowQueryCount: number;
    totalQueries: number;
    queriesByModel: Record<string, { count: number; avgDuration: number }>;
  };
  api: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    topEndpoints: Array<{
      endpoint: string;
      method: string;
      totalRequests: number;
      avgResponseTime: number;
    }>;
  };
}

async function fetchPerformanceMetrics(): Promise<PerformanceMetrics> {
  const [healthRes, dbMetricsRes, apiMetricsRes] = await Promise.all([
    fetch('/api/health'),
    fetch('/api/admin/db-metrics'),
    fetch('/api/admin/api-analytics'),
  ]);

  const health = await healthRes.json();
  const dbMetrics = await dbMetricsRes.json();
  const apiMetrics = await apiMetricsRes.json();

  return {
    database: health.data?.database || { healthy: false },
    queries: dbMetrics.metrics || {
      avgQueryTime: 0,
      slowQueryCount: 0,
      totalQueries: 0,
      queriesByModel: {},
    },
    api: apiMetrics.data?.summary || {
      totalRequests: 0,
      avgResponseTime: 0,
      errorRate: 0,
      topEndpoints: [],
    },
  };
}

export default function PerformanceDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: fetchPerformanceMetrics,
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10s if enabled
    staleTime: 5000, // Consider data stale after 5s
  });

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  if (isLoading && !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Auto-refresh (10s)</span>
        </label>
      </div>

      {/* Database Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Database Health</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className={`text-2xl font-bold ${data?.database.healthy ? 'text-green-600' : 'text-red-600'}`}>
              {data?.database.healthy ? 'Healthy' : 'Unhealthy'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Latency</div>
            <div className="text-2xl font-bold text-gray-900">
              {data?.database.latency ? `${data.database.latency}ms` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Last Check</div>
            <div className="text-sm text-gray-900">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Query Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Query Performance</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Queries</div>
            <div className="text-2xl font-bold text-gray-900">{data?.queries.totalQueries || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Avg Query Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {data?.queries.avgQueryTime ? `${Math.round(data.queries.avgQueryTime)}ms` : '0ms'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Slow Queries</div>
            <div className={`text-2xl font-bold ${(data?.queries.slowQueryCount || 0) > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
              {data?.queries.slowQueryCount || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Models Tracked</div>
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(data?.queries.queriesByModel || {}).length}
            </div>
          </div>
        </div>

        {Object.keys(data?.queries.queriesByModel || {}).length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Queries by Model</h3>
            <div className="space-y-2">
              {Object.entries(data?.queries.queriesByModel || {}).map(([model, stats]: [string, any]) => (
                <div key={model} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{model}</span>
                  <span className="text-sm text-gray-600">
                    {stats.count} queries, avg {Math.round(stats.avgDuration)}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* API Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">API Performance</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600">Total Requests</div>
            <div className="text-2xl font-bold text-gray-900">{data?.api.totalRequests || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {data?.api.avgResponseTime ? `${Math.round(data.api.avgResponseTime)}ms` : '0ms'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Error Rate</div>
            <div className={`text-2xl font-bold ${(data?.api.errorRate || 0) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
              {data?.api.errorRate ? `${(data.api.errorRate * 100).toFixed(2)}%` : '0%'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Top Endpoints</div>
            <div className="text-2xl font-bold text-gray-900">{data?.api.topEndpoints?.length || 0}</div>
          </div>
        </div>

        {data?.api.topEndpoints && data.api.topEndpoints.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Top Endpoints</h3>
            <div className="space-y-2">
              {data.api.topEndpoints.slice(0, 10).map((endpoint: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">
                    {endpoint.method} {endpoint.endpoint}
                  </span>
                  <span className="text-sm text-gray-600">
                    {endpoint.totalRequests} req, avg {Math.round(endpoint.avgResponseTime)}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
}

