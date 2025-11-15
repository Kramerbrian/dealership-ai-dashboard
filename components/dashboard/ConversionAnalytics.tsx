'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Phone, 
  Mail, 
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface ConversionData {
  totalConversions: number;
  conversionRate: number;
  goalCompletions: Array<{
    goal: string;
    completions: number;
    value: number;
  }>;
  conversionSources: Array<{
    source: string;
    conversions: number;
    rate: number;
  }>;
}

interface ConversionAnalyticsProps {
  propertyId: string;
  dateRange?: string;
  className?: string;
}

export function ConversionAnalytics({ 
  propertyId, 
  dateRange = '30d', 
  className = '' 
}: ConversionAnalyticsProps) {
  const [data, setData] = useState<ConversionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/analytics/ga4?propertyId=${propertyId}&metric=conversions&dateRange=${dateRange}`
      );
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
  }, [propertyId, dateRange]);

  const handleRefresh = () => {
    fetchData();
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getGoalIcon = (goal: string) => {
    switch (goal.toLowerCase()) {
      case 'contact form':
        return <FileText className="w-4 h-4" />;
      case 'phone call':
        return <Phone className="w-4 h-4" />;
      case 'email signup':
        return <Mail className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal.toLowerCase()) {
      case 'contact form':
        return 'text-blue-400';
      case 'phone call':
        return 'text-green-400';
      case 'email signup':
        return 'text-purple-400';
      default:
        return 'text-orange-400';
    }
  };

  const getConversionRateColor = (rate: number) => {
    if (rate > 0.05) return 'text-green-400';
    if (rate > 0.02) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConversionRateStatus = (rate: number) => {
    if (rate > 0.05) return 'Excellent';
    if (rate > 0.02) return 'Good';
    return 'Needs improvement';
  };

  if (loading && !data) {
    return (
      <div className={`glass rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-6 h-6 text-[var(--brand-primary)]" />
            Conversion Analytics
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
          <Target className="w-6 h-6 text-[var(--brand-primary)]" />
          Conversion Analytics
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
              <span>{lastUpdated.toLocaleTimeString()}</span>
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
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/70">Total Conversions</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.totalConversions.toLocaleString() || 0}
          </div>
          <div className="text-xs text-white/60">
            Last {dateRange}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white/5 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-white/70">Conversion Rate</span>
          </div>
          <div className={`text-2xl font-bold ${getConversionRateColor(data?.conversionRate || 0)}`}>
            {data?.conversionRate ? formatPercentage(data.conversionRate) : '0%'}
          </div>
          <div className="text-xs text-white/60">
            {data?.conversionRate ? getConversionRateStatus(data.conversionRate) : 'No data'}
          </div>
        </motion.div>
      </div>

      {/* Goal Completions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Goal Completions
        </h4>
        <div className="space-y-3">
          <AnimatePresence>
            {data?.goalCompletions.map((goal, index) => (
              <motion.div
                key={goal.goal}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`${getGoalColor(goal.goal)}`}>
                    {getGoalIcon(goal.goal)}
                  </div>
                  <span className="text-sm text-white/80 font-medium">
                    {goal.goal}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {goal.completions.toLocaleString()}
                    </div>
                    {goal.value > 0 && (
                      <div className="text-xs text-green-400">
                        ${goal.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((goal.completions / (data?.totalConversions || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Conversion Sources */}
      <div>
        <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Conversion Sources
        </h4>
        <div className="space-y-2">
          <AnimatePresence>
            {data?.conversionSources.slice(0, 5).map((source, index) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-white/80">
                    {source.source}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {source.conversions.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">
                      {formatPercentage(source.rate)}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ROI Estimation */}
      {data && data.totalConversions > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">ROI Estimation</span>
            </div>
            <div className="text-xs text-white/70">
              Based on {data.totalConversions} conversions and average automotive lead value of $500:
            </div>
            <div className="text-lg font-bold text-green-400 mt-1">
              ${(data.totalConversions * 500).toLocaleString()} potential revenue
            </div>
          </div>
        </div>
      )}

      {/* Date Range Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-xs text-white/60">
          <span>Data for the last {dateRange}</span>
        </div>
      </div>
    </div>
  );
}
