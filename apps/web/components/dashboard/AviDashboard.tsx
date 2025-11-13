'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Shield, Zap } from 'lucide-react';

interface AviData {
  tenant_id: string;
  aiv: number;
  by_engine: Array<{
    engine: string;
    score: number;
    citations?: number;
  }>;
  parity: {
    google_gpt: number;
    google_perplexity: number;
  };
  eeat: {
    site: number;
    pages_scored: number;
  };
  zero_click_forecast: number;
  updated_at: string;
}

export function AviDashboard() {
  const [data, setData] = useState<AviData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo - replace with actual API call
    const mockData: AviData = {
      tenant_id: "t_123",
      aiv: 82.4,
      by_engine: [
        { engine: "Google", score: 85.1 },
        { engine: "ChatGPT", score: 78.9, citations: 12 },
        { engine: "Perplexity", score: 74.3 }
      ],
      parity: { google_gpt: 0.76, google_perplexity: 0.81 },
      eeat: { site: 0.71, pages_scored: 214 },
      zero_click_forecast: 0.62,
      updated_at: "2025-10-10T14:05:00Z"
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <AviDashboardSkeleton />;
  }

  if (!data) {
    return <AviDashboardError />;
  }

  return (
    <div className="space-y-6">
      {/* Main AIV Score */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">AIV™ Score</CardTitle>
              <p className="text-blue-100 text-sm">Algorithmic Visibility Index</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{data.aiv}</div>
              <div className="text-blue-100 text-sm">Out of 100</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Progress value={data.aiv} className="flex-1 h-3 bg-blue-800" />
            <Badge variant="secondary" className="bg-blue-500 text-white">
              {data.aiv >= 80 ? 'Excellent' : data.aiv >= 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Engine Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.by_engine.map((engine, index) => (
          <Card key={engine.engine} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{engine.engine}</CardTitle>
                <Badge variant="outline" className="text-sm">
                  {engine.score}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={engine.score} className="h-2" />
                {engine.citations && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="w-4 h-4 mr-1" />
                    {engine.citations} citations
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              E-E-A-T Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(data.eeat.site * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {data.eeat.pages_scored} pages scored
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Zero-Click Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(data.zero_click_forecast * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              Likelihood of zero-click results
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Google-GPT Parity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(data.parity.google_gpt * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">
              Content consistency score
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">
              {new Date(data.updated_at).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(data.updated_at).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Run New Scan
        </button>
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors">
          View Detailed Report
        </button>
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Export PDF
        </button>
      </div>
    </div>
  );
}

function AviDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-100 animate-pulse">
        <CardHeader>
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-gray-300 rounded"></div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AviDashboardError() {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <div className="text-red-600 font-semibold mb-2">Unable to load AVI data</div>
        <p className="text-red-500 text-sm mb-4">Please try refreshing the page or contact support.</p>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Retry
        </button>
      </CardContent>
    </Card>
  );
}
