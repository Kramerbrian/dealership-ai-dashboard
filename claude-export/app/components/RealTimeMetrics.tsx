'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

interface RealTimeMetricsProps {
  tenantId: string;
}

export default function RealTimeMetrics({ tenantId }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * 2,
          change: (Math.random() - 0.5) * 5,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdated: new Date().toISOString()
        }))
      );
      setLastUpdate(new Date());
    }, 5000);

    // Initial data load
    setMetrics([
      {
        id: 'ai-visibility',
        name: 'AI Visibility Index',
        value: 87.3,
        change: 2.1,
        trend: 'up',
        status: 'good',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'zero-click-rate',
        name: 'Zero-Click Rate',
        value: 34.2,
        change: -1.2,
        trend: 'down',
        status: 'warning',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'ugc-health',
        name: 'UGC Health',
        value: 91.5,
        change: 0.8,
        trend: 'up',
        status: 'good',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'trust-signals',
        name: 'Trust Signals',
        value: 78.9,
        change: -3.1,
        trend: 'down',
        status: 'critical',
        lastUpdated: new Date().toISOString()
      }
    ]);
    setIsConnected(true);
    setLastUpdate(new Date());

    return () => clearInterval(interval);
  }, [tenantId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Real-time Metrics</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`p-6 rounded-xl border-2 ${getStatusColor(metric.status)} transition-all duration-200 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(metric.status)}
                <h3 className="font-semibold text-gray-900">{metric.name}</h3>
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                {metric.value.toFixed(1)}%
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">vs last hour</span>
              </div>
              
              <div className="text-xs text-gray-500">
                Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700">
              AI visibility increased by 2.1% in the last 5 minutes
            </span>
            <span className="text-xs text-gray-500 ml-auto">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700">
              Zero-click rate dropped below threshold
            </span>
            <span className="text-xs text-gray-500 ml-auto">
              {new Date(Date.now() - 30000).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700">
              New competitor analysis completed
            </span>
            <span className="text-xs text-gray-500 ml-auto">
              {new Date(Date.now() - 60000).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
