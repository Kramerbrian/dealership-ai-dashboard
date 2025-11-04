'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Eye, 
  Clock, 
  Globe, 
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface TrafficData {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  trafficSources: Array<{
    source: string;
    users: number;
    percentage: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
}

interface TrafficAnalyticsProps {
  propertyId: string;
  dateRange?: string;
  className?: string;
}

// Fetch function for React Query
async function fetchTrafficData(
  propertyId: string,
  dateRange: string
): Promise<TrafficData> {
  const response = await fetch(
    `/api/analytics/ga4?propertyId=${propertyId}&metric=traffic&dateRange=${dateRange}`
  );
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch traffic data');
  }
  
  return result.data as TrafficData;
}

export function TrafficAnalytics({ 
  propertyId, 
  dateRange = '30d', 
  className = '' 
}: TrafficAnalyticsProps) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // React Query hook - replaces fetch/useState/useEffect
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
    isSuccess
  } = useQuery({
    queryKey: ['traffic-analytics', propertyId, dateRange],
    queryFn: () => fetchTrafficData(propertyId, dateRange),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onSuccess: () => {
      setLastUpdated(new Date());
    },
  });

  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;
  const isConnected = isSuccess;

  // Manual refetch handler (for refresh button)
  const handleRefresh = () => {
    refetch();
  };

  // Auto-refresh is handled by React Query (optional refetchInterval)

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading && !data) {
    return (
      <div className={`glass rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[var(--brand-primary)]" />
            Traffic Analytics
          </h3>
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white/10 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[var(--brand-primary)]" />
          Traffic Analytics
        </h3>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs text-white/60">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Last Updated */}
          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Clock className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </motion.div>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-white/5 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-white/70">Total Users</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.totalUsers.toLocaleString() || 0}
          </div>
          <div className="text-xs text-white/60">
            {data?.newUsers.toLocaleString() || 0} new users
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white/5 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/70">Sessions</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.sessions.toLocaleString() || 0}
          </div>
          <div className="text-xs text-white/60">
            {data?.avgSessionDuration ? formatDuration(data.avgSessionDuration) : '0m 0s'} avg
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white/5 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-sm text-white/70">Bounce Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.bounceRate ? formatPercentage(data.bounceRate) : '0%'}
          </div>
          <div className="text-xs text-white/60">
            {data?.bounceRate && data.bounceRate < 0.4 ? 'Good' : 'Needs improvement'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white/5 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-white/70">Session Duration</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.avgSessionDuration ? formatDuration(data.avgSessionDuration) : '0m 0s'}
          </div>
          <div className="text-xs text-white/60">
            {data?.avgSessionDuration && data.avgSessionDuration > 120 ? 'Excellent' : 'Good'}
          </div>
        </motion.div>
      </div>

      {/* Traffic Sources */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Traffic Sources
        </h4>
        <div className="space-y-3">
          <AnimatePresence>
            {data?.trafficSources.slice(0, 5).map((source, index) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-white/80 font-medium">
                    {source.source}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {source.users.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">
                      {source.percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Top Pages */}
      <div>
        <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Top Pages
        </h4>
        <div className="space-y-2">
          <AnimatePresence>
            {data?.topPages.slice(0, 5).map((page, index) => (
              <motion.div
                key={page.page}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-white/80 truncate">
                    {page.page === '/' ? 'Home' : page.page}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {page.views.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">
                      {page.uniqueViews.toLocaleString()} unique
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Date Range Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-xs text-white/60">
          <Clock className="w-3 h-3" />
          Data for the last {dateRange}
        </div>
      </div>
    </div>
  );
}
