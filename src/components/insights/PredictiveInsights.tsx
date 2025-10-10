"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Car,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PredictiveInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'forecast';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
  aiGenerated: boolean;
  metrics: {
    current: number;
    predicted: number;
    change: number;
    changePercent: number;
  };
  recommendations: string[];
}

interface ForecastData {
  date: string;
  aiv: number;
  ati: number;
  crs: number;
  revenue: number;
  confidence: number;
}

export default function PredictiveInsights() {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // Mock data - in production, this would come from your AI/ML APIs
    const mockInsights: PredictiveInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'SEO Optimization Opportunity',
        description: 'Your local SEO performance could improve by 23% with targeted keyword optimization in the next 30 days.',
        confidence: 87,
        impact: 'high',
        timeframe: '30 days',
        actionable: true,
        aiGenerated: true,
        metrics: {
          current: 67,
          predicted: 82,
          change: 15,
          changePercent: 22.4
        },
        recommendations: [
          'Optimize for "used cars near me" keyword',
          'Improve Google My Business listing',
          'Add location-specific content to website'
        ]
      },
      {
        id: '2',
        type: 'risk',
        title: 'Review Response Rate Decline',
        description: 'Your review response rate has decreased by 15% this month, which could impact reputation scores.',
        confidence: 92,
        impact: 'medium',
        timeframe: '14 days',
        actionable: true,
        aiGenerated: true,
        metrics: {
          current: 78,
          predicted: 65,
          change: -13,
          changePercent: -16.7
        },
        recommendations: [
          'Set up automated review monitoring',
          'Implement faster response protocols',
          'Train staff on review management'
        ]
      },
      {
        id: '3',
        type: 'trend',
        title: 'Electric Vehicle Interest Surge',
        description: 'Search volume for electric vehicles in your area has increased 45% this quarter.',
        confidence: 78,
        impact: 'high',
        timeframe: '90 days',
        actionable: true,
        aiGenerated: true,
        metrics: {
          current: 12,
          predicted: 18,
          change: 6,
          changePercent: 50.0
        },
        recommendations: [
          'Expand EV inventory',
          'Create EV-focused marketing campaigns',
          'Train sales team on EV features'
        ]
      },
      {
        id: '4',
        type: 'forecast',
        title: 'Q1 Revenue Forecast',
        description: 'Based on current trends, Q1 revenue is projected to increase by 8.5% compared to Q4.',
        confidence: 85,
        impact: 'high',
        timeframe: '90 days',
        actionable: true,
        aiGenerated: true,
        metrics: {
          current: 1250000,
          predicted: 1356250,
          change: 106250,
          changePercent: 8.5
        },
        recommendations: [
          'Prepare inventory for increased demand',
          'Hire additional sales staff',
          'Optimize financing options'
        ]
      }
    ];

    const mockForecastData: ForecastData[] = [
      { date: '2024-12-01', aiv: 72, ati: 68, crs: 70, revenue: 125000, confidence: 85 },
      { date: '2024-12-08', aiv: 75, ati: 71, crs: 73, revenue: 132000, confidence: 87 },
      { date: '2024-12-15', aiv: 78, ati: 74, crs: 76, revenue: 138000, confidence: 89 },
      { date: '2024-12-22', aiv: 81, ati: 77, crs: 79, revenue: 145000, confidence: 91 },
      { date: '2024-12-29', aiv: 84, ati: 80, crs: 82, revenue: 152000, confidence: 88 },
      { date: '2025-01-05', aiv: 87, ati: 83, crs: 85, revenue: 158000, confidence: 86 },
      { date: '2025-01-12', aiv: 90, ati: 86, crs: 88, revenue: 165000, confidence: 84 }
    ];

    setInsights(mockInsights);
    setForecastData(mockForecastData);
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-5 w-5 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'forecast': return <BarChart3 className="h-5 w-5 text-purple-600" />;
      default: return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Real-time Analysis
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Updated 2 min ago
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Timeframe:</span>
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d')}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            4-Week Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name === 'aiv' ? 'AIV Score' : 
                    name === 'ati' ? 'ATI Score' : 
                    name === 'crs' ? 'CRS Score' : 'Revenue'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="aiv" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="ati" 
                  stackId="2" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="crs" 
                  stackId="3" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                  {insight.aiGenerated && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      AI
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{insight.description}</p>
              
              {/* Confidence Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Confidence Score</span>
                  <span className="text-sm text-gray-600">{insight.confidence}%</span>
                </div>
                <Progress value={insight.confidence} className="h-2" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {insight.metrics.current >= 1000 ? formatNumber(insight.metrics.current) : insight.metrics.current}
                  </div>
                  <div className="text-sm text-gray-600">Current</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {insight.metrics.predicted >= 1000 ? formatNumber(insight.metrics.predicted) : insight.metrics.predicted}
                  </div>
                  <div className="text-sm text-blue-600">Predicted</div>
                </div>
              </div>

              {/* Change Indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {insight.metrics.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-medium ${insight.metrics.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.changePercent.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-600">in {insight.timeframe}</span>
              </div>

              {/* Recommendations */}
              {insight.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.actionable && (
                <Button className="w-full mt-4" size="sm">
                  Take Action
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Target className="h-5 w-5" />
              <span className="text-sm">Optimize SEO</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Users className="h-5 w-5" />
              <span className="text-sm">Manage Reviews</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Car className="h-5 w-5" />
              <span className="text-sm">Update Inventory</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">Adjust Pricing</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
