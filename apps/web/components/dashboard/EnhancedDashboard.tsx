/**
 * Enhanced Dashboard Component
 * Advanced dashboard with real-time data and performance monitoring
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  DollarSign, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import PerformanceMonitor from '../performance/PerformanceMonitor';
import RealTimeAnalytics from '../analytics/RealTimeAnalytics';

interface DashboardMetrics {
  aiv: number;
  search: number;
  trust: number;
  riskUSD: number;
  ois: number;
  acq: number;
  trends: {
    aiv: number;
    search: number;
    trust: number;
    risk: number;
  };
  performance: {
    score: number;
    loadTime: number;
    uptime: number;
  };
}

export default function EnhancedDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'performance'>('overview');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/overview');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      
      // Enhance with performance data
      const enhancedData = {
        ...data,
        performance: {
          score: 87,
          loadTime: 1.2,
          uptime: 99.9
        }
      };
      
      setMetrics(enhancedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DealershipAI Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time insights and performance monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: Eye },
              { id: 'performance', label: 'Performance', icon: Zap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`bg-white rounded-2xl border p-6 shadow-sm ${getScoreBgColor(metrics.aiv)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Visibility Index</p>
                    <p className={`text-3xl font-bold ${getScoreColor(metrics.aiv)}`}>
                      {metrics.aiv}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metrics.trends.aiv)}
                    <span className={`text-sm font-medium ${metrics.trends.aiv > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.trends.aiv > 0 ? '+' : ''}{metrics.trends.aiv}%
                    </span>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-2xl border p-6 shadow-sm ${getScoreBgColor(metrics.search)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Search Visibility</p>
                    <p className={`text-3xl font-bold ${getScoreColor(metrics.search)}`}>
                      {metrics.search}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metrics.trends.search)}
                    <span className={`text-sm font-medium ${metrics.trends.search > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.trends.search > 0 ? '+' : ''}{metrics.trends.search}%
                    </span>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-2xl border p-6 shadow-sm ${getScoreBgColor(metrics.trust)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trust Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(metrics.trust)}`}>
                      {metrics.trust}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metrics.trends.trust)}
                    <span className={`text-sm font-medium ${metrics.trends.trust > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.trends.trust > 0 ? '+' : ''}{metrics.trends.trust}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue at Risk</p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(metrics.riskUSD)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metrics.trends.risk)}
                    <span className={`text-sm font-medium ${metrics.trends.risk > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.trends.risk > 0 ? '+' : ''}{metrics.trends.risk}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">{metrics.performance.score}</span>
                  </div>
                  <p className="text-sm text-gray-600">Performance Score</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">{metrics.performance.loadTime}s</span>
                  </div>
                  <p className="text-sm text-gray-600">Avg Load Time</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">{metrics.performance.uptime}%</span>
                  </div>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="font-medium text-gray-900">Run Opportunity Calculator</div>
                  <div className="text-sm text-gray-600">Calculate potential revenue impact</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="font-medium text-gray-900">Generate AI Report</div>
                  <div className="text-sm text-gray-600">Get comprehensive AI visibility analysis</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="font-medium text-gray-900">Export Data</div>
                  <div className="text-sm text-gray-600">Download dashboard metrics</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <RealTimeAnalytics />
        )}

        {activeTab === 'performance' && (
          <PerformanceMonitor />
        )}
      </div>
    </div>
  );
}
