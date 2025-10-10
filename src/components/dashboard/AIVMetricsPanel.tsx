'use client';

import React, { useState } from 'react';
import { useAIVMetricsWithRefresh } from '@/hooks/useAIVMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  DollarSign, 
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AIVMetricsPanelProps {
  dealerId: string;
  className?: string;
}

export function AIVMetricsPanel({ dealerId, className = '' }: AIVMetricsPanelProps) {
  const { 
    metrics, 
    trends, 
    isLoading, 
    error, 
    refetch,
    recomputeElasticity,
    isRecomputing 
  } = useAIVMetricsWithRefresh({ dealerId });

  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Visibility Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            AI Visibility Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load metrics</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Visibility Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No metrics available</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendValue = (current: number, previous: number) => {
    const diff = current - previous;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Visibility Metrics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={metrics.metadata?.status === 'mock_data' ? 'outline' : 'default'}>
              {metrics.metadata?.status === 'mock_data' ? 'Demo' : 'Live'}
            </Badge>
            <Button
              onClick={() => recomputeElasticity()}
              disabled={isRecomputing}
              variant="outline"
              size="sm"
            >
              {isRecomputing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AIV Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">AIV Score</span>
              <Badge variant={getScoreBadgeVariant(metrics.aiv_score)}>
                {metrics.aiv_score}/100
              </Badge>
            </div>
            <Progress value={metrics.aiv_score} className="h-2" />
            <p className="text-xs text-gray-500">
              Algorithmic Visibility Index
            </p>
          </div>

          {/* ATI Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">ATI Score</span>
              <Badge variant={getScoreBadgeVariant(metrics.ati_score)}>
                {metrics.ati_score}/100
              </Badge>
            </div>
            <Progress value={metrics.ati_score} className="h-2" />
            <p className="text-xs text-gray-500">
              Answer Engine Intelligence
            </p>
          </div>

          {/* CRS Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">CRS Score</span>
              <Badge variant={getScoreBadgeVariant(metrics.crs_score)}>
                {metrics.crs_score}/100
              </Badge>
            </div>
            <Progress value={metrics.crs_score} className="h-2" />
            <p className="text-xs text-gray-500">
              Citation Relevance Score
            </p>
          </div>
        </div>

        {/* Elasticity Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue Impact
            </h4>
            <Badge variant="outline" className="text-xs">
              R² = {metrics.r2_coefficient.toFixed(3)}
            </Badge>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${metrics.elasticity_usd_per_pt.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  per AIV point improvement
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-lg font-semibold text-green-600">
                  {(metrics.metadata?.confidence_score || 0.85) * 100}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {metrics.metadata?.recommendations && metrics.metadata.recommendations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Target className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {metrics.metadata.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Toggle */}
        <div className="border-t pt-4">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          
          {showDetails && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {new Date(metrics.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Query Count</p>
                  <p className="font-medium">
                    {metrics.metadata?.query_count || 1}
                  </p>
                </div>
              </div>
              {metrics.metadata?.calculation_method && (
                <div>
                  <p className="text-gray-600">Calculation Method</p>
                  <p className="font-medium">
                    {metrics.metadata.calculation_method}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
