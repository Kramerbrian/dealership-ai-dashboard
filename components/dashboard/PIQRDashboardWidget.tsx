'use client';

/**
 * PIQR Dashboard Widget
 * 
 * Production-grade Perceptual Intelligence & Quality Reliability widget
 * with predictive stability, RankEmbed maps, agentic RCA, JSON-LD export, and feedback integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  GaugeChart,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  BarChart3,
  Activity,
  Target,
  Brain,
} from 'lucide-react';

interface PIQRData {
  piqr_overall: number;
  aiv_score: number;
  ati_score: number;
  crs_score: number;
  zero_click_rate: number;
  consensus_reliability: number;
  aiv: {
    seo_score: number;
    aeo_score: number;
    geo_score: number;
    ugc_score: number;
    geolocal_score: number;
    overall: number;
  };
  ati: {
    schema_consistency: number;
    review_legitimacy: number;
    topical_authority: number;
    source_credibility: number;
    overall: number;
  };
  crs: {
    score: number;
    variance_aiv: number;
    variance_ati: number;
    weights: { w1: number; w2: number };
  };
  forecast: {
    piqr_forecast_next_14d: Array<{
      date: string;
      value: number;
      lower_bound: number;
      upper_bound: number;
    }>;
    confidence_interval: number;
    model: string;
  };
  rankembed_map: Array<{
    url: string;
    scs: number;
    sis: number;
    scr: number;
    aiv_sel: number;
  }>;
  historical: Array<{
    date: string;
    piqr_overall: number;
    aiv_score: number;
    ati_score: number;
    crs_score: number;
  }>;
  agentic_rca: Array<{
    scenario: string;
    expected_gain: {
      aiv_score: string;
      ati_score: string;
      crs_score: string;
    };
    confidence_level: number;
    description: string;
  }>;
}

interface PIQRDashboardWidgetProps {
  dealerId?: string;
  range?: '7d' | '30d' | '90d' | '1y';
  onAction?: (action: string, data?: any) => void;
}

export default function PIQRDashboardWidget({
  dealerId = 'current',
  range = '30d',
  onAction,
}: PIQRDashboardWidgetProps) {
  const [data, setData] = useState<PIQRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [showRankEmbed, setShowRankEmbed] = useState(false);

  // Fetch PIQR data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/piqr?dealerId=${dealerId}&range=${range}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch PIQR data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('PIQR fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dealerId, range]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Inject JSON-LD schema
  useEffect(() => {
    if (!data) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'piqr-jsonld';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Rating',
      name: 'PIQR Quality Reliability',
      ratingValue: data.piqr_overall.toFixed(1),
      bestRating: '100',
      worstRating: '0',
      ratingExplanation: 'Composite AI reliability score across trust, clarity, and consensus',
      author: {
        '@type': 'Organization',
        name: 'DealershipAI',
      },
    });

    // Remove existing schema if present
    const existing = document.getElementById('piqr-jsonld');
    if (existing) {
      existing.remove();
    }

    // Safely append script to head
    try {
      if (document.head && script) {
        document.head.appendChild(script);
      }
    } catch (error) {
      console.warn('Failed to append JSON-LD script:', error);
    }

    return () => {
      const toRemove = document.getElementById('piqr-jsonld');
      if (toRemove) {
        toRemove.remove();
      }
    };
  }, [data]);

  // Simulate intervention forecast with variance weighting
  const simulateIntervention = async (scenario: string) => {
    if (!data) return;

    try {
      setSelectedScenario(scenario);
      const response = await fetch('/api/piqr/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId,
          scenario,
          current_scores: {
            aiv_score: data.aiv_score,
            ati_score: data.ati_score,
            crs_score: data.crs_score,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setForecastData(result.data);
        
        // Track feedback for learning
        if (onAction) {
          onAction('simulation_triggered', { scenario, forecast: result.data });
        }
      }
    } catch (err) {
      console.error('Forecast error:', err);
    }
  };

  // Submit feedback with event weights
  const submitFeedback = async (
    event: 'accept_recommendation' | 'reject_recommendation' | 'manual_override' | 'correction',
    recommendationId?: string,
    correction?: { metric: string; old_value: number; new_value: number; reason?: string }
  ) => {
    try {
      const response = await fetch('/api/piqr/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId,
          event,
          recommendation_id: recommendationId,
          correction,
          use_in_retrain: true, // Always use feedback for retraining
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Show success feedback
          if (onAction) {
            onAction('feedback_submitted', { 
              event, 
              recommendationId, 
              feedback_id: result.data.feedback_id,
              will_retrain: result.data.will_retrain,
            });
          }
        }
      }
    } catch (err) {
      console.error('Feedback error:', err);
      if (onAction) {
        onAction('feedback_error', { event, error: err });
      }
    }
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <p>Error loading PIQR data: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Prepare radar chart data (matching spec axes)
  const radarData = [
    { metric: 'Visibility', value: data.aiv_score },
    { metric: 'Trust', value: data.ati_score },
    { metric: 'Reputation', value: data.crs_score },
    { metric: 'Reliability', value: data.consensus_reliability * 100 },
    { metric: 'Consensus', value: data.zero_click_rate },
  ];

  // Prepare AIV breakdown
  const aivData = [
    { name: 'SEO', value: data.aiv.seo_score },
    { name: 'AEO', value: data.aiv.aeo_score },
    { name: 'GEO', value: data.aiv.geo_score },
    { name: 'UGC', value: data.aiv.ugc_score },
    { name: 'GeoLocal', value: data.aiv.geolocal_score },
  ];

  // Prepare ATI breakdown
  const atiData = [
    { name: 'Schema', value: data.ati.schema_consistency },
    { name: 'Reviews', value: data.ati.review_legitimacy },
    { name: 'Authority', value: data.ati.topical_authority },
    { name: 'Source', value: data.ati.source_credibility },
  ];

  // Prepare forecast chart data
  const forecastChartData = data.forecast.piqr_forecast_next_14d.map((point, idx) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    forecast: point.value,
    lower: point.lower_bound,
    upper: point.upper_bound,
  }));

  // Historical trend data (last 14 days for forecast comparison)
  const historicalData = data.historical.slice(-14).map((h) => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    PIQR: h.piqr_overall,
    AIV: h.aiv_score,
    ATI: h.ati_score,
    CRS: h.crs_score,
    UGC: h.ugc_health || 0,
    ZeroClick: h.zero_click_rate || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">PIQR Quality Reliability</h2>
          <p className="text-sm text-gray-500 mt-1">
            Perceptual Intelligence & Quality Reliability Dashboard
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Main Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ScoreCard
          title="PIQR Overall"
          value={data.piqr_overall.toFixed(1)}
          trend={data.historical.length > 1 ? 
            data.piqr_overall - data.historical[data.historical.length - 2].piqr_overall : 0
          }
          icon={<Target className="w-5 h-5" />}
          color="blue"
        />
        <ScoreCard
          title="AIV Score"
          value={data.aiv_score.toFixed(1)}
          trend={data.historical.length > 1 ?
            data.aiv_score - data.historical[data.historical.length - 2].aiv_score : 0
          }
          icon={<BarChart3 className="w-5 h-5" />}
          color="indigo"
        />
        <ScoreCard
          title="ATI Score"
          value={data.ati_score.toFixed(1)}
          trend={data.historical.length > 1 ?
            data.ati_score - data.historical[data.historical.length - 2].ati_score : 0
          }
          icon={<Brain className="w-5 h-5" />}
          color="purple"
        />
        <ScoreCard
          title="CRS Score"
          value={data.crs_score.toFixed(1)}
          trend={data.historical.length > 1 ?
            data.crs_score - data.historical[data.historical.length - 2].crs_score : 0
          }
          icon={<Activity className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <ChartCard title="PIQR Quality Reliability" color="#60a5fa">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="PIQR"
                dataKey="value"
                stroke="#60a5fa"
                fill="#60a5fa"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Forecast Chart */}
        <ChartCard title="Forecast (14-day stability)" color="#34d399">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastChartData}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="upper"
                stroke="#34d399"
                fillOpacity={0.1}
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#34d399"
                fill="url(#forecastGradient)"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="#34d399"
                fillOpacity={0.1}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* AIV Breakdown */}
        <ChartCard title="Algorithmic Visibility Index (AIV)" color="#3b82f6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aivData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ATI Breakdown */}
        <ChartCard title="Algorithmic Trust Index (ATI)" color="#8b5cf6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={atiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* CRS Gauge */}
        <ChartCard title="Composite Reputation Score (CRS)" color="#f59e0b">
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(data.crs.score / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {data.crs.score.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 mt-1">CRS Score</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center max-w-xs">
              Variance-weighted fusion of AIV and ATI for holistic reputation tracking.
            </p>
          </div>
        </ChartCard>

        {/* Historical Trend */}
        <ChartCard title="Historical Trend (14 days)" color="#10b981">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="PIQR" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="AIV" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="ATI" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="CRS" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* RankEmbed Map - Heatmap Visualization */}
      {showRankEmbed && (
        <ChartCard title="RankEmbed Semantic Clarity Map" color="#6366f1">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Displays RankEmbed correlation vs AIV_sel clarity layer. URL-level granularity for semantic clarity analysis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.rankembed_map.map((item, idx) => {
                // Calculate heatmap intensity (average of SCS, SIS, SCR)
                const intensity = (item.scs + item.sis + item.scr) / 3;
                const intensityPercent = Math.round(intensity * 100);
                
                // Color gradient based on intensity
                const bgColor = intensity > 0.85 
                  ? 'bg-green-100 border-green-300' 
                  : intensity > 0.70 
                  ? 'bg-yellow-100 border-yellow-300' 
                  : 'bg-red-100 border-red-300';
                
                return (
                  <div
                    key={idx}
                    className={`${bgColor} border-2 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
                    title={`SCS: ${item.scs.toFixed(2)}, SIS: ${item.sis.toFixed(2)}, SCR: ${item.scr.toFixed(2)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-semibold text-gray-900">
                        {item.url}
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {intensityPercent}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">SCS</span>
                        <span className="font-semibold">{item.scs.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">SIS</span>
                        <span className="font-semibold">{item.sis.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">SCR</span>
                        <span className="font-semibold">{item.scr.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t pt-1 mt-1">
                        <span className="text-gray-600">AIV Sel</span>
                        <span className="font-semibold text-blue-600">{item.aiv_sel.toFixed(2)}</span>
                      </div>
                    </div>
                    {/* Heatmap bar */}
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                        style={{ width: `${intensityPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>
      )}

      {/* Agentic RCA Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Agentic Root-Cause Recommendations
        </h3>
        <div className="space-y-3">
          {data.agentic_rca.map((rca, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 capitalize mb-2">
                    {rca.scenario.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{rca.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600">
                      AIV: {rca.expected_gain.aiv_score}
                    </span>
                    <span className="text-purple-600">
                      ATI: {rca.expected_gain.ati_score}
                    </span>
                    <span className="text-amber-600">
                      CRS: {rca.expected_gain.crs_score}
                    </span>
                    <span className="text-gray-500">
                      Confidence: {(rca.confidence_level * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => simulateIntervention(rca.scenario)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    title="Simulate intervention and forecast uplift"
                  >
                    Simulate
                  </button>
                  <button
                    onClick={() => submitFeedback('accept_recommendation', `rca_${idx}`)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    title="Accept recommendation (weight: +1.0)"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => submitFeedback('reject_recommendation', `rca_${idx}`)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    title="Reject recommendation (weight: -0.5)"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Forecast Results */}
      <AnimatePresence>
        {forecastData && selectedScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Forecast Simulation: {selectedScenario.replace(/_/g, ' ')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Current AIV</div>
                <div className="text-2xl font-bold text-gray-900">
                  {forecastData.current_scores.aiv_score.toFixed(1)}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  → {forecastData.projected_scores.aiv_score.toFixed(1)} ({forecastData.expected_gain.aiv_score})
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Current ATI</div>
                <div className="text-2xl font-bold text-gray-900">
                  {forecastData.current_scores.ati_score.toFixed(1)}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  → {forecastData.projected_scores.ati_score.toFixed(1)} ({forecastData.expected_gain.ati_score})
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Current CRS</div>
                <div className="text-2xl font-bold text-gray-900">
                  {forecastData.current_scores.crs_score.toFixed(1)}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  → {forecastData.projected_scores.crs_score.toFixed(1)} ({forecastData.expected_gain.crs_score})
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  submitFeedback('accept_recommendation', selectedScenario);
                  setForecastData(null);
                  setSelectedScenario(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Accept & Apply
              </button>
              <button
                onClick={() => {
                  setForecastData(null);
                  setSelectedScenario(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onAction?.('open_report', { type: 'piqr' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          Diagnostic Report
        </button>
        <button
          onClick={() => onAction?.('trigger_autofix')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Enable Auto-Fix
        </button>
        <button
          onClick={() => {
            fetchData();
            onAction?.('run_consensus_check');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Recheck Consensus
        </button>
        <button
          onClick={() => setShowRankEmbed(!showRankEmbed)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {showRankEmbed ? 'Hide' : 'Show'} RankEmbed Map
        </button>
      </div>
    </div>
  );
}

// Helper Components
function ScoreCard({
  title,
  value,
  trend,
  icon,
  color,
}: {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  color: 'blue' | 'indigo' | 'purple' | 'amber';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
  };

  return (
    <div className={`bg-white rounded-lg border ${colorClasses[color].split(' ')[1]} p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        <div className={colorClasses[color].split(' ')[0] + ' p-2 rounded-lg'}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="flex items-center gap-1 text-sm">
        {trend > 0 ? (
          <>
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600">+{trend.toFixed(1)}</span>
          </>
        ) : trend < 0 ? (
          <>
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-red-600">{trend.toFixed(1)}</span>
          </>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

