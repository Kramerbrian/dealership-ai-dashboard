'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface PredictiveTabProps {
  auditData?: any;
}

export default function PredictiveTab({ auditData }: PredictiveTabProps) {
  const [predictiveData, setPredictiveData] = useState({
    aiVisibilityForecast: 0,
    marketTrend: 'growing',
    competitorThreat: 'low',
    opportunityScore: 0,
    lastUpdated: new Date()
  });

  const [forecasts, setForecasts] = useState([
    {
      metric: 'AI Visibility Score',
      current: 75,
      predicted: 82,
      timeframe: '30 days',
      confidence: 85,
      trend: 'up'
    },
    {
      metric: 'Search Volume',
      current: 1200,
      predicted: 1450,
      timeframe: '60 days',
      confidence: 78,
      trend: 'up'
    },
    {
      metric: 'Competitor Mentions',
      current: 45,
      predicted: 52,
      timeframe: '45 days',
      confidence: 72,
      trend: 'up'
    },
    {
      metric: 'Customer Sentiment',
      current: 4.2,
      predicted: 4.5,
      timeframe: '90 days',
      confidence: 88,
      trend: 'up'
    }
  ]);

  const [opportunities, setOpportunities] = useState([
    {
      id: 1,
      title: 'Local SEO Optimization',
      impact: 'high',
      effort: 'medium',
      timeframe: '2-4 weeks',
      description: 'Improve local search rankings by optimizing Google Business Profile and local citations',
      roi: '+25% visibility'
    },
    {
      id: 2,
      title: 'Content Marketing Campaign',
      impact: 'high',
      effort: 'high',
      timeframe: '6-8 weeks',
      description: 'Create educational content about car buying to capture more AI search queries',
      roi: '+40% organic traffic'
    },
    {
      id: 3,
      title: 'Review Management',
      impact: 'medium',
      effort: 'low',
      timeframe: '1-2 weeks',
      description: 'Implement automated review response system to improve customer sentiment',
      roi: '+15% conversion'
    },
    {
      id: 4,
      title: 'Schema Markup Enhancement',
      impact: 'medium',
      effort: 'low',
      timeframe: '1 week',
      description: 'Add more structured data to improve AI understanding of your content',
      roi: '+20% AI visibility'
    }
  ]);

  const [riskFactors, setRiskFactors] = useState([
    {
      factor: 'Competitor Activity',
      level: 'medium',
      description: 'Chicago Auto Group is increasing their AI visibility efforts',
      mitigation: 'Monitor their strategies and adapt accordingly'
    },
    {
      factor: 'Algorithm Changes',
      level: 'low',
      description: 'Potential AI search algorithm updates could affect rankings',
      mitigation: 'Maintain diverse optimization strategies'
    },
    {
      factor: 'Market Saturation',
      level: 'low',
      description: 'Local market becoming more competitive',
      mitigation: 'Focus on unique value propositions'
    }
  ]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setPredictiveData(prev => ({
        ...prev,
        aiVisibilityForecast: Math.min(100, Math.max(0, prev.aiVisibilityForecast + (Math.random() - 0.5) * 2)),
        opportunityScore: Math.min(100, Math.max(0, prev.opportunityScore + (Math.random() - 0.5) * 1.5))
      }));
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
    );
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            Predictive Analytics
          </h2>
          <p className="text-gray-400 mt-1">
            AI-powered insights and forecasts for your dealership's digital performance
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last Updated</div>
          <div className="text-white font-medium">
            {predictiveData.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Predictive Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">AI-Powered Forecasts</h3>
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Powered by AI</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{predictiveData.aiVisibilityForecast}</div>
            <div className="text-sm text-gray-400">AI Visibility Forecast</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 capitalize">{predictiveData.marketTrend}</div>
            <div className="text-sm text-gray-400">Market Trend</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 capitalize">{predictiveData.competitorThreat}</div>
            <div className="text-sm text-gray-400">Competitor Threat</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{predictiveData.opportunityScore}</div>
            <div className="text-sm text-gray-400">Opportunity Score</div>
          </div>
        </div>
      </motion.div>

      {/* Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forecasts.map((forecast, index) => (
          <motion.div
            key={forecast.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">{forecast.metric}</h4>
              <div className="flex items-center gap-2">
                {getTrendIcon(forecast.trend)}
                <span className="text-sm text-gray-400">{forecast.timeframe}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Current</span>
                <span className="text-lg font-semibold text-white">{forecast.current}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Predicted</span>
                <span className="text-lg font-semibold text-green-400">{forecast.predicted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Confidence</span>
                <span className="text-sm font-medium text-blue-400">{forecast.confidence}%</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-green-500"
                  style={{ width: `${forecast.confidence}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">AI-Identified Opportunities</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {opportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-white">{opportunity.title}</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(opportunity.impact)}`}>
                    {opportunity.impact} impact
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(opportunity.effort)}`}>
                    {opportunity.effort} effort
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{opportunity.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span className="font-medium">Timeline:</span> {opportunity.timeframe}
                </div>
                <div className="text-sm font-medium text-green-400">
                  {opportunity.roi}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Risk Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
        <div className="space-y-3">
          {riskFactors.map((risk, index) => (
            <motion.div
              key={risk.factor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
            >
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-white">{risk.factor}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.level)}`}>
                    {risk.level} risk
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{risk.description}</p>
                <p className="text-sm text-gray-400">
                  <span className="font-medium">Mitigation:</span> {risk.mitigation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
          Generate New Forecast
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          View Detailed Analysis
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          Export Predictions
        </button>
      </div>
    </div>
  );
}
