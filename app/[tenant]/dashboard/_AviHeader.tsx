"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface AviReport {
  id: string;
  tenant_id: string;
  as_of: string;
  aiv_pct: number;
  ati_pct: number;
  crs_pct: number;
  elasticity_usd_per_point: number;
  r2: number;
  ci95_json: [number, number];
  regime_state: string;
  pillars_json: any;
  clarity_json: any;
  drivers_json: string[];
  anomalies_json: any[];
}

interface AviHeaderProps {
  tenantId: string;
}

export default function AviHeader({ tenantId }: AviHeaderProps) {
  const [data, setData] = useState<AviReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAviData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tenants/${tenantId}/avi/latest`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching AVI data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch AVI data');
      } finally {
        setLoading(false);
      }
    };

    fetchAviData();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Failed to load AVI data: {error || 'No data available'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return <Minus className="h-4 w-4 text-gray-400" />;
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TooltipProvider>
      <div className="grid gap-3 md:grid-cols-4">
        {/* AIV Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              <Tooltip>
                <TooltipTrigger>AIV™ Score</TooltipTrigger>
                <TooltipContent>
                  <p>Algorithmic Visibility Index - Overall AI visibility across platforms</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(data.aiv_pct)}`}>
                {data.aiv_pct.toFixed(1)}
              </span>
              {getTrendIcon(data.aiv_pct)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              CI: {data.ci95_json[0].toFixed(1)} - {data.ci95_json[1].toFixed(1)}
            </div>
          </CardContent>
        </Card>

        {/* ATI Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              <Tooltip>
                <TooltipTrigger>ATI™ Score</TooltipTrigger>
                <TooltipContent>
                  <p>Answer Engine Intelligence - Performance across AI answer engines</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(data.ati_pct)}`}>
                {data.ati_pct.toFixed(1)}
              </span>
              {getTrendIcon(data.ati_pct)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              R²: {data.r2.toFixed(3)}
            </div>
          </CardContent>
        </Card>

        {/* CRS Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              <Tooltip>
                <TooltipTrigger>CRS Score</TooltipTrigger>
                <TooltipContent>
                  <p>Citation Relevance Score - Quality of AI citations and mentions</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(data.crs_pct)}`}>
                {data.crs_pct.toFixed(1)}
              </span>
              {getTrendIcon(data.crs_pct)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Regime: {data.regime_state}
            </div>
          </CardContent>
        </Card>

        {/* Elasticity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              <Tooltip>
                <TooltipTrigger>Elasticity</TooltipTrigger>
                <TooltipContent>
                  <p>Revenue impact per AIV point improvement</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.elasticity_usd_per_point)}
              </span>
              <Badge variant="outline" className="text-xs">
                per point
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              As of: {new Date(data.as_of).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
