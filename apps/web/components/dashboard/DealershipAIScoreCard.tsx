"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle, TrendingUp, Gauge, Zap, Shield, BarChart3 } from "lucide-react";

interface AIVATIResponse {
  manifest_version: string;
  environment: string;
  endpoint: string;
  dealerId?: string;
  domain?: string;
  timestamp: string;
  model_version: string;
  schema: {
    kpi_scoreboard: {
      QAI_star: number;
      VAI_Penalized: number;
      PIQR: number;
      HRP: number;
      OCI: number;
    };
    platform_breakdown: Array<{
      platform: string;
      score: number;
      confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    zero_click_inclusion_rate: number;
    ugc_health_score: number;
    aivati_composite: {
      AIV: number;
      ATI: number;
      CRS: number;
    };
    derived_metrics: {
      ai_visibility_overall: number;
      revenue_at_risk_monthly: number;
      revenue_at_risk_annualized: number;
      confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
    };
    annotations: {
      visibility_trend: string;
      ugc_trend: string;
      zero_click_trend: string;
      primary_opportunities: string[];
      next_actions: string[];
    };
  };
}

interface DealershipAIScoreCardProps {
  origin?: string;
  dealerId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export default function DealershipAIScoreCard({
  origin,
  dealerId,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes default
}: DealershipAIScoreCardProps) {
  const [data, setData] = useState<AIVATIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (dealerId) {
        params.set('dealerId', dealerId);
      } else if (origin) {
        // Extract domain from origin URL
        const domain = origin.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        params.set('domain', domain);
      } else {
        throw new Error('Either origin or dealerId must be provided');
      }

      const res = await fetch(`/api/ai/metrics?${params.toString()}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error ${res.status}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI scores');
      console.error('DealershipAIScoreCard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchScores, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [origin, dealerId, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading AI visibility metrics...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { schema } = data;
  const { aivati_composite, kpi_scoreboard, platform_breakdown, derived_metrics } = schema;

  // Helper to get status color
  const getStatusColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-400';
    if (score >= 0.75) return 'text-blue-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* AIVATI Composite Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            AIVATI Composite Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">AIV (Algorithmic Visibility Index)</div>
              <div className={`text-3xl font-bold ${getStatusColor(aivati_composite.AIV)}`}>
                {(aivati_composite.AIV * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Excellent findability across AI platforms</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">ATI (Algorithmic Trust Index)</div>
              <div className={`text-3xl font-bold ${getStatusColor(aivati_composite.ATI)}`}>
                {(aivati_composite.ATI * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">High trust from structured data</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">CRS (Composite Reputation Score)</div>
              <div className={`text-3xl font-bold ${getStatusColor(aivati_composite.CRS)}`}>
                {(aivati_composite.CRS * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Stable reputation above 90th percentile</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Scoreboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            KPI Scoreboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">QAI Star</div>
              <div className="text-xl font-semibold text-yellow-400">{kpi_scoreboard.QAI_star.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">VAI Penalized</div>
              <div className={`text-xl font-semibold ${getStatusColor(kpi_scoreboard.VAI_Penalized)}`}>
                {(kpi_scoreboard.VAI_Penalized * 100).toFixed(0)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">PIQR</div>
              <div className={`text-xl font-semibold ${getStatusColor(kpi_scoreboard.PIQR)}`}>
                {(kpi_scoreboard.PIQR * 100).toFixed(0)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">HRP</div>
              <div className={`text-xl font-semibold ${getStatusColor(kpi_scoreboard.HRP)}`}>
                {(kpi_scoreboard.HRP * 100).toFixed(0)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">OCI</div>
              <div className={`text-xl font-semibold ${getStatusColor(kpi_scoreboard.OCI)}`}>
                {(kpi_scoreboard.OCI * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Platform Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platform_breakdown.map((platform) => (
              <div
                key={platform.platform}
                className="p-4 rounded-lg bg-gray-900/50 border border-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium capitalize">{platform.platform}</div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    platform.confidence === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400' :
                    platform.confidence === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {platform.confidence}
                  </div>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(platform.score)}`}>
                  {platform.score}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Zero-Click Inclusion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getStatusColor(schema.zero_click_inclusion_rate)}`}>
              {(schema.zero_click_inclusion_rate * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Appears in AI Overviews without click-through
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">UGC Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getStatusColor(schema.ugc_health_score)}`}>
              {(schema.ugc_health_score * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Review balance & response rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overall AI Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(derived_metrics.ai_visibility_overall)}`}>
              {derived_metrics.ai_visibility_overall.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {schema.annotations.visibility_trend}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Monthly at Risk</div>
              <div className="text-2xl font-bold text-red-400">
                ${(derived_metrics.revenue_at_risk_monthly / 1000).toFixed(1)}K
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Annual at Risk</div>
              <div className="text-2xl font-bold text-red-400">
                ${(derived_metrics.revenue_at_risk_annualized / 1000000).toFixed(2)}M
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Confidence</div>
              <div className={`text-lg font-semibold ${
                derived_metrics.confidence_level === 'HIGH' ? 'text-emerald-400' :
                derived_metrics.confidence_level === 'MEDIUM' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {derived_metrics.confidence_level}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities & Actions */}
      {schema.annotations.primary_opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Primary Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {schema.annotations.primary_opportunities.map((opportunity, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400 mt-1">•</span>
                  <span className="text-gray-300">{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 text-center">
        Model: {data.model_version} • Updated: {new Date(data.timestamp).toLocaleString()}
        {autoRefresh && <span> • Auto-refresh enabled ({refreshInterval / 1000}s)</span>}
      </div>
    </div>
  );
}

