'use client';

import { useEffect, useState } from 'react';

interface SLOMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

export default function SLOTiles({ tenantId }: { tenantId: string }) {
  const [metrics, setMetrics] = useState<SLOMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate SLO metrics - in production, fetch from monitoring system
    const mockMetrics: SLOMetric[] = [
      {
        name: 'Feed Lag',
        value: 8,
        threshold: 15,
        unit: 'min',
        status: 'healthy',
        description: 'Time between data collection and availability'
      },
      {
        name: 'Schema Pass Rate',
        value: 97.2,
        threshold: 95,
        unit: '%',
        status: 'healthy',
        description: 'Percentage of pages with valid schema markup'
      },
      {
        name: 'Parity Drift',
        value: 35,
        threshold: 50,
        unit: '$',
        status: 'healthy',
        description: 'Average price difference between sources'
      },
      {
        name: 'API p95 Latency',
        value: 180,
        threshold: 200,
        unit: 'ms',
        status: 'healthy',
        description: '95th percentile API response time'
      }
    ];

    // Simulate some metrics being in warning/critical state
    setTimeout(() => {
      const updatedMetrics = mockMetrics.map(metric => {
        if (metric.name === 'Schema Pass Rate') {
          return { ...metric, value: 92.1, status: 'warning' as const };
        }
        if (metric.name === 'API p95 Latency') {
          return { ...metric, value: 220, status: 'critical' as const };
        }
        return metric;
      });
      
      setMetrics(updatedMetrics);
      setLoading(false);
    }, 1000);
  }, [tenantId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium mb-3">SLO Monitoring</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">SLO Monitoring</div>
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className={`rounded-lg border p-3 ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium">{metric.name}</div>
              <span className="text-sm">{getStatusIcon(metric.status)}</span>
            </div>
            
            <div className="text-lg font-semibold">
              {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
            </div>
            
            <div className="text-xs opacity-75">
              Threshold: {metric.threshold}{metric.unit}
            </div>
            
            <div className="mt-1 text-xs opacity-75 truncate" title={metric.description}>
              {metric.description}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-500">
            {metrics.filter(m => m.status === 'healthy').length} of {metrics.length} metrics healthy
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            View detailed metrics →
          </button>
        </div>
      </div>
    </div>
  );
}
