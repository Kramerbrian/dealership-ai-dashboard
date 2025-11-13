/**
 * Viral Growth Dashboard
 * Real-time tracking of K-Factor and viral growth metrics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Share2, Zap, Target, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ViralMetrics {
  kFactor: number;
  projectedGrowth: number;
  viralVelocity: number;
  sharesPerUser: number;
  signupsPerShare: number;
  conversionRate: number;
  cycleTime: number;
  totalShares: number;
  totalSignups: number;
  activeUsers: number;
}

interface ViralGrowthDashboardProps {
  dealershipId?: string;
}

export default function ViralGrowthDashboard({ dealershipId }: ViralGrowthDashboardProps) {
  const [metrics, setMetrics] = useState<ViralMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    fetchViralMetrics();
    const interval = setInterval(fetchViralMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchViralMetrics = async () => {
    try {
      const response = await fetch(`/api/viral/metrics?timeRange=${timeRange}&dealershipId=${dealershipId || ''}`);
      const data = await response.json();
      
      if (data.success) {
        setMetrics({
          kFactor: data.data.kFactor,
          projectedGrowth: data.data.projectedGrowth,
          viralVelocity: data.data.viralVelocity,
          sharesPerUser: data.data.viralLoop.sharesPerUser,
          signupsPerShare: data.data.viralLoop.signupsPerShare,
          conversionRate: data.data.viralLoop.conversionRate,
          cycleTime: data.data.viralLoop.cycleTime,
          totalShares: data.data.totalShares || 0,
          totalSignups: data.data.totalSignups || 0,
          activeUsers: data.data.activeUsers || 0
        });
      }
    } catch (error) {
      console.error('Error fetching viral metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKFactorStatus = (kFactor: number) => {
    if (kFactor > 1.5) return { status: 'excellent', color: 'text-green-600', icon: ArrowUp };
    if (kFactor > 1.2) return { status: 'good', color: 'text-blue-600', icon: ArrowUp };
    if (kFactor > 1.0) return { status: 'positive', color: 'text-yellow-600', icon: ArrowUp };
    if (kFactor === 1.0) return { status: 'neutral', color: 'text-gray-600', icon: Minus };
    return { status: 'declining', color: 'text-red-600', icon: ArrowDown };
  };

  const getViralHealthScore = (kFactor: number, conversionRate: number, sharesPerUser: number) => {
    const score = (kFactor * 0.4 + conversionRate * 0.3 + (sharesPerUser / 3) * 0.3) * 100;
    return Math.min(Math.max(score, 0), 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="text-center text-gray-500">Failed to load viral metrics</div>
      </div>
    );
  }

  const kFactorStatus = getKFactorStatus(metrics.kFactor);
  const viralHealthScore = getViralHealthScore(metrics.kFactor, metrics.conversionRate, metrics.sharesPerUser);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Viral Growth Dashboard</h3>
          <p className="text-sm text-gray-600">Real-time K-Factor tracking and viral metrics</p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* K-Factor Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">K-Factor</span>
              <kFactorStatus.icon className={`w-4 h-4 ${kFactorStatus.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics.kFactor.toFixed(2)}</div>
            <div className="text-sm text-gray-600">
              Each user brings {metrics.kFactor.toFixed(1)} new users
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{viralHealthScore.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Viral Health</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Shares/User</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.sharesPerUser.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Average per user</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Signups/Share</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.signupsPerShare.toFixed(2)}</div>
          <div className="text-xs text-gray-600">Conversion rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Viral Velocity</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.viralVelocity.toFixed(2)}</div>
          <div className="text-xs text-gray-600">Growth per hour</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Projected Growth</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.projectedGrowth.toFixed(0)}x</div>
          <div className="text-xs text-gray-600">In 4 cycles</div>
        </motion.div>
      </div>

      {/* Viral Loop Visualization */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h4 className="font-semibold text-gray-900 mb-4">Viral Growth Loop</h4>
        <div className="flex items-center justify-between text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">A</div>
            <div className="font-medium">Dealer A</div>
            <div className="text-gray-600">Gets audit</div>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">#3</div>
            <div className="font-medium">Ranks #3</div>
            <div className="text-gray-600">Out of 12</div>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">📢</div>
            <div className="font-medium">Shares</div>
            <div className="text-gray-600">"We beat 9!"</div>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">B</div>
            <div className="font-medium">Competitor B</div>
            <div className="text-gray-600">Sees post</div>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">❓</div>
            <div className="font-medium">"Where do I rank?"</div>
            <div className="text-gray-600">Signs up</div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <strong>K-Factor: {metrics.kFactor.toFixed(1)}</strong> • Each user brings {metrics.kFactor.toFixed(1)} new users
        </div>
      </div>
    </div>
  );
}
