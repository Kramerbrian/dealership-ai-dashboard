'use client';
import useSWR from 'swr';
import { WebVitalMetric, PerformanceBudget } from '@/app/api/web-vitals/route';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PerformanceBudgetMonitor() {
  const { data, error, isLoading } = useSWR<PerformanceBudget>('/api/web-vitals', fetcher, {
    refreshInterval: 30000 // Refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 shadow">
        <div className="text-sm text-red-600">Failed to load performance data</div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating: string) => {
    if (rating === 'good') return 'bg-green-100 text-green-700';
    if (rating === 'needs-improvement') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↑'; // Worse (higher values are bad)
    if (trend < 0) return '↓'; // Better
    return '→';
  };

  const getTrendColor = (trend: number, metric: string) => {
    // For CLS, lower is better. For time metrics, lower is better.
    const isBetter = trend < 0;
    return isBetter ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-base">Performance Budget</div>
          <div className="text-xs text-gray-500">Core Web Vitals</div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(data.overallScore)}`}>
            {data.overallScore}
          </div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      </div>

      {/* Critical Issues Alert */}
      {data.criticalIssues > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold">⚠️</span>
            <div className="text-sm">
              <div className="font-medium text-red-900">
                {data.criticalIssues} critical {data.criticalIssues === 1 ? 'issue' : 'issues'}
              </div>
              <div className="text-xs text-red-700">
                Poor ratings detected. Auto-fix playbooks available.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics List */}
      <div className="space-y-3">
        {data.vitals.map((vital) => (
          <div key={vital.name} className="border-t pt-3 first:border-t-0 first:pt-0">
            {/* Metric Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm">{vital.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRatingColor(vital.rating)}`}>
                  {vital.rating === 'good' && '✓ Good'}
                  {vital.rating === 'needs-improvement' && '⚠ Needs Work'}
                  {vital.rating === 'poor' && '✗ Poor'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {vital.value.toFixed(vital.name === 'CLS' ? 2 : 0)}{vital.unit}
                </div>
                <div className={`text-xs ${getTrendColor(vital.trend, vital.name)}`}>
                  {getTrendIcon(vital.trend)} {Math.abs(vital.trend).toFixed(vital.name === 'CLS' ? 2 : 0)}{vital.unit} WoW
                </div>
              </div>
            </div>

            {/* Target Line */}
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs text-gray-500">
                Target: ≤ {vital.target}{vital.unit}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    vital.rating === 'good'
                      ? 'bg-green-500'
                      : vital.rating === 'needs-improvement'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min((vital.value / (vital.target * 2)) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Diagnosis */}
            {vital.diagnosis && (
              <div className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Cause:</span> {vital.diagnosis}
              </div>
            )}

            {/* Suggested Fix */}
            {vital.suggestedFix && (
              <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                <div className="font-medium text-blue-900 mb-1">💡 Suggested Fix:</div>
                <div className="text-blue-700">{vital.suggestedFix}</div>
              </div>
            )}

            {/* Page URL */}
            <div className="text-xs text-gray-400 mt-1">
              Page: {vital.pageUrl}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t pt-3 text-xs text-gray-500">
        Last checked: {new Date(data.lastChecked).toLocaleString()}
      </div>
    </div>
  );
}
