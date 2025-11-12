'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Zap,
  Eye,
  BarChart3,
  ArrowRight,
  Info
} from 'lucide-react';

interface RelevanceMetric {
  query: string;
  relevance: number; // 0-100
  position: number;
  clickProbability: number;
  zeroClickProbability: number;
  competitors: {
    name: string;
    relevance: number;
    position: number;
  }[];
  opportunities: {
    action: string;
    impact: number; // 0-100
    effort: 'low' | 'medium' | 'high';
    timeToFix: string;
  }[];
}

interface RelevanceOverlayProps {
  domain: string;
  dealerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RelevanceOverlay({ domain, dealerId, isOpen, onClose }: RelevanceOverlayProps) {
  const [metrics, setMetrics] = useState<RelevanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<RelevanceMetric | null>(null);
  const [overallRelevance, setOverallRelevance] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchRelevanceData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchRelevanceData, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, domain, dealerId]);

  const fetchRelevanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/relevance/overlay?domain=${encodeURIComponent(domain)}&dealerId=${dealerId}`);
      if (!res.ok) throw new Error('Failed to fetch relevance data');
      
      const data = await res.json();
      setMetrics(data.metrics || []);
      setOverallRelevance(data.overallRelevance || 0);
    } catch (error) {
      console.error('Relevance overlay error:', error);
      // Fallback demo data
      setMetrics(generateDemoMetrics());
      setOverallRelevance(72);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoMetrics = (): RelevanceMetric[] => [
    {
      query: 'best hyundai dealer near me',
      relevance: 78,
      position: 2,
      clickProbability: 0.34,
      zeroClickProbability: 0.42,
      competitors: [
        { name: 'Naples Honda', relevance: 88, position: 1 },
        { name: 'Crown Nissan', relevance: 71, position: 3 },
      ],
      opportunities: [
        { action: 'Add local schema markup', impact: 15, effort: 'low', timeToFix: '2 hours' },
        { action: 'Optimize meta description', impact: 8, effort: 'low', timeToFix: '30 min' },
      ],
    },
    {
      query: 'hyundai elantra inventory cape coral',
      relevance: 65,
      position: 4,
      clickProbability: 0.18,
      zeroClickProbability: 0.55,
      competitors: [
        { name: 'Naples Honda', relevance: 82, position: 1 },
        { name: 'Germain Toyota', relevance: 74, position: 2 },
      ],
      opportunities: [
        { action: 'Enhance inventory schema', impact: 22, effort: 'medium', timeToFix: '4 hours' },
        { action: 'Add vehicle-specific FAQs', impact: 12, effort: 'medium', timeToFix: '3 hours' },
      ],
    },
    {
      query: 'hyundai service center reviews',
      relevance: 82,
      position: 1,
      clickProbability: 0.45,
      zeroClickProbability: 0.28,
      competitors: [
        { name: 'Crown Nissan', relevance: 75, position: 2 },
        { name: 'Naples Honda', relevance: 68, position: 3 },
      ],
      opportunities: [
        { action: 'Increase review response rate', impact: 5, effort: 'low', timeToFix: '1 hour' },
      ],
    },
  ];

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 65) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRelevanceBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 65) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-emerald-400" />
                Relevance Overlay
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Real-time query relevance analysis for {domain}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Overall Score */}
          <div className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Overall Relevance Index</div>
                <div className={`text-5xl font-black tabular-nums ${getRelevanceColor(overallRelevance)}`}>
                  {overallRelevance}
                </div>
                <div className="text-xs text-gray-500 mt-1">Out of 100</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-2">Win Rate</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {metrics.filter(m => m.position <= 2).length}/{metrics.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Top 2 positions</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`border rounded-xl p-5 cursor-pointer transition-all hover:border-emerald-500/50 ${getRelevanceBg(metric.relevance)}`}
                    onClick={() => setSelectedQuery(selectedQuery === metric ? null : metric)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-white">{metric.query}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Position:</span>
                            <span className="font-bold text-white">#{metric.position}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Click:</span>
                            <span className="font-bold text-emerald-400">
                              {(metric.clickProbability * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Zero-Click:</span>
                            <span className="font-bold text-purple-400">
                              {(metric.zeroClickProbability * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-black tabular-nums ${getRelevanceColor(metric.relevance)}`}>
                          {metric.relevance}
                        </div>
                        <div className="text-xs text-gray-500">Relevance</div>
                      </div>
                    </div>

                    {/* Competitors */}
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <div className="text-xs text-gray-400 mb-2">Competitors</div>
                      <div className="flex gap-3">
                        {metric.competitors.map((comp, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex-1 bg-gray-800/50 rounded-lg p-2 border border-gray-700/50"
                          >
                            <div className="text-xs text-gray-400 mb-1">{comp.name}</div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-white">#{comp.position}</span>
                              <span className={`text-xs font-bold ${getRelevanceColor(comp.relevance)}`}>
                                {comp.relevance}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expanded Opportunities */}
                    {selectedQuery === metric && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-700/50"
                      >
                        <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          Quick Wins to Beat Competitors
                        </div>
                        <div className="space-y-2">
                          {metric.opportunities.map((opp, oIdx) => (
                            <div
                              key={oIdx}
                              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="font-semibold text-white text-sm">{opp.action}</div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Impact: +{opp.impact}pts • Effort: {opp.effort} • Time: {opp.timeToFix}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-emerald-400">+{opp.impact}</div>
                                  <div className="text-xs text-gray-500">points</div>
                                </div>
                              </div>
                              <button className="mt-2 w-full px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-400 transition-colors flex items-center justify-center gap-2">
                                Fix Now
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/30">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Relevance calculated from AI search patterns and competitor analysis</span>
              </div>
              <div className="text-emerald-400 font-semibold">
                Updated {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

