'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  CircleStackIcon as DatabaseIcon
} from '@heroicons/react/24/outline';
import { trpc } from '@/lib/trpc';

interface EnhancedAISearchHealthTabProps {
  auditData?: any;
  recommendations?: any[];
}

export default function EnhancedAISearchHealthTab({ auditData, recommendations }: EnhancedAISearchHealthTabProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch real data from the sources API
  const { data: geoMetrics, isLoading: metricsLoading } = trpc.sources.getGeoSignalMetrics.useQuery({
    timeframe: selectedTimeframe
  });

  const { data: externalSources, isLoading: sourcesLoading } = trpc.sources.getExternalSources.useQuery({
    limit: 10
  });

  const { data: providerBreakdown, isLoading: providerLoading } = trpc.sources.getProviderBreakdown.useQuery();

  const { data: activityTimeline, isLoading: timelineLoading } = trpc.sources.getActivityTimeline.useQuery({
    days: selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90
  });

  const [realTimeData, setRealTimeData] = useState({
    activeQueries: 0,
    responseTime: 0,
    errorRate: 0,
    uptime: 99.9
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        activeQueries: Math.floor(Math.random() * 50) + 10,
        responseTime: Math.floor(Math.random() * 200) + 100,
        errorRate: Math.random() * 2,
        uptime: 99.9 - Math.random() * 0.1
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: 'excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 60) return { status: 'good', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 40) return { status: 'fair', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { status: 'poor', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
    ) : trend === 'down' ? (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
    ) : (
      <div className="w-4 h-4 bg-gray-400 rounded-full" />
    );
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'seopowersuite:blog': return '📝';
      case 'google:news': return '📰';
      case 'bing:web': return '🔍';
      case 'yahoo:finance': return '💰';
      default: return '🌐';
    }
  };

  if (metricsLoading || sourcesLoading || providerLoading || timelineLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <CpuChipIcon className="w-8 h-8 text-blue-400" />
            AI Search Health
          </h2>
          <p className="text-gray-400 mt-1">
            Real-time monitoring powered by external data sources
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d')}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <div className="text-right">
            <div className="text-sm text-gray-400">Last Updated</div>
            <div className="text-white font-medium">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Health Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">AI Search Health Overview</h3>
          <div className="flex items-center gap-2">
            {getTrendIcon(geoMetrics?.trend || 'stable')}
            <span className="text-sm text-gray-400">
              {geoMetrics?.trend === 'up' ? '+5.2%' : geoMetrics?.trend === 'down' ? '-2.1%' : 'Stable'} this {selectedTimeframe}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (geoMetrics?.averageGeoChecklistScore || 0) / 100)}`}
                className="text-blue-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{geoMetrics?.averageGeoChecklistScore || 0}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">AI Exposure</div>
                <div className="text-lg font-semibold text-white">{geoMetrics?.averageAioExposure || 0}%</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">Knowledge Graph</div>
                <div className="text-lg font-semibold text-white">{geoMetrics?.kgPresenceRate || 0}%</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-sm text-gray-400">Active Sources</div>
          </div>
          <div className="text-2xl font-bold text-white">{externalSources?.length || 0}</div>
          <div className="text-xs text-green-400">+{activityTimeline?.[0]?.count || 0} today</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
          <div className="text-2xl font-bold text-white">{realTimeData.responseTime}ms</div>
          <div className="text-xs text-blue-400">-5% improvement</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-sm text-gray-400">Error Rate</div>
          </div>
          <div className="text-2xl font-bold text-white">{realTimeData.errorRate.toFixed(1)}%</div>
          <div className="text-xs text-red-400">+0.2% increase</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className="text-2xl font-bold text-white">{realTimeData.uptime.toFixed(1)}%</div>
          <div className="text-xs text-green-400">99.9% target</div>
        </motion.div>
      </div>

      {/* Geo Signal Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Geo Signal Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Topical Depth</span>
              <span className="text-lg font-semibold text-white">{geoMetrics?.averageTopicalDepth || 0}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-blue-500"
                style={{ width: `${geoMetrics?.averageTopicalDepth || 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">KG Completeness</span>
              <span className="text-lg font-semibold text-white">{geoMetrics?.averageKgCompleteness || 0}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-green-500"
                style={{ width: `${geoMetrics?.averageKgCompleteness || 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Extractability</span>
              <span className="text-lg font-semibold text-white">{geoMetrics?.averageExtractability || 0}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-purple-500"
                style={{ width: `${geoMetrics?.averageExtractability || 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
          <div className="space-y-3">
            {providerBreakdown?.map((provider, index) => (
              <div key={provider.provider} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getProviderIcon(provider.provider)}</span>
                  <span className="text-sm text-gray-300">{provider.provider}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{provider.count}</span>
                  <span className="text-xs text-gray-400">({provider.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity Timeline</h3>
        <div className="space-y-3">
          {activityTimeline?.slice(0, 7).map((activity, index) => (
            <div key={activity.date} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-300">{activity.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white">{activity.count} sources</span>
                <div className="flex gap-1">
                  {activity.providers.slice(0, 3).map((provider, idx) => (
                    <span key={idx} className="text-xs">{getProviderIcon(provider)}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Refresh Data Sources
        </button>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
          Run Health Check
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          Export Report
        </button>
      </div>
    </div>
  );
}
