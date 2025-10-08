'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { trpc } from '@/lib/trpc';
import type { Intent, PriorityRow } from '@/lib/aoer-metrics';

interface AOERAnalyticsTabProps {
  auditData?: any;
}

export default function AOERAnalyticsTab({ auditData }: AOERAnalyticsTabProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedIntent, setSelectedIntent] = useState<Intent | 'all'>('all');

  // Fetch AOER dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = trpc.aoer.getDashboardTiles.useQuery({
    useDemoData: true,
    timeframe: selectedTimeframe
  });

  // Fetch priority scores
  const { data: priorityScores, isLoading: priorityLoading } = trpc.aoer.getPriorityScores.useQuery({
    limit: 20,
    intent: selectedIntent === 'all' ? undefined : selectedIntent,
    useDemoData: true
  });

  // Fetch AOER by intent
  const { data: aoerByIntent, isLoading: intentLoading } = trpc.aoer.getAOERByIntent.useQuery({
    useDemoData: true
  });

  // Fetch click loss analysis
  const { data: clickLossData, isLoading: clickLossLoading } = trpc.aoer.getClickLossAnalysis.useQuery({
    timeframe: selectedTimeframe,
    useDemoData: true
  });

  // Fetch ACS distribution
  const { data: acsDistribution, isLoading: acsLoading } = trpc.aoer.getACSDistribution.useQuery({
    useDemoData: true
  });

  const getIntentColor = (intent: Intent) => {
    const colors = {
      local: 'text-blue-400 bg-blue-500/20',
      inventory: 'text-green-400 bg-green-500/20',
      finance: 'text-purple-400 bg-purple-500/20',
      trade: 'text-orange-400 bg-orange-500/20',
      info: 'text-cyan-400 bg-cyan-500/20',
      service: 'text-red-400 bg-red-500/20',
      brand: 'text-yellow-400 bg-yellow-500/20',
    };
    return colors[intent];
  };

  const getIntentIcon = (intent: Intent) => {
    const icons = {
      local: '📍',
      inventory: '🚗',
      finance: '💰',
      trade: '🔄',
      info: 'ℹ️',
      service: '🔧',
      brand: '⭐',
    };
    return icons[intent];
  };

  const getACSRiskColor = (acs: number) => {
    if (acs >= 80) return 'text-red-400 bg-red-500/20';
    if (acs >= 60) return 'text-yellow-400 bg-yellow-500/20';
    if (acs >= 40) return 'text-orange-400 bg-orange-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getACSRiskLabel = (acs: number) => {
    if (acs >= 80) return 'High Risk';
    if (acs >= 60) return 'Medium Risk';
    if (acs >= 40) return 'Low Risk';
    return 'No Risk';
  };

  if (dashboardLoading || priorityLoading || intentLoading || clickLossLoading || acsLoading) {
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
            <CpuChipIcon className="w-8 h-8 text-purple-400" />
            AOER Analytics
          </h2>
          <p className="text-gray-400 mt-1">
            AI Overview Exposure Rate metrics and click-loss analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value as Intent | 'all')}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Intents</option>
            <option value="local">Local</option>
            <option value="inventory">Inventory</option>
            <option value="finance">Finance</option>
            <option value="trade">Trade</option>
            <option value="info">Info</option>
            <option value="service">Service</option>
            <option value="brand">Brand</option>
          </select>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d')}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm text-gray-400">AOER</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round((dashboardData?.tiles.AOER || 0) * 100)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            AI Overview Exposure Rate
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-xl p-6 border border-red-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-sm text-gray-400">Avg ACS</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(dashboardData?.tiles.Avg_ACS || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            AI Claim Score (Risk)
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-600/20 to-cyan-600/20 rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-sm text-gray-400">Cited Share</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round((dashboardData?.tiles.Cited_In_AI_Share || 0) * 100)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            In AI Overviews
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-600/20 to-red-600/20 rounded-xl p-6 border border-yellow-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-sm text-gray-400">Click Loss</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(clickLossData?.totalClickLoss || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Monthly clicks lost
          </div>
        </motion.div>
      </div>

      {/* AOER by Intent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">AOER by Intent</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {aoerByIntent?.data && Object.entries(aoerByIntent.data).map(([intent, metrics]) => (
            <div key={intent} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{getIntentIcon(intent as Intent)}</span>
                <span className="text-sm font-medium text-white capitalize">{intent}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">AOER</span>
                  <span className="text-sm font-semibold text-white">
                    {Math.round(metrics.aoer * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Weighted</span>
                  <span className="text-sm font-semibold text-white">
                    {Math.round(metrics.aoer_w * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${metrics.aoer * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Priority Queries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Priority Queries</h3>
        <div className="space-y-3">
          {priorityScores?.slice(0, 10).map((query, index) => (
            <motion.div
              key={query.query}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-600/50 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-300">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-white">{query.query}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(query.intent)}`}>
                      {getIntentIcon(query.intent)} {query.intent}
                    </span>
                    <span className="text-xs text-gray-400">
                      Priority: {Math.round(query.Priority)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {Math.round(query.loss)} clicks lost
                  </div>
                  <div className="text-xs text-gray-400">Monthly</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getACSRiskColor(query.ACS).split(' ')[0]}`}>
                    ACS: {Math.round(query.ACS)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getACSRiskLabel(query.ACS)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Click Loss Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Click Loss by Intent</h3>
          <div className="space-y-3">
            {clickLossData?.clickLossByIntent && Object.entries(clickLossData.clickLossByIntent).map(([intent, data]) => (
              <div key={intent} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getIntentIcon(intent as Intent)}</span>
                  <span className="text-sm text-gray-300 capitalize">{intent}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-red-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (data.total / (clickLossData?.totalClickLoss || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-16 text-right">
                    {Math.round(data.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">ACS Distribution</h3>
          <div className="space-y-3">
            {acsDistribution?.distribution && Object.entries(acsDistribution.distribution).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 capitalize">{category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        category === 'excellent' ? 'bg-red-500' :
                        category === 'good' ? 'bg-yellow-500' :
                        category === 'fair' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(count / (acsDistribution?.totalQueries || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
          Run AOER Analysis
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Export Priority Report
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          View Detailed Metrics
        </button>
      </div>
    </div>
  );
}
