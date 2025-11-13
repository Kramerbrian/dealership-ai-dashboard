'use client';
import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export default function PerformanceBudget() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate performance metrics fetch
    const mockMetrics: PerformanceMetrics = {
      lcp: 1.2, // Good: < 2.5s
      cls: 0.05, // Good: < 0.1
      fid: 45, // Good: < 100ms
      fcp: 0.8, // Good: < 1.8s
      ttfb: 200 // Good: < 600ms
    };

    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, []);

  const getMetricStatus = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      lcp: { good: 2.5, needsImprovement: 4.0 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fid: { good: 100, needsImprovement: 300 },
      fcp: { good: 1.8, needsImprovement: 3.0 },
      ttfb: { good: 600, needsImprovement: 1500 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  const formatMetric = (metric: string, value: number) => {
    switch (metric) {
      case 'lcp':
      case 'fcp':
        return `${value.toFixed(1)}s`;
      case 'cls':
        return value.toFixed(3);
      case 'fid':
      case 'ttfb':
        return `${value}ms`;
      default:
        return value.toString();
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-4 shadow-sm">
        <div className="text-center text-gray-500">
          <p>No performance data available</p>
        </div>
      </div>
    );
  }

  const metricEntries = Object.entries(metrics);
  const goodCount = metricEntries.filter(([metric, value]) => 
    getMetricStatus(metric, value) === 'good'
  ).length;
  const overallScore = Math.round((goodCount / metricEntries.length) * 100);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>⚡</span>
          Performance Budget
        </h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
          overallScore >= 80 ? 'good' : overallScore >= 60 ? 'needs-improvement' : 'poor'
        )}`}>
          {overallScore}%
        </div>
      </div>

      <div className="space-y-3">
        {metricEntries.map(([metric, value]) => {
          const status = getMetricStatus(metric, value);
          const displayName = {
            lcp: 'LCP',
            cls: 'CLS',
            fid: 'FID',
            fcp: 'FCP',
            ttfb: 'TTFB'
          }[metric] || metric.toUpperCase();

          return (
            <div key={metric} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getStatusIcon(status)}</span>
                <span className="text-sm font-medium text-gray-700">{displayName}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono tabular-nums font-semibold text-gray-900">
                  {formatMetric(metric, value)}
                </div>
                <div className={`text-xs px-1 py-0.5 rounded ${getStatusColor(status)}`}>
                  {status.replace('-', ' ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Core Web Vitals</span>
          <button className="text-blue-600 hover:text-blue-800 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
