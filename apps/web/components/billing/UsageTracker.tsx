'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Users,
  Shield,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';

interface UsageData {
  queries: { used: number; limit: number };
  dealerships: { used: number; limit: number };
  storage: { used: number; limit: number };
  apiCalls: { used: number; limit: number };
}

interface UsageHistory {
  date: string;
  queries: number;
  apiCalls: number;
  storage: number;
}

interface UsageTrackerProps {
  usage: UsageData;
}

export default function UsageTracker({ usage }: UsageTrackerProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsageHistory = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockHistory: UsageHistory[] = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          queries: Math.floor(Math.random() * 2000) + 1000,
          apiCalls: Math.floor(Math.random() * 20000) + 5000,
          storage: 2.4 + Math.random() * 0.2
        }));
        setUsageHistory(mockHistory);
      } catch (error) {
        console.error('Failed to fetch usage history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageHistory();
  }, [timeRange]);

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min(100, (used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { status: 'critical', message: 'Limit nearly reached' };
    if (percentage >= 75) return { status: 'warning', message: 'Approaching limit' };
    if (percentage >= 50) return { status: 'moderate', message: 'Moderate usage' };
    return { status: 'good', message: 'Usage is healthy' };
  };

  const usageMetrics = [
    {
      key: 'queries',
      label: 'AI Queries',
      icon: Zap,
      color: 'blue',
      description: 'AI-powered analysis requests'
    },
    {
      key: 'dealerships',
      label: 'Dealerships',
      icon: Users,
      color: 'green',
      description: 'Active dealership locations'
    },
    {
      key: 'storage',
      label: 'Storage',
      icon: Shield,
      color: 'purple',
      description: 'Data storage usage'
    },
    {
      key: 'apiCalls',
      label: 'API Calls',
      icon: BarChart3,
      color: 'orange',
      description: 'API requests made'
    }
  ];

  const formatUsageValue = (key: string, value: number) => {
    switch (key) {
      case 'storage':
        return `${value}GB`;
      case 'queries':
      case 'apiCalls':
        return value.toLocaleString();
      case 'dealerships':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const formatLimitValue = (key: string, value: number) => {
    if (value === -1) return 'Unlimited';
    return formatUsageValue(key, value);
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Usage Analytics</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {usageMetrics.map((metric) => {
          const usageData = usage[metric.key as keyof UsageData];
          const percentage = getUsagePercentage(usageData.used, usageData.limit);
          const status = getUsageStatus(percentage);
          const Icon = metric.icon;

          return (
            <div key={metric.key} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                  <Icon className={`h-5 w-5 text-${metric.color}-600`} />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getUsageColor(percentage)}`}>
                  {status.status}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">
                  {formatUsageValue(metric.key, usageData.used)}
                </div>
                <div className="text-sm text-gray-500">
                  of {formatLimitValue(metric.key, usageData.limit)}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{metric.label}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${metric.color}-600 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">{status.message}</p>
            </div>
          );
        })}
      </div>

      {/* Usage Trends */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Usage Trends</h3>
          <button className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>

        {loading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        ) : (
          <div className="space-y-4">
            {/* Simple trend visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI Queries Trend</h4>
                <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-end gap-1">
                  {usageHistory.slice(-14).map((day, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-t"
                      style={{
                        height: `${(day.queries / Math.max(...usageHistory.map(d => d.queries))) * 100}%`,
                        width: '100%',
                        minHeight: '4px'
                      }}
                      title={`${new Date(day.date).toLocaleDateString()}: ${day.queries.toLocaleString()} queries`}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">API Calls Trend</h4>
                <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-end gap-1">
                  {usageHistory.slice(-14).map((day, index) => (
                    <div
                      key={index}
                      className="bg-orange-500 rounded-t"
                      style={{
                        height: `${(day.apiCalls / Math.max(...usageHistory.map(d => d.apiCalls))) * 100}%`,
                        width: '100%',
                        minHeight: '4px'
                      }}
                      title={`${new Date(day.date).toLocaleDateString()}: ${day.apiCalls.toLocaleString()} calls`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(usageHistory.reduce((sum, day) => sum + day.queries, 0) / usageHistory.length).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Avg Queries/Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(usageHistory.reduce((sum, day) => sum + day.apiCalls, 0) / usageHistory.length).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Avg API Calls/Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.max(...usageHistory.map(d => d.storage)).toFixed(1)}GB
                </div>
                <div className="text-sm text-gray-500">Peak Storage</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Alerts */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Alerts</h3>
        <div className="space-y-3">
          {usageMetrics.map((metric) => {
            const usageData = usage[metric.key as keyof UsageData];
            const percentage = getUsagePercentage(usageData.used, usageData.limit);
            const status = getUsageStatus(percentage);
            
            if (percentage < 75) return null; // Only show alerts for high usage
            
            return (
              <div key={metric.key} className={`p-4 rounded-lg border ${
                percentage >= 90 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center gap-3">
                  {percentage >= 90 ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{metric.label} Usage Alert</div>
                    <div className="text-sm text-gray-600">
                      You've used {percentage.toFixed(1)}% of your {metric.label.toLowerCase()} limit. 
                      {percentage >= 90 ? ' Consider upgrading your plan.' : ' Monitor your usage closely.'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {usageMetrics.every(metric => {
            const usageData = usage[metric.key as keyof UsageData];
            const percentage = getUsagePercentage(usageData.used, usageData.limit);
            return percentage < 75;
          }) && (
            <div className="p-4 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900">All Good!</div>
                  <div className="text-sm text-gray-600">
                    Your usage is within healthy limits across all metrics.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
