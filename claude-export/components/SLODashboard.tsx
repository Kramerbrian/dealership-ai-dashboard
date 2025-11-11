/**
 * SLO Dashboard Component
 *
 * Displays Service Level Objectives (SLOs) for all API endpoints:
 * - p95 latency
 * - Error rates
 * - Availability
 * - SLO breaches
 *
 * Usage:
 * <SLODashboard />
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface SLOReport {
  endpoint: string;
  window: string;
  metrics: {
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    requestCount: number;
    availability: number;
  };
  breaches: Array<{
    type: 'latency' | 'error_rate' | 'availability';
    threshold: number;
    actual: number;
    timestamp: string;
  }>;
}

interface SLOData {
  reports: SLOReport[];
  summary: {
    totalEndpoints: number;
    totalBreaches: number;
    avgAvailability: number;
    healthy: boolean;
    window: string;
  };
  timestamp: string;
}

export default function SLODashboard() {
  const [data, setData] = useState<SLOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<'1h' | '24h' | '7d'>('1h');

  useEffect(() => {
    async function fetchSLO() {
      setLoading(true);
      try {
        const response = await fetch(`/api/slo?window=${window}`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('[SLO Dashboard] Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSLO();
    const interval = setInterval(fetchSLO, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [window]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { reports, summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">SLO Dashboard</h2>
            <p className="text-sm text-gray-600">Service Level Objectives Monitoring</p>
          </div>

          {/* Window Selector */}
          <div className="flex gap-2">
            {(['1h', '24h', '7d'] as const).map(w => (
              <button
                key={w}
                onClick={() => setWindow(w)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  window === w
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              {summary.healthy ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <div className={`text-2xl font-bold ${summary.healthy ? 'text-green-600' : 'text-red-600'}`}>
              {summary.healthy ? 'Healthy' : 'Degraded'}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Availability</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {(summary.avgAvailability * 100).toFixed(3)}%
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Endpoints</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalEndpoints}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Breaches</span>
            </div>
            <div className={`text-2xl font-bold ${summary.totalBreaches > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.totalBreaches}
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint Reports */}
      <div className="space-y-4">
        {reports.map(report => (
          <div
            key={report.endpoint}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow"
          >
            {/* Endpoint Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-mono">
                  {report.endpoint}
                </h3>
                <p className="text-sm text-gray-600">
                  {report.metrics.requestCount.toLocaleString()} requests
                </p>
              </div>
              {report.breaches.length > 0 && (
                <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  {report.breaches.length} {report.breaches.length === 1 ? 'breach' : 'breaches'}
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-600">p50 Latency</div>
                <div className="text-lg font-semibold text-gray-900">
                  {report.metrics.p50.toFixed(0)}ms
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">p95 Latency</div>
                <div className={`text-lg font-semibold ${
                  report.metrics.p95 > 500 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {report.metrics.p95.toFixed(0)}ms
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">p99 Latency</div>
                <div className="text-lg font-semibold text-gray-900">
                  {report.metrics.p99.toFixed(0)}ms
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Error Rate</div>
                <div className={`text-lg font-semibold ${
                  report.metrics.errorRate > 0.01 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {(report.metrics.errorRate * 100).toFixed(2)}%
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Availability</div>
                <div className={`text-lg font-semibold ${
                  report.metrics.availability < 0.999 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {(report.metrics.availability * 100).toFixed(3)}%
                </div>
              </div>
            </div>

            {/* Breaches */}
            {report.breaches.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">SLO Breaches:</div>
                <div className="space-y-2">
                  {report.breaches.map((breach, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-900">
                          {breach.type === 'latency' && 'Latency SLO Breach'}
                          {breach.type === 'error_rate' && 'Error Rate SLO Breach'}
                          {breach.type === 'availability' && 'Availability SLO Breach'}
                        </div>
                        <div className="text-xs text-red-700 mt-1">
                          Threshold: {breach.type === 'latency' ? `${breach.threshold}ms` : `${(breach.threshold * 100).toFixed(2)}%`}
                          {' • '}
                          Actual: {breach.type === 'latency' ? `${breach.actual.toFixed(0)}ms` : `${(breach.actual * 100).toFixed(2)}%`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {reports.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data</h3>
            <p className="text-sm text-gray-600">
              No API requests recorded in the selected time window.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
