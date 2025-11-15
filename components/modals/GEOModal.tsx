'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Download,
  RefreshCw,
  Zap,
  Globe,
  Brain,
  Target,
  BarChart3,
  Code,
  FileText
} from 'lucide-react';

interface GEOModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain?: string;
}

interface GEOMetrics {
  overallScore: number;
  generativeEnginePerformance: {
    googleSGE: {
      score: number;
      appearances: number;
      citations: number;
      recommendations: string[];
    };
    bingChat: {
      score: number;
      appearances: number;
      citations: number;
      recommendations: string[];
    };
    youChat: {
      score: number;
      appearances: number;
      citations: number;
      recommendations: string[];
    };
  };
  aiOverviewOptimization: {
    score: number;
    overviewAppearances: number;
    sourceCitations: number;
    contentRelevance: number;
    recommendations: string[];
  };
  contentStrategy: {
    score: number;
    aiFriendlyContent: number;
    entityOptimization: number;
    contextRelevance: number;
    recommendations: string[];
  };
  technicalOptimization: {
    score: number;
    schemaMarkup: number;
    structuredData: number;
    aiReadability: number;
    recommendations: string[];
  };
  trends: {
    scoreChange: number;
    aiTrafficChange: number;
    overviewGrowth: number;
    period: string;
  };
}

export default function GEOModal({ isOpen, onClose, domain = 'dealershipai.com' }: GEOModalProps) {
  const [data, setData] = useState<GEOMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'engines' | 'overviews' | 'content' | 'technical'>('overview');

  useEffect(() => {
    if (isOpen && !data) {
      fetchGEOData();
    }
  }, [isOpen, domain]);

  const fetchGEOData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/visibility/geo?domain=${encodeURIComponent(domain)}&timeRange=30d`);
      const result = await response.json();
      
      if ((result as any).success) {
        setData((result as any).data);
      } else {
        throw new Error((result as any).error || 'Failed to fetch GEO data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">GEO Visibility Analysis</h2>
                <p className="text-sm text-white/60">{domain}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchGEOData}
                disabled={loading}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading && !data ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/60">Analyzing GEO performance...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchGEOData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getScoreBgColor(data.overallScore)}`}>
                    <span className={`text-3xl font-bold ${getScoreColor(data.overallScore)}`}>
                      {data.overallScore.toFixed(1)}
                    </span>
                    <span className="text-white/60">GEO Score</span>
                    {getTrendIcon(data.trends.scoreChange)}
                    <span className={`text-sm ${data.trends.scoreChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.trends.scoreChange > 0 ? '+' : ''}{data.trends.scoreChange.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-white/60 mt-2">
                    {data.overallScore >= 80 ? 'Excellent Generative Engine Optimization' : 
                     data.overallScore >= 60 ? 'Good GEO performance with room for improvement' : 
                     'GEO needs critical attention'}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/10">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'engines', label: 'AI Engines', icon: Brain },
                    { id: 'overviews', label: 'AI Overviews', icon: Globe },
                    { id: 'content', label: 'Content', icon: FileText },
                    { id: 'technical', label: 'Technical', icon: Code }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-white/10 text-white border-b-2 border-red-400' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-white/60">AI Traffic Change</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          +{data.trends.aiTrafficChange.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-white/60">Overview Growth</span>
                        </div>
                        <div className="text-2xl font-bold text-red-400">
                          +{data.trends.overviewGrowth.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-white/60">Priority Level</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {data.overallScore >= 80 ? 'Low' : data.overallScore >= 60 ? 'Medium' : 'High'}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'engines' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Generative Engine Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(data.generativeEnginePerformance).map(([engine, metrics]) => (
                          <div key={engine} className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white capitalize">{engine}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBgColor(metrics.score)}`}>
                                {metrics.score.toFixed(1)}%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{metrics.appearances}</div>
                                <div className="text-xs text-white/60">Appearances</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{metrics.citations}</div>
                                <div className="text-xs text-white/60">Citations</div>
                              </div>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-white/80 mb-1">Top Recommendation:</h5>
                              <p className="text-xs text-white/60">{metrics.recommendations[0]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'overviews' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">AI Overview Optimization</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(data.aiOverviewOptimization.score)}`}>
                          {data.aiOverviewOptimization.score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Overview Appearances</div>
                          <div className="text-xl font-bold text-white">{data.aiOverviewOptimization.overviewAppearances}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Source Citations</div>
                          <div className="text-xl font-bold text-white">{data.aiOverviewOptimization.sourceCitations}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Content Relevance</div>
                          <div className="text-xl font-bold text-white">{data.aiOverviewOptimization.contentRelevance.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white/80 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {data.aiOverviewOptimization.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-white/60">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'content' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Content Strategy</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(data.contentStrategy.score)}`}>
                          {data.contentStrategy.score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">AI-Friendly Content</div>
                          <div className="text-xl font-bold text-white">{data.contentStrategy.aiFriendlyContent.toFixed(1)}%</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Entity Optimization</div>
                          <div className="text-xl font-bold text-white">{data.contentStrategy.entityOptimization.toFixed(1)}%</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Context Relevance</div>
                          <div className="text-xl font-bold text-white">{data.contentStrategy.contextRelevance.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white/80 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {data.contentStrategy.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-white/60">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'technical' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Technical Optimization</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(data.technicalOptimization.score)}`}>
                          {data.technicalOptimization.score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Schema Markup</div>
                          <div className="text-xl font-bold text-white">{data.technicalOptimization.schemaMarkup.toFixed(1)}%</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Structured Data</div>
                          <div className="text-xl font-bold text-white">{data.technicalOptimization.structuredData.toFixed(1)}%</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">AI Readability</div>
                          <div className="text-xl font-bold text-white">{data.technicalOptimization.aiReadability.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white/80 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {data.technicalOptimization.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-white/60">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <div className="text-sm text-white/60">
              Last updated: {data ? new Date().toLocaleString() : 'Never'}
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
                Emergency Action Plan
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
