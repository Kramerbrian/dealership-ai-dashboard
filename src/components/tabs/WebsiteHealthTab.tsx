'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GlobeAltIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WifiIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface WebsiteHealthTabProps {
  auditData?: any;
}

export default function WebsiteHealthTab({ auditData }: WebsiteHealthTabProps) {
  const [websiteMetrics, setWebsiteMetrics] = useState({
    performance: 0,
    accessibility: 0,
    seo: 0,
    bestPractices: 0,
    lastChecked: new Date()
  });

  const [technicalIssues, setTechnicalIssues] = useState([
    {
      id: 1,
      type: 'error',
      title: 'Missing Meta Description',
      description: 'Several pages are missing meta descriptions',
      impact: 'high',
      count: 12
    },
    {
      id: 2,
      type: 'warning',
      title: 'Large Image Files',
      description: 'Some images are not optimized for web',
      impact: 'medium',
      count: 8
    },
    {
      id: 3,
      type: 'info',
      title: 'HTTPS Implementation',
      description: 'SSL certificate is properly configured',
      impact: 'low',
      count: 0
    }
  ]);

  const [pageSpeedInsights, setPageSpeedInsights] = useState({
    mobile: {
      performance: 85,
      accessibility: 92,
      bestPractices: 88,
      seo: 95
    },
    desktop: {
      performance: 92,
      accessibility: 95,
      bestPractices: 90,
      seo: 98
    }
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setWebsiteMetrics(prev => ({
        ...prev,
        performance: Math.min(100, prev.performance + (Math.random() - 0.5) * 2),
        accessibility: Math.min(100, prev.accessibility + (Math.random() - 0.5) * 1),
        seo: Math.min(100, prev.seo + (Math.random() - 0.5) * 1.5),
        bestPractices: Math.min(100, prev.bestPractices + (Math.random() - 0.5) * 1.2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 70) return 'bg-yellow-500/20';
    if (score >= 50) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'info': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <GlobeAltIcon className="w-8 h-8 text-green-400" />
            Website Health
          </h2>
          <p className="text-gray-400 mt-1">
            Comprehensive analysis of your website's technical performance
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last Checked</div>
          <div className="text-white font-medium">
            {websiteMetrics.lastChecked.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Overall Health Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Overall Website Health</h3>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">+5.2% this week</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(websiteMetrics.performance)}`}>
              {Math.round(websiteMetrics.performance)}
            </div>
            <div className="text-sm text-gray-400">Performance</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(websiteMetrics.accessibility)}`}>
              {Math.round(websiteMetrics.accessibility)}
            </div>
            <div className="text-sm text-gray-400">Accessibility</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(websiteMetrics.seo)}`}>
              {Math.round(websiteMetrics.seo)}
            </div>
            <div className="text-sm text-gray-400">SEO</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(websiteMetrics.bestPractices)}`}>
              {Math.round(websiteMetrics.bestPractices)}
            </div>
            <div className="text-sm text-gray-400">Best Practices</div>
          </div>
        </div>
      </motion.div>

      {/* Page Speed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mobile Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <WifiIcon className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Mobile Performance</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(pageSpeedInsights.mobile).map(([key, score]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="text-sm text-gray-300 capitalize">{key}</div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        score >= 90 ? 'bg-green-500' :
                        score >= 70 ? 'bg-yellow-500' :
                        score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                    {score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Desktop Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Desktop Performance</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(pageSpeedInsights.desktop).map(([key, score]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="text-sm text-gray-300 capitalize">{key}</div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        score >= 90 ? 'bg-green-500' :
                        score >= 70 ? 'bg-yellow-500' :
                        score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                    {score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Technical Issues */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Technical Issues</h3>
          <div className="text-sm text-gray-400">
            {technicalIssues.filter(issue => issue.type === 'error').length} errors, {' '}
            {technicalIssues.filter(issue => issue.type === 'warning').length} warnings
          </div>
        </div>
        <div className="space-y-3">
          {technicalIssues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
            >
              <div className="flex-shrink-0">
                {getIssueIcon(issue.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{issue.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(issue.impact)}`}>
                    {issue.impact} impact
                  </span>
                  {issue.count > 0 && (
                    <span className="px-2 py-1 bg-gray-600/50 rounded-full text-xs text-gray-300">
                      {issue.count} issues
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{issue.description}</p>
              </div>
              <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium rounded-lg transition-colors">
                Fix
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Core Web Vitals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">1.2s</div>
            <div className="text-sm text-gray-400">Largest Contentful Paint</div>
            <div className="text-xs text-green-400 mt-1">Good</div>
          </div>
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">120ms</div>
            <div className="text-sm text-gray-400">First Input Delay</div>
            <div className="text-xs text-yellow-400 mt-1">Needs Improvement</div>
          </div>
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">0.08</div>
            <div className="text-sm text-gray-400">Cumulative Layout Shift</div>
            <div className="text-xs text-green-400 mt-1">Good</div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
          Run Full Audit
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          View PageSpeed Insights
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          Export Report
        </button>
      </div>
    </div>
  );
}
