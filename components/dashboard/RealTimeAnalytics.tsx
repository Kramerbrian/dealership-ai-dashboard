'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Globe, 
  Clock, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface RealtimeData {
  activeUsers: number;
  pageViews: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  trafficSources: Array<{
    source: string;
    users: number;
  }>;
}

interface RealTimeAnalyticsProps {
  propertyId: string;
  className?: string;
}

export function RealTimeAnalytics({ propertyId, className = '' }: RealTimeAnalyticsProps) {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/ga4?propertyId=${propertyId}&metric=realtime`);
      const result = await response.json();
      
      if ((result as any).success) {
        setData((result as any).data);
        setLastUpdated(new Date());
        setIsConnected(true);
      } else {
        setError((result as any).error || 'Failed to fetch data');
        setIsConnected(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyId) return;
    
    fetchData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [propertyId]);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading && !data) {
    return (
      <div className={`glass rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--brand-primary)]" />
            Live Traffic
          </h3>
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-white/10 rounded animate-pulse"></div>
          <div className="h-4 bg-white/5 rounded animate-pulse"></div>
          <div className="h-4 bg-white/5 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-6 h-6 text-[var(--brand-primary)]" />
          Live Traffic
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
          className="text-center"
        >
          <div className="text-3xl font-bold text-green-400 mb-1">
            {data?.activeUsers || 0}
          </div>
          <div className="text-sm text-white/70">Active Users</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {data?.pageViews || 0}
          </div>
          <div className="text-sm text-white/70">Page Views</div>
        </motion.div>
      </div>

      {/* Top Pages */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
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
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-white/80 truncate">
                    {page.page === '/' ? 'Home' : page.page}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {page.views}
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Traffic Sources */}
      <div>
        <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Traffic Sources
        </h4>
        <div className="space-y-2">
          <AnimatePresence>
            {data?.trafficSources.slice(0, 5).map((source, index) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-white/80">
                    {source.source}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {source.users}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-xs text-white/60">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Auto-refreshing every 30 seconds
        </div>
      </div>
    </div>
  );
}
