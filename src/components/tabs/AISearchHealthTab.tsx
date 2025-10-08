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
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface AISearchHealthTabProps {
  auditData?: any;
  recommendations?: any[];
}

export default function AISearchHealthTab({ auditData, recommendations }: AISearchHealthTabProps) {
  const [healthMetrics, setHealthMetrics] = useState({
    overall: 0,
    aiVisibility: 0,
    zeroClick: 0,
    ugcHealth: 0,
    geoTrust: 0,
    sgpIntegrity: 0,
    lastUpdated: new Date()
  });

  const [realTimeData, setRealTimeData] = useState({
    activeQueries: 0,
    responseTime: 0,
    errorRate: 0,
    uptime: 99.9
  });

  useEffect(() => {
    if (auditData) {
      setHealthMetrics({
        overall: auditData.overall_score || 0,
        aiVisibility: auditData.ai_visibility_score || 0,
        zeroClick: auditData.zero_click_score || 0,
        ugcHealth: auditData.ugc_health_score || 0,
        geoTrust: auditData.geo_trust_score || 0,
        sgpIntegrity: auditData.sgp_integrity_score || 0,
        lastUpdated: new Date()
      });
    }

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
  }, [auditData]);

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: 'excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 60) return { status: 'good', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 40) return { status: 'fair', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { status: 'poor', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getTrendIcon = (score: number) => {
    const trend = Math.random() > 0.5 ? 1 : -1;
    return trend > 0 ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
    );
  };

  const healthPillars = [
    {
      name: 'AI Visibility',
      score: healthMetrics.aiVisibility,
      description: 'How well your dealership appears in AI search results',
      icon: '🤖',
      recommendations: recommendations?.filter(r => r.category === 'ai_visibility') || []
    },
    {
      name: 'Zero-Click Optimization',
      score: healthMetrics.zeroClick,
      description: 'Optimization for featured snippets and knowledge panels',
      icon: '🎯',
      recommendations: recommendations?.filter(r => r.category === 'content') || []
    },
    {
      name: 'UGC Health',
      score: healthMetrics.ugcHealth,
      description: 'User-generated content quality and engagement',
      icon: '⭐',
      recommendations: recommendations?.filter(r => r.category === 'reputation') || []
    },
    {
      name: 'Geo Trust',
      score: healthMetrics.geoTrust,
      description: 'Local search authority and NAP consistency',
      icon: '📍',
      recommendations: recommendations?.filter(r => r.category === 'local_seo') || []
    },
    {
      name: 'SGP Integrity',
      score: healthMetrics.sgpIntegrity,
      description: 'Structured data and technical SEO health',
      icon: '⚙️',
      recommendations: recommendations?.filter(r => r.category === 'technical_seo') || []
    }
  ];

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
            Real-time monitoring of your dealership's AI search performance
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last Updated</div>
          <div className="text-white font-medium">
            {healthMetrics.lastUpdated.toLocaleTimeString()}
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
          <h3 className="text-xl font-semibold text-white">Overall Health Score</h3>
          <div className="flex items-center gap-2">
            {getTrendIcon(healthMetrics.overall)}
            <span className="text-sm text-gray-400">+2.3% this week</span>
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
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthMetrics.overall / 100)}`}
                className="text-blue-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{healthMetrics.overall}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">AI Visibility</div>
                <div className="text-lg font-semibold text-white">{healthMetrics.aiVisibility}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-400">Zero-Click</div>
                <div className="text-lg font-semibold text-white">{healthMetrics.zeroClick}</div>
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
            <div className="text-sm text-gray-400">Active Queries</div>
          </div>
          <div className="text-2xl font-bold text-white">{realTimeData.activeQueries}</div>
          <div className="text-xs text-green-400">+12% from yesterday</div>
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
            <div className="text-sm text-gray-400">Response Time</div>
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

      {/* Health Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {healthPillars.map((pillar, index) => {
          const health = getHealthStatus(pillar.score);
          return (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{pillar.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{pillar.name}</h4>
                    <p className="text-sm text-gray-400">{pillar.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${health.bg} ${health.color}`}>
                  {pillar.score}/100
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Score</span>
                  <span>{pillar.score}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      pillar.score >= 80 ? 'bg-green-500' :
                      pillar.score >= 60 ? 'bg-yellow-500' :
                      pillar.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>
              </div>

              {/* Recommendations */}
              {pillar.recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">Top Recommendations:</div>
                  {pillar.recommendations.slice(0, 2).map((rec, idx) => (
                    <div key={idx} className="text-sm text-gray-400 bg-gray-700/30 rounded-lg p-2">
                      • {rec.title}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Run Health Check
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          View Detailed Report
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          Export Data
        </button>
      </div>
    </div>
  );
}
