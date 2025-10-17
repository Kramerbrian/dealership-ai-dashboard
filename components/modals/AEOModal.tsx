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
  Brain,
  MessageSquare,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface AEOModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain?: string;
}

interface AEOMetrics {
  overallScore: number;
  aiEnginePerformance: {
    chatgpt: {
      score: number;
      appearances: number;
      citations: number;
      recommendations: string[];
    };
    gemini: {
      score: number;
      appearances: number;
      citations: number;
      recommendations: string[];
    };
    perplexity: {
      score: number;
      appearances: number;
      citations: number;
      recommendations: string[];
    };
    claude: {
      score: number;
      appearances: number;
      citations: number;
      recommendations: string[];
    };
  };
  contentOptimization: {
    score: number;
    structuredData: number;
    faqContent: number;
    voiceSearchOptimization: number;
    recommendations: string[];
  };
  featuredSnippets: {
    score: number;
    totalSnippets: number;
    snippetTypes: {
      paragraph: number;
      list: number;
      table: number;
    };
    recommendations: string[];
  };
  trends: {
    scoreChange: number;
    aiTrafficChange: number;
    snippetGrowth: number;
    period: string;
  };
}

export default function AEOModal({ isOpen, onClose, domain = 'dealershipai.com' }: AEOModalProps) {
  const [data, setData] = useState<AEOMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'engines' | 'content' | 'snippets'>('overview');

  useEffect(() => {
    if (isOpen && !data) {
      fetchAEOData();
    }
  }, [isOpen, domain]);

  const fetchAEOData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/visibility/aeo?domain=${encodeURIComponent(domain)}&timeRange=30d`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch AEO data');
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
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">AEO Visibility Analysis</h2>
                <p className="text-sm text-white/60">{domain}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAEOData}
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
                  <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/60">Analyzing AEO performance...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchAEOData}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
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
                    <span className="text-white/60">AEO Score</span>
                    {getTrendIcon(data.trends.scoreChange)}
                    <span className={`text-sm ${data.trends.scoreChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.trends.scoreChange > 0 ? '+' : ''}{data.trends.scoreChange.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-white/60 mt-2">
                    {data.overallScore >= 80 ? 'Excellent AI Engine Optimization' : 
                     data.overallScore >= 60 ? 'Good AEO performance with room for improvement' : 
                     'AEO needs attention'}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/10">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'engines', label: 'AI Engines', icon: Brain },
                    { id: 'content', label: 'Content', icon: MessageSquare },
                    { id: 'snippets', label: 'Snippets', icon: Target }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-white/10 text-white border-b-2 border-orange-400' 
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
                          <Target className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-white/60">Snippet Growth</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-400">
                          +{data.trends.snippetGrowth.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-white/60">Overall Health</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-400">
                          {data.overallScore >= 80 ? 'Excellent' : data.overallScore >= 60 ? 'Good' : 'Needs Work'}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'engines' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">AI Engine Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(data.aiEnginePerformance).map(([engine, metrics]) => (
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

                  {activeTab === 'content' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Content Optimization</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(data.contentOptimization.score)}`}>
                          {data.contentOptimization.score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Structured Data</div>
                          <div className="text-xl font-bold text-white">{data.contentOptimization.structuredData.toFixed(1)}%</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">FAQ Content</div>
                          <div className="text-xl font-bold text-white">{data.contentOptimization.faqContent.toFixed(1)}%</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-sm text-white/60 mb-1">Voice Search</div>
                          <div className="text-xl font-bold text-white">{data.contentOptimization.voiceSearchOptimization.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white/80 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {data.contentOptimization.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-white/60">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'snippets' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Featured Snippets</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(data.featuredSnippets.score)}`}>
                          {data.featuredSnippets.score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                          <div className="text-2xl font-bold text-white">{data.featuredSnippets.totalSnippets}</div>
                          <div className="text-sm text-white/60">Total Snippets</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                          <div className="text-2xl font-bold text-white">{data.featuredSnippets.snippetTypes.paragraph}</div>
                          <div className="text-sm text-white/60">Paragraphs</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                          <div className="text-2xl font-bold text-white">{data.featuredSnippets.snippetTypes.list}</div>
                          <div className="text-sm text-white/60">Lists</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                          <div className="text-2xl font-bold text-white">{data.featuredSnippets.snippetTypes.table}</div>
                          <div className="text-sm text-white/60">Tables</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white/80 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {data.featuredSnippets.recommendations.map((rec, index) => (
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
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
                Optimize Now
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
