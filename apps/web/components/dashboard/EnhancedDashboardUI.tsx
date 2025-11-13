/**
 * Enhanced Dashboard UI - Main Dashboard Component
 * Complete dashboard with all tabs and tier-based features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Target, 
  Users, 
  Zap, 
  Search,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Settings,
  Download,
  MessageSquare,
  Bell
} from 'lucide-react';
import ExecutiveSummary from './ExecutiveSummary';
import FivePillars from './FivePillars';
import QuickWins from './QuickWins';
import type { QAIScore, EEATScore, AIPlatformScore, Competitor, QuickWin } from '@/lib/types';

interface DashboardData {
  qai: QAIScore;
  eeat: EEATScore;
  platforms: AIPlatformScore[];
  competitors: Competitor[];
  quickWins: QuickWin[];
  summary: {
    total_revenue_opportunity: number;
    potential_score_gain: number;
    critical_issues: number;
    quick_wins_count: number;
  };
}

interface EnhancedDashboardUIProps {
  dealership: {
    id: string;
    name: string;
    tier: 'FREE' | 'PRO' | 'ENTERPRISE';
    sessions_remaining: number;
  };
}

export default function EnhancedDashboardUI({ dealership }: EnhancedDashboardUIProps) {
  const [activeTab, setActiveTab] = useState('executive');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // In production, these would be real API calls
        const [qaiResponse, competitorsResponse, quickWinsResponse] = await Promise.all([
          fetch(`/api/dealerships/${dealership.id}/qai`),
          fetch(`/api/dealerships/${dealership.id}/competitors`),
          fetch(`/api/dealerships/${dealership.id}/quick-wins`),
        ]);

        if (!qaiResponse.ok || !competitorsResponse.ok || !quickWinsResponse.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const [qaiData, competitorsData, quickWinsData] = await Promise.all([
          qaiResponse.json(),
          competitorsResponse.json(),
          quickWinsResponse.json(),
        ]);

        setData({
          qai: qaiData.qai,
          eeat: qaiData.eeat,
          platforms: qaiData.platforms,
          competitors: competitorsData.competitors,
          quickWins: quickWinsData.recommendations,
          summary: quickWinsData.summary,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dealership.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg font-semibold">Loading your AI visibility dashboard...</div>
          <div className="text-sm text-gray-600">Analyzing your dealership's AI presence</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div className="text-lg font-semibold text-red-900">Failed to load dashboard</div>
          <div className="text-sm text-red-600">{error || 'Unknown error occurred'}</div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-lg font-bold text-gray-900">DealershipAI</div>
                  <div className="text-xs text-gray-500">{dealership.name}</div>
                </div>
              </div>
              <Badge variant="outline" className="ml-4">
                {dealership.tier}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">QAI★ {data.qai.qai_star_score}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>#{data.competitors.findIndex(c => c.name === dealership.name) + 1} of {data.competitors.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span>${data.summary.total_revenue_opportunity.toLocaleString()}/mo</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Chat
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="executive" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Executive</span>
            </TabsTrigger>
            <TabsTrigger value="pillars" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>5 Pillars</span>
            </TabsTrigger>
            <TabsTrigger value="competitive" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Competitive</span>
            </TabsTrigger>
            <TabsTrigger value="quick-wins" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Quick Wins</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <ExecutiveSummary
              qai={data.qai}
              eeat={data.eeat}
              platforms={data.platforms}
              competitors={data.competitors}
              dealership={dealership}
            />
          </TabsContent>

          <TabsContent value="pillars" className="space-y-6">
            <FivePillars
              qai={data.qai}
              eeat={data.eeat}
              dealership={dealership}
            />
          </TabsContent>

          <TabsContent value="competitive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Competitive Intelligence</span>
                  <Badge variant="outline" className="ml-auto">
                    {dealership.tier === 'FREE' ? 'Top 3' : 'Unlimited'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    Competitive Intelligence
                  </div>
                  <div className="text-gray-600 mb-4">
                    Deep dive into your competitive landscape and market position
                  </div>
                  {dealership.tier === 'FREE' && (
                    <Button>
                      Upgrade to View Full Competitive Analysis
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick-wins" className="space-y-6">
            <QuickWins
              quickWins={data.quickWins}
              summary={data.summary}
              dealership={dealership}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Revenue Impact Calculator */}
      <div className="fixed bottom-6 right-6 z-40">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Monthly Opportunity</span>
              </div>
              <div className="text-2xl font-bold">
                ${data.summary.total_revenue_opportunity.toLocaleString()}
              </div>
              <div className="text-xs opacity-90">
                Your ROI Multiple: {Math.round(data.summary.total_revenue_opportunity / 499)}x
              </div>
              <div className="text-xs opacity-90">
                Quick Wins Available: {data.summary.quick_wins_count} under 30min
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Widget */}
      <div className="fixed bottom-6 left-6 z-40">
        <Button 
          size="lg" 
          className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          AI Assistant
        </Button>
      </div>
    </div>
  );
}
