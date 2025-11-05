'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { useAIVCalculator, AIVInputs } from '@/hooks/useAIVCalculator';

interface AIVModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealerData?: Partial<AIVInputs>;
  dealerId?: string;
}

/**
 * AIV Modal Component
 * 
 * Displays Algorithmic Visibility Index (AIV™) metrics including:
 * - AIV Score
 * - AIVR Score (ROI-adjusted)
 * - Revenue at Risk
 * - Platform breakdown
 * - Actionable insights
 */
export default function AIVModal({ isOpen, onClose, dealerData, dealerId = 'current' }: AIVModalProps) {
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<AIVInputs | null>(null);

  // Fetch dealer data if not provided
  useEffect(() => {
    if (!isOpen) return;

    const fetchDealerData = async () => {
      setLoading(true);
      try {
        // If dealerData is provided, use it
        if (dealerData && Object.keys(dealerData).length > 0) {
          // Merge with defaults for missing fields
          const fullInputs: AIVInputs = {
            dealerId: dealerId,
            platform_scores: dealerData.platform_scores || {},
            google_aio_inclusion_rate: dealerData.google_aio_inclusion_rate || 0,
            ugc_health_score: dealerData.ugc_health_score || 0,
            schema_coverage_ratio: dealerData.schema_coverage_ratio || 0,
            semantic_clarity_score: dealerData.semantic_clarity_score || 0,
            silo_integrity_score: dealerData.silo_integrity_score || 0,
            authority_depth_index: dealerData.authority_depth_index || 0,
            temporal_weight: dealerData.temporal_weight || 1.0,
            entity_confidence: dealerData.entity_confidence || 0.8,
            crawl_budget_mult: dealerData.crawl_budget_mult || 1.0,
            inventory_truth_mult: dealerData.inventory_truth_mult || 1.0,
            ctr_delta: dealerData.ctr_delta || 0,
            conversion_delta: dealerData.conversion_delta || 0,
            avg_gross_per_unit: dealerData.avg_gross_per_unit || 1200,
            monthly_opportunities: dealerData.monthly_opportunities || 450,
          };
          setInputs(fullInputs);
        } else {
          // Fetch from API
          const response = await fetch(`/api/ai-scores?dealerId=${dealerId}`);
          if (response.ok) {
            const data = await response.json();
            setInputs(data);
          } else {
            // Use fallback demo data
            setInputs(getFallbackInputs(dealerId));
          }
        }
      } catch (error) {
        console.error('Failed to fetch AIV data:', error);
        setInputs(getFallbackInputs(dealerId));
      } finally {
        setLoading(false);
      }
    };

    fetchDealerData();
  }, [isOpen, dealerData, dealerId]);

  const results = useAIVCalculator(inputs);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Needs Improvement';
  };

  const platformScores = inputs?.platform_scores || {};
  const platformEntries = Object.entries(platformScores);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold">Algorithmic Visibility Index (AIV™)</h2>
              <p className="text-sm text-slate-400">Real-time AI platform visibility analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Main Score Display */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* AIV Score */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">AIV™ Score</span>
                    <CheckCircle className={`w-5 h-5 ${getScoreColor(results.AIV_score)}`} />
                  </div>
                  <div className={`text-4xl font-bold mb-1 ${getScoreColor(results.AIV_score)}`}>
                    {(results.AIV_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">{getScoreLabel(results.AIV_score)}</div>
                </div>

                {/* AIVR Score */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">AIVR™ Score</span>
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-4xl font-bold mb-1 text-blue-400">
                    {(results.AIVR_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">ROI-Adjusted</div>
                </div>

                {/* Revenue at Risk */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Revenue at Risk</span>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-4xl font-bold mb-1 text-red-400">
                    ${results.Revenue_at_Risk_USD.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">Monthly estimate</div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                <p className="text-slate-200">{results.modal_summary}</p>
              </div>

              {/* Platform Breakdown */}
              {platformEntries.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Platform Visibility Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {platformEntries.map(([platform, score]) => (
                      <div
                        key={platform}
                        className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{platform}</span>
                          <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                            {(score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 0.8 ? 'bg-green-400' : score >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${score * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Metrics */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Core Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Google AIO Inclusion</span>
                      <span className="text-white">
                        {((inputs?.google_aio_inclusion_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Schema Coverage</span>
                      <span className="text-white">
                        {((inputs?.schema_coverage_ratio || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">UGC Health</span>
                      <span className="text-white">{inputs?.ugc_health_score || 0}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entity Confidence</span>
                      <span className="text-white">
                        {((inputs?.entity_confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Business Impact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Opportunities</span>
                      <span className="text-white">{inputs?.monthly_opportunities || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Gross per Unit</span>
                      <span className="text-white">${inputs?.avg_gross_per_unit || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CTR Delta</span>
                      <span className="text-green-400">
                        +{((inputs?.ctr_delta || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Conversion Delta</span>
                      <span className="text-green-400">
                        +{((inputs?.conversion_delta || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => window.open('/dashboard/intelligence', '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  View Full Intelligence Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback inputs for demo/error states
 */
function getFallbackInputs(dealerId: string): AIVInputs {
  return {
    dealerId,
    platform_scores: {
      chatgpt: 0.86,
      claude: 0.82,
      gemini: 0.84,
      perplexity: 0.78,
      copilot: 0.75,
      grok: 0.70,
    },
    google_aio_inclusion_rate: 0.62,
    ugc_health_score: 84,
    schema_coverage_ratio: 0.91,
    semantic_clarity_score: 0.88,
    silo_integrity_score: 0.82,
    authority_depth_index: 0.87,
    temporal_weight: 1.05,
    entity_confidence: 0.96,
    crawl_budget_mult: 0.98,
    inventory_truth_mult: 1.0,
    ctr_delta: 0.094,
    conversion_delta: 0.047,
    avg_gross_per_unit: 1200,
    monthly_opportunities: 450,
  };
}

