'use client';
import { useState, useEffect } from 'react';

interface AIHealthData {
  overallHealth: number;
  platforms: Array<{
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    inclusionRate: number;
    lastSeen: string;
    latency: number;
    errors: number;
  }>;
  trends: {
    week: number;
    month: number;
    quarter: number;
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export default function AIHealthPanel() {
  const [data, setData] = useState<AIHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIHealthData = async () => {
      try {
        // Simulate API call - in production this would come from your AI health monitoring
        const mockData: AIHealthData = {
          overallHealth: 87,
          platforms: [
            {
              name: 'Google AIO',
              status: 'healthy',
              inclusionRate: 0.34,
              lastSeen: new Date().toISOString(),
              latency: 1200,
              errors: 0
            },
            {
              name: 'ChatGPT',
              status: 'warning',
              inclusionRate: 0.28,
              lastSeen: new Date(Date.now() - 3600000).toISOString(),
              latency: 2100,
              errors: 2
            },
            {
              name: 'Gemini',
              status: 'healthy',
              inclusionRate: 0.31,
              lastSeen: new Date().toISOString(),
              latency: 1800,
              errors: 0
            },
            {
              name: 'Perplexity',
              status: 'critical',
              inclusionRate: 0.12,
              lastSeen: new Date(Date.now() - 7200000).toISOString(),
              latency: 4500,
              errors: 8
            }
          ],
          trends: {
            week: 5.2,
            month: 12.8,
            quarter: 23.4
          },
          alerts: [
            {
              id: '1',
              type: 'error',
              message: 'Perplexity API timeout - 8 errors in last hour',
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              type: 'warning',
              message: 'ChatGPT inclusion rate dropped 15% this week',
              timestamp: new Date(Date.now() - 1800000).toISOString()
            }
          ]
        };

        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch AI health data:', error);
        setLoading(false);
      }
    };

    fetchAIHealthData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
        <div className="text-center text-gray-500">
          <p>No AI health data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>🤖</span>
          AI Health Monitor
        </h3>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor('healthy')}`}>
            {data.overallHealth}% Health
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Platform Status</h4>
        <div className="space-y-2">
          {data.platforms.map((platform, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedPlatform === platform.name ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
              }`}
              onClick={() => setSelectedPlatform(selectedPlatform === platform.name ? null : platform.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(platform.status)}</span>
                  <span className="font-medium">{platform.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(platform.status)}`}>
                    {platform.status}
                  </span>
                </div>
                <div className="text-right text-sm">
                  <div>{(platform.inclusionRate * 100).toFixed(1)}% inclusion</div>
                  <div className="text-xs text-gray-500">{platform.latency}ms latency</div>
                </div>
              </div>
              
              {selectedPlatform === platform.name && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Last seen: {new Date(platform.lastSeen).toLocaleString()}</div>
                    <div>Errors: {platform.errors}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Trends</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">+{data.trends.week}%</div>
            <div className="text-xs text-green-600">This Week</div>
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">+{data.trends.month}%</div>
            <div className="text-xs text-blue-600">This Month</div>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <div className="text-lg font-bold text-purple-600">+{data.trends.quarter}%</div>
            <div className="text-xs text-purple-600">This Quarter</div>
          </div>
        </div>
      </div>

      {data.alerts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Alerts</h4>
          <div className="space-y-1">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-xs">
                <span className="text-lg">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <button className="text-blue-600 hover:text-blue-800">View Details</button>
        </div>
      </div>
    </div>
  );
}
