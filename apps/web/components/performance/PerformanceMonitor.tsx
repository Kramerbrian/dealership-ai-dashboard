/**
 * Performance Monitor Component
 * Real-time performance tracking and visualization
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface PerformanceMetric {
  page: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timestamp: string;
}

interface PerformanceAlert {
  type: 'SLOW_LOAD' | 'HIGH_CLS' | 'LONG_FID' | 'API_ERROR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  threshold: number;
  actual: number;
  timestamp: string;
}

interface PerformanceData {
  performanceScore: number;
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  summary: {
    totalMetrics: number;
    totalAlerts: number;
    criticalAlerts: number;
    averageLoadTime: number;
  };
}

export default function PerformanceMonitor() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/performance/monitor?timeRange=1h');
      if (!response.ok) throw new Error('Failed to fetch performance data');
      
      const performanceData = await response.json();
      setData(performanceData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Performance Monitor Error</h3>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        <button 
          onClick={fetchPerformanceData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Performance Score Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance Score</h3>
          {getScoreIcon(data.performanceScore)}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`text-4xl font-bold ${getScoreColor(data.performanceScore)}`}>
            {data.performanceScore}
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  data.performanceScore >= 90 ? 'bg-green-500' :
                  data.performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.performanceScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {data.performanceScore >= 90 ? 'Excellent' :
               data.performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Avg Load Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {Math.round(data.summary.averageLoadTime)}ms
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Total Metrics</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {data.summary.totalMetrics}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Total Alerts</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {data.summary.totalAlerts}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Critical Alerts</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {data.summary.criticalAlerts}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {data.alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {data.alerts.slice(0, 5).map((alert, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{alert.type.replace('_', ' ')}</span>
                  <span className="text-sm opacity-75">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{alert.message}</p>
                <div className="flex items-center space-x-2 mt-2 text-xs">
                  <span>Threshold: {alert.threshold}</span>
                  <span>•</span>
                  <span>Actual: {alert.actual}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>Performance trends chart will be displayed here</p>
            <p className="text-sm">Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
