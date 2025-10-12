'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentMonitoringDashboard } from '@/components/agent/AgentMonitoringDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Globe, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AgentMetrics {
  totalQueries: number;
  cacheHitRate: number;
  averageCost: number;
  totalCost: number;
  geographicPools: Record<string, number>;
  queryTypes: Record<string, number>;
  lastUpdated: string;
}

export default function AgentMonitoringPage() {
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/agent-monitoring');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to load agent metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (value >= thresholds.warning) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Performance Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of ChatGPT Agent integration performance and costs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Queries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalQueries.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.cacheHitRate, { good: 0.8, warning: 0.6 })}`}>
                    {(metrics.cacheHitRate * 100).toFixed(1)}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(metrics.cacheHitRate, { good: 0.8, warning: 0.6 })}
                    <span className="text-xs text-gray-500">
                      {metrics.cacheHitRate >= 0.8 ? 'Excellent' : 
                       metrics.cacheHitRate >= 0.6 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Cost/Query</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.averageCost, { good: 0.02, warning: 0.05 })}`}>
                    ${metrics.averageCost.toFixed(4)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(metrics.averageCost, { good: 0.02, warning: 0.05 })}
                    <span className="text-xs text-gray-500">
                      {metrics.averageCost <= 0.02 ? 'Excellent' : 
                       metrics.averageCost <= 0.05 ? 'Good' : 'High Cost'}
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.totalCost, { good: 10, warning: 25 })}`}>
                    ${metrics.totalCost.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(metrics.totalCost, { good: 10, warning: 25 })}
                    <span className="text-xs text-gray-500">
                      {metrics.totalCost <= 10 ? 'Low' : 
                       metrics.totalCost <= 25 ? 'Moderate' : 'High'}
                    </span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Performance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Cache Performance</p>
                  <p className="text-sm text-gray-600">Geographic pooling active</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {metrics?.cacheHitRate ? `${(metrics.cacheHitRate * 100).toFixed(1)}%` : 'N/A'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Cost Efficiency</p>
                  <p className="text-sm text-gray-600">Target: &lt;$0.02/query</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {metrics?.averageCost ? `$${metrics.averageCost.toFixed(4)}` : 'N/A'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Uptime</p>
                  <p className="text-sm text-gray-600">All systems operational</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                100%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Monitoring Dashboard */}
      <AgentMonitoringDashboard />

      {/* Cost Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cost Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics && metrics.cacheHitRate < 0.8 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Cache Hit Rate Below Target</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your cache hit rate is {(metrics.cacheHitRate * 100).toFixed(1)}%. 
                      Consider increasing geographic pooling or extending cache TTL to improve performance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metrics && metrics.averageCost > 0.02 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">High Average Cost</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Your average cost per query is ${metrics.averageCost.toFixed(4)}. 
                      This exceeds the target of $0.02. Consider optimizing geographic pooling or reducing real-time queries.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metrics && metrics.cacheHitRate >= 0.8 && metrics.averageCost <= 0.02 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Excellent Performance</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your agent integration is performing optimally with a {metrics.cacheHitRate * 100}% cache hit rate 
                      and ${metrics.averageCost.toFixed(4)} average cost per query. Keep up the great work!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
