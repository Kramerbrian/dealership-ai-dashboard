'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Target,
  Zap,
  Eye,
  Search,
  Brain
} from 'lucide-react';

interface AEMDMetrics {
  aemdFinal: number;
  fsScore: number;
  aioScore: number;
  paaScore: number;
  omegaFs: number;
  omegaAio: number;
  omegaPaa: number;
  reportDate: string;
}

interface AccuracyMetrics {
  issueDetectionAccuracy: number;
  rankingCorrelation: number;
  consensusReliability: number;
  variance: number;
  confidenceLevel: string;
  isBelowThreshold: boolean;
  measurementDate: string;
}

interface HeatmapSegment {
  segment: string;
  omegaDS: number;
  value: number;
  trend: 'up' | 'down' | 'neutral';
  intensity: number; // 0-100
}

interface Props {
  tenantId: string;
  className?: string;
}

export function AEMDMonitoringDashboard({ tenantId, className = '' }: Props) {
  const [aemdMetrics, setAemdMetrics] = useState<AEMDMetrics[]>([]);
  const [accuracyMetrics, setAccuracyMetrics] = useState<AccuracyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchMetrics();
  }, [tenantId, selectedTimeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - getDaysFromRange(selectedTimeRange) * 86400000)
        .toISOString()
        .split('T')[0];

      // Fetch AEMD metrics
      const aemdResponse = await fetch(
        `/api/aemd-metrics?tenant_id=${tenantId}&start_date=${startDate}&end_date=${endDate}`
      );
      const aemdData = await aemdResponse.json();

      // Fetch accuracy monitoring
      const accuracyResponse = await fetch(
        `/api/accuracy-monitoring?tenant_id=${tenantId}&start_date=${startDate}&end_date=${endDate}&include_alerts=true`
      );
      const accuracyData = await accuracyResponse.json();

      if (aemdData.success) {
        setAemdMetrics(aemdData.data);
      }

      if (accuracyData.success) {
        setAccuracyMetrics(accuracyData.data);
        setAlerts(accuracyData.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysFromRange = (range: string) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  const latestAEMD = aemdMetrics[0];
  const latestAccuracy = accuracyMetrics[0];

  // Calculate heatmap data for top ωDS segments
  const heatmapSegments: HeatmapSegment[] = latestAEMD ? [
    {
      segment: 'Form Submissions',
      omegaDS: latestAEMD.omegaFs,
      value: latestAEMD.fsScore,
      trend: 'up',
      intensity: (latestAEMD.fsScore / latestAEMD.aemdFinal) * 100,
    },
    {
      segment: 'AI Outcomes',
      omegaDS: latestAEMD.omegaAio,
      value: latestAEMD.aioScore,
      trend: 'up',
      intensity: (latestAEMD.aioScore / latestAEMD.aemdFinal) * 100,
    },
    {
      segment: 'Predicted Actions',
      omegaDS: latestAEMD.omegaPaa,
      value: latestAEMD.paaScore,
      trend: 'neutral',
      intensity: (latestAEMD.paaScore / latestAEMD.aemdFinal) * 100,
    },
  ] : [];

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'VERY_HIGH': return 'bg-green-500';
      case 'HIGH': return 'bg-blue-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAccuracyColor = (value: number, metric: string) => {
    // Different thresholds for different metrics
    const thresholds = {
      issueDetectionAccuracy: { good: 0.85, warning: 0.75 },
      rankingCorrelation: { good: 0.75, warning: 0.65 },
      consensusReliability: { good: 0.90, warning: 0.80 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';

    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AEMD Monitoring Dashboard</h2>
          <p className="text-muted-foreground">AI Economic Metrics & Accuracy Tracking</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              onClick={() => setSelectedTimeRange(range as any)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.filter((a: any) => !a.acknowledged_at).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{alerts.filter((a: any) => !a.acknowledged_at).length} Active Alerts:</strong>
            {' '}Accuracy metrics below threshold. Review accuracy monitoring section.
          </AlertDescription>
        </Alert>
      )}

      {/* Top Row: AEMD Score & Competitor Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AEMD Score Tile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AEMD Score
            </CardTitle>
            <CardDescription>AI Economic Metric Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {latestAEMD ? (
              <>
                <div className="text-5xl font-bold text-blue-600 mb-4">
                  {latestAEMD.aemdFinal.toFixed(2)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AEO/AIO (50%)</span>
                    <span className="font-semibold">{latestAEMD.aioScore.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">FS (30%)</span>
                    <span className="font-semibold">{latestAEMD.fsScore.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">PAA (20%)</span>
                    <span className="font-semibold">{latestAEMD.paaScore.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No AEMD data available</p>
            )}
          </CardContent>
        </Card>

        {/* Competitor Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              vs Competitor
            </CardTitle>
            <CardDescription>AEMD Score Comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Your Score</span>
                  <span className="text-lg font-bold text-blue-600">
                    {latestAEMD?.aemdFinal.toFixed(2) || '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${Math.min((latestAEMD?.aemdFinal || 0) / 5 * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Industry Average</span>
                  <span className="text-lg font-bold text-gray-600">2.45</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gray-500 h-3 rounded-full" style={{ width: '49%' }} />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  {latestAEMD && latestAEMD.aemdFinal > 2.45 ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        +{((latestAEMD.aemdFinal - 2.45) / 2.45 * 100).toFixed(1)}% above average
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">
                        Below industry average
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Module for Top ωDS Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Top ωDS Segments Heatmap
          </CardTitle>
          <CardDescription>Financial weight distribution and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {heatmapSegments.map((segment) => (
              <div
                key={segment.segment}
                className="relative p-4 rounded-lg border-2 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${segment.intensity / 100})`,
                  borderColor: segment.intensity > 50 ? '#2563eb' : '#94a3b8',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{segment.segment}</h4>
                  {segment.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {segment.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                </div>
                <div className="text-2xl font-bold mb-1">{segment.value.toFixed(3)}</div>
                <div className="text-xs text-gray-600">
                  Weight: {(segment.omegaDS * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">
                  Intensity: {segment.intensity.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FastSearch Clarity Tile: SCS / SIS / SCR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            FastSearch Clarity
          </CardTitle>
          <CardDescription>SCS / SIS / SCR Gauges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SCS Gauge */}
            <div className="text-center">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">SCS</span>
              </div>
              <div className="relative inline-flex">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.85)}`}
                    className="text-green-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  85%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Schema Clarity Score</p>
            </div>

            {/* SIS Gauge */}
            <div className="text-center">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">SIS</span>
              </div>
              <div className="relative inline-flex">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.78)}`}
                    className="text-blue-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  78%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Structured Info Score</p>
            </div>

            {/* SCR Gauge */}
            <div className="text-center">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">SCR</span>
              </div>
              <div className="relative inline-flex">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.82)}`}
                    className="text-purple-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  82%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Schema Coverage Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust & Accuracy Overlay: ATI and HRP Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Trust & Accuracy Monitoring
          </CardTitle>
          <CardDescription>AI model accuracy and reliability trends</CardDescription>
        </CardHeader>
        <CardContent>
          {latestAccuracy ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Issue Detection</span>
                    <Badge className={getConfidenceBadgeColor(latestAccuracy.confidenceLevel)}>
                      {latestAccuracy.confidenceLevel}
                    </Badge>
                  </div>
                  <div className={`text-3xl font-bold ${getAccuracyColor(latestAccuracy.issueDetectionAccuracy, 'issueDetectionAccuracy')}`}>
                    {formatPercentage(latestAccuracy.issueDetectionAccuracy)}
                  </div>
                  <p className="text-xs text-gray-500">Target: ≥85%</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ranking Correlation</span>
                    {latestAccuracy.rankingCorrelation >= 0.75 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className={`text-3xl font-bold ${getAccuracyColor(latestAccuracy.rankingCorrelation, 'rankingCorrelation')}`}>
                    {formatPercentage(latestAccuracy.rankingCorrelation)}
                  </div>
                  <p className="text-xs text-gray-500">Target: ≥75%</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consensus Reliability</span>
                    {latestAccuracy.consensusReliability >= 0.90 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className={`text-3xl font-bold ${getAccuracyColor(latestAccuracy.consensusReliability, 'consensusReliability')}`}>
                    {formatPercentage(latestAccuracy.consensusReliability)}
                  </div>
                  <p className="text-xs text-gray-500">Target: ≥90%</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Variance: {latestAccuracy.variance.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      Confidence: {latestAccuracy.confidenceLevel} (variance &lt;5 = VERY_HIGH)
                    </p>
                  </div>
                  {latestAccuracy.isBelowThreshold && (
                    <Alert variant="destructive" className="w-fit">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>Below threshold</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No accuracy data available</p>
          )}
        </CardContent>
      </Card>

      {/* One-Click ASR Execution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Automated Schema Rewrite (ASR)
          </CardTitle>
          <CardDescription>One-click schema update and content optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Schema Update Ready</h4>
                <p className="text-sm text-gray-600">
                  Optimize schema markup based on latest AI visibility metrics
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Execute ASR
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Content Rewrite Queue</h4>
                <p className="text-sm text-gray-600">
                  3 pages scheduled for AI-optimized content updates
                </p>
              </div>
              <Button variant="outline">
                View Queue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
