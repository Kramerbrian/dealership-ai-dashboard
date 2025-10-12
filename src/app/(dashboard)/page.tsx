"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductTour } from '@/components/tour/ProductTour';
import { ReputationEngine } from '@/components/reputation/ReputationEngine';
import { PredictiveInsights } from '@/components/insights/PredictiveInsights';
import { WhatIfSimulator } from '@/components/simulator/WhatIfSimulator';
import { TeamManagement } from '@/components/team/TeamManagement';
import { ExtendedAICoverage } from '@/components/ai-coverage/ExtendedAICoverage';
import { 
  FloatingAgentButton, 
  AgentButton, 
  AgentChatModal,
  EmergencyAgentTrigger,
  CompetitorAgentTrigger,
  AIVisibilityAgentTrigger
} from '@/components/agent';
import { 
  BarChart3, 
  Star, 
  Brain, 
  Calculator, 
  Users, 
  BookOpen,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Award
} from 'lucide-react';

interface DashboardMetrics {
  aivScore: number;
  atiScore: number;
  crsScore: number;
  overallRating: number;
  totalReviews: number;
  responseRate: number;
  sentimentScore: number;
  teamPerformance: number;
  aiCoverage: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  
  // Agent context data
  const dealerDomain = 'terryreidhyundai.com'; // In production, get from user context
  const dealerName = 'Terry Reid Hyundai';
  const lostRevenue = 1200; // Calculate from metrics (more realistic)
  const topCompetitor = 'Reed Dodge';

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('dealership-ai-tour-completed');
    if (!hasSeenTour) {
      setShowTour(true);
    }

    // Load dashboard metrics
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Simulate API call to load metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: DashboardMetrics = {
        aivScore: 87,
        atiScore: 82,
        crsScore: 84,
        overallRating: 4.8,
        totalReviews: 1247,
        responseRate: 92,
        sentimentScore: 89,
        teamPerformance: 85,
        aiCoverage: 78
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your AI-powered dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to DealershipAI</h1>
            <p className="text-blue-100 text-lg">
              Your AI-powered command center for dealership success
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowTour(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Target className="h-4 w-4" />
              Take Tour
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setIsAgentModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Zap className="h-4 w-4" />
              Ask AI Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${getScoreBgColor(metrics.aivScore)} border-l-4 border-blue-500`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AIV Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(metrics.aivScore)}`}>
                    {metrics.aivScore}
                  </p>
                  <p className="text-xs text-gray-500">Algorithmic Visibility Index</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${getScoreBgColor(metrics.overallRating * 20)} border-l-4 border-green-500`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Rating</p>
                  <p className={`text-3xl font-bold ${getScoreColor(metrics.overallRating * 20)}`}>
                    {metrics.overallRating}
                  </p>
                  <p className="text-xs text-gray-500">Based on {metrics.totalReviews} reviews</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${getScoreBgColor(metrics.responseRate)} border-l-4 border-purple-500`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className={`text-3xl font-bold ${getScoreColor(metrics.responseRate)}`}>
                    {metrics.responseRate}%
                  </p>
                  <p className="text-xs text-gray-500">Review responses</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${getScoreBgColor(metrics.aiCoverage)} border-l-4 border-orange-500`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Coverage</p>
                  <p className={`text-3xl font-bold ${getScoreColor(metrics.aiCoverage)}`}>
                    {metrics.aiCoverage}%
                  </p>
                  <p className="text-xs text-gray-500">Platform visibility</p>
                </div>
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reputation">Reputation</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="ai-coverage">AI Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                  <Star className="h-6 w-6" />
                  <span className="text-sm">Manage Reviews</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                  <Brain className="h-6 w-6" />
                  <span className="text-sm">View Insights</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  <span className="text-sm">Run Simulation</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Team Tasks</span>
                </Button>
              </div>
              
              {/* Agent Integration Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">🤖 AI Agent Assistance</h4>
                    <p className="text-sm text-gray-600">
                      Get personalized AI guidance for your dealership optimization
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <EmergencyAgentTrigger 
                    dealerDomain={dealerDomain} 
                    lostRevenue={lostRevenue} 
                  />
                  <CompetitorAgentTrigger 
                    dealerDomain={dealerDomain} 
                    competitor={topCompetitor} 
                  />
                  <AIVisibilityAgentTrigger 
                    dealerDomain={dealerDomain} 
                    score={metrics?.aivScore} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">New review response generated</p>
                      <p className="text-sm text-green-700">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">AI insight: SEO opportunity detected</p>
                      <p className="text-sm text-blue-700">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">Team task completed: Website update</p>
                      <p className="text-sm text-purple-700">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Review Response Master</p>
                      <p className="text-sm text-gray-600">Responded to 50+ reviews this month</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Growth Champion</p>
                      <p className="text-sm text-gray-600">AIV score increased by 15 points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">AI Explorer</p>
                      <p className="text-sm text-gray-600">Used all AI features this week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reputation">
          <ReputationEngine />
        </TabsContent>

        <TabsContent value="insights">
          <PredictiveInsights />
        </TabsContent>

        <TabsContent value="simulator">
          <WhatIfSimulator />
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="ai-coverage">
          <ExtendedAICoverage />
        </TabsContent>
      </Tabs>

      {/* Product Tour */}
      {showTour && (
        <ProductTour />
      )}

      {/* Floating Agent Button */}
      <FloatingAgentButton
        dealerDomain={dealerDomain}
        context={{
          currentScore: metrics?.aivScore,
          topCompetitor,
          lostRevenue,
          currentIssues: ['Missing Schema', 'Poor AI Visibility', 'Incomplete GBP']
        }}
      />

      {/* Agent Chat Modal */}
      <AgentChatModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        dealerDomain={dealerDomain}
        initialPrompt={`I'm looking at my dashboard for ${dealerName}. Help me understand my current AI visibility score of ${metrics?.aivScore} and what I should focus on first.`}
      />
    </div>
  );
}
