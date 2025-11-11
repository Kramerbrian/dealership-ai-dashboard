/**
 * Enhanced dAI Dashboard Component
 * 
 * Displays comprehensive AI visibility metrics including QAI, PIQR, VAI, HRP, OCI,
 * advanced metrics from JSON schema, competitive intelligence, technical health,
 * structured data coverage, sentiment analysis, and citation tracking.
 * 
 * @version 1.0.0
 * @author DealershipAI Team
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Target,
  Shield,
  Zap,
  Users,
  Globe,
  BarChart3,
  Brain,
  Search,
  Star
} from 'lucide-react';

interface EnhancedDAIDashboardProps {
  dealerId: string;
  domain: string;
  initialData?: any;
}

interface EnhancedDAIData {
  dealerId: string;
  domain: string;
  timestamp: string;
  dataSource: 'live' | 'demo';
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  qai: {
    score: number;
    breakdown: {
      answerRelevance: number;
      structuredDataPresence: number;
      contentClarity: number;
      citationSignals: number;
      queryCoverage: number;
      answerFreshness: number;
    };
  };
  piqr: {
    score: number;
    breakdown: {
      authorshipSignals: number;
      technicalHealth: number;
      sentimentTrust: number;
      contentDepth: number;
      citationStability: number;
      contentSafety: number;
    };
  };
  vai: number;
  hrp: number;
  oci: number;
  authorityVelocity: number;
  advancedMetrics: {
    mentions: number;
    citations: number;
    sentimentIndex: number;
    contentReadiness: number;
    shareOfVoice: number;
    citationStability: number;
    impressionToClickRate: number;
    competitiveShare: number;
    semanticRelevanceScore: number;
    technicalHealth: number;
  };
  aiEngineScores: {
    chatgptStrength: number;
    perplexityStrength: number;
    geminiStrength: number;
  };
  actionAreas: {
    contentQuality: number;
    structuredData: number;
    authoritySignals: number;
    trustSafety: number;
    monitoring: number;
    feedbackLoop: number;
  };
  competitiveIntelligence: {
    marketPosition: number;
    competitiveGap: number;
    displacementRisk: number;
    shareOfVoice: number;
    topCompetitors: Array<{
      domain: string;
      score: number;
      threatLevel: string;
    }>;
  };
  technicalHealth: {
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
      overall: number;
    };
    pageSpeed: number;
    mobileOptimization: number;
    accessibility: number;
    errorRate: number;
    security: number;
    overall: number;
  };
  structuredData: {
    coverage: number;
    schemaTypes: {
      organization: number;
      localBusiness: number;
      automotiveDealer: number;
      vehicle: number;
      review: number;
      faq: number;
      staff: number;
      service: number;
      offer: number;
    };
    validationErrors: number;
    criticalErrors: number;
  };
  sentimentAnalysis: {
    netSentiment: number;
    sentimentTrend: number;
    reviewVelocity: number;
    reviewQuality: number;
    npsScore: number;
    trustIndicators: number;
    authoritySignals: number;
  };
  citationTracking: {
    totalMentions: number;
    chatgptMentions: number;
    perplexityMentions: number;
    geminiMentions: number;
    googleAIMentions: number;
    featuredSnippets: number;
    peopleAlsoAsk: number;
    citationStability: number;
    averagePosition: number;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  criticalIssues: string[];
  trends: {
    scoreChange: number;
    trendDirection: 'up' | 'down' | 'stable';
    keyImprovements: string[];
    keyDeclines: string[];
  };
}

export default function EnhancedDAIDashboard({ dealerId, domain, initialData }: EnhancedDAIDashboardProps) {
  const [data, setData] = useState<EnhancedDAIData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) {
      fetchEnhancedDAIData();
    }
  }, [dealerId, domain]);

  const fetchEnhancedDAIData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/enhanced-dai?dealerId=${dealerId}&domain=${domain}&simulate=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch enhanced dAI data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Error loading enhanced dAI data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced dAI Dashboard</h1>
          <p className="text-gray-600">Comprehensive AI visibility and optimization metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getRiskBadgeColor(data.riskLevel)}>
            {data.riskLevel.toUpperCase()} RISK
          </Badge>
          <Badge variant="outline">
            {data.dataSource.toUpperCase()} DATA
          </Badge>
        </div>
      </div>

      {/* Overall Score and Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall dAI Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.overallScore}</div>
            <div className="flex items-center space-x-2 mt-2">
              {data.trends.trendDirection === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-muted-foreground">
                {data.trends.scoreChange > 0 ? '+' : ''}{data.trends.scoreChange}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QAI Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.qai.score)}`}>
              {data.qai.score}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Quality of Answers Index
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PIQR Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.piqr.score)}`}>
              {data.piqr.score}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Page Information Quality Rank
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAI Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.vai)}`}>
              {data.vai}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Visibility Authority Index
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {data.criticalIssues.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Issues Detected:</strong> {data.criticalIssues.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-engines">AI Engines</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QAI Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>QAI Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(data.qai.breakdown).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={getScoreColor(value)}>{value}</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* PIQR Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>PIQR Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(data.piqr.breakdown).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={getScoreColor(value)}>{value}</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Advanced Metrics Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Advanced Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(data.advancedMetrics).map(([key, value]) => (
                  <div key={key} className="text-center space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                      {typeof value === 'number' ? value : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Engines Tab */}
        <TabsContent value="ai-engines" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>ChatGPT Strength</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(data.aiEngineScores.chatgptStrength)}`}>
                  {data.aiEngineScores.chatgptStrength}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Text coherence, informational depth, intent fit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Perplexity Strength</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(data.aiEngineScores.perplexityStrength)}`}>
                  {data.aiEngineScores.perplexityStrength}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Citation frequency, freshness, domain reputation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Gemini Strength</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(data.aiEngineScores.geminiStrength)}`}>
                  {data.aiEngineScores.geminiStrength}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Knowledge Graph signals, schema optimization
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Citation Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Citation Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.citationTracking.totalMentions}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Mentions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {data.citationTracking.featuredSnippets}
                  </div>
                  <div className="text-xs text-muted-foreground">Featured Snippets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {data.citationTracking.citationStability}
                  </div>
                  <div className="text-xs text-muted-foreground">Citation Stability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {data.citationTracking.averagePosition}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Position</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitive Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Market Position</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Market Share</span>
                  <span className="font-semibold">{data.competitiveIntelligence.marketPosition}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Share of Voice</span>
                  <span className="font-semibold">{data.competitiveIntelligence.shareOfVoice}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Competitive Gap</span>
                  <span className={`font-semibold ${data.competitiveIntelligence.competitiveGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.competitiveIntelligence.competitiveGap > 0 ? '+' : ''}{data.competitiveIntelligence.competitiveGap}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Displacement Risk</span>
                  <span className={`font-semibold ${getScoreColor(100 - data.competitiveIntelligence.displacementRisk)}`}>
                    {data.competitiveIntelligence.displacementRisk}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Competitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.competitiveIntelligence.topCompetitors.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{competitor.domain}</div>
                        <div className="text-sm text-muted-foreground">
                          Score: {competitor.score}
                        </div>
                      </div>
                      <Badge className={getScoreBadgeColor(competitor.score)}>
                        {competitor.threatLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>LCP (Largest Contentful Paint)</span>
                    <span className={data.technicalHealth.coreWebVitals.lcp < 2500 ? 'text-green-600' : 'text-red-600'}>
                      {data.technicalHealth.coreWebVitals.lcp}ms
                    </span>
                  </div>
                  <Progress value={Math.max(0, 100 - (data.technicalHealth.coreWebVitals.lcp - 2500) / 25)} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>FID (First Input Delay)</span>
                    <span className={data.technicalHealth.coreWebVitals.fid < 100 ? 'text-green-600' : 'text-red-600'}>
                      {data.technicalHealth.coreWebVitals.fid}ms
                    </span>
                  </div>
                  <Progress value={Math.max(0, 100 - (data.technicalHealth.coreWebVitals.fid - 100) / 1)} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CLS (Cumulative Layout Shift)</span>
                    <span className={data.technicalHealth.coreWebVitals.cls < 0.1 ? 'text-green-600' : 'text-red-600'}>
                      {data.technicalHealth.coreWebVitals.cls}
                    </span>
                  </div>
                  <Progress value={Math.max(0, 100 - data.technicalHealth.coreWebVitals.cls * 333)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Health Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Page Speed</span>
                  <span className={getScoreColor(data.technicalHealth.pageSpeed)}>
                    {data.technicalHealth.pageSpeed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Optimization</span>
                  <span className={getScoreColor(data.technicalHealth.mobileOptimization)}>
                    {data.technicalHealth.mobileOptimization}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Accessibility</span>
                  <span className={getScoreColor(data.technicalHealth.accessibility)}>
                    {data.technicalHealth.accessibility}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className={data.technicalHealth.errorRate < 5 ? 'text-green-600' : 'text-red-600'}>
                    {data.technicalHealth.errorRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Security</span>
                  <span className={getScoreColor(data.technicalHealth.security)}>
                    {data.technicalHealth.security}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Structured Data Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Overall Coverage</span>
                    <span className={getScoreColor(data.structuredData.coverage)}>
                      {data.structuredData.coverage}%
                    </span>
                  </div>
                  <Progress value={data.structuredData.coverage} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(data.structuredData.schemaTypes).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Net Sentiment</span>
                  <span className={data.sentimentAnalysis.netSentiment >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {data.sentimentAnalysis.netSentiment > 0 ? '+' : ''}{data.sentimentAnalysis.netSentiment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sentiment Trend</span>
                  <span className={data.sentimentAnalysis.sentimentTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {data.sentimentAnalysis.sentimentTrend > 0 ? '+' : ''}{data.sentimentAnalysis.sentimentTrend}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Review Velocity</span>
                  <span>{data.sentimentAnalysis.reviewVelocity}/day</span>
                </div>
                <div className="flex justify-between">
                  <span>NPS Score</span>
                  <span className={getScoreColor(data.sentimentAnalysis.npsScore)}>
                    {data.sentimentAnalysis.npsScore}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trust Indicators</span>
                  <span className={getScoreColor(data.sentimentAnalysis.trustIndicators)}>
                    {data.sentimentAnalysis.trustIndicators}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {data.recommendations.map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getPriorityColor(recommendation.priority)} bg-opacity-20`}>
                      {recommendation.priority === 'high' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : recommendation.priority === 'medium' ? (
                        <Activity className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <Badge className={getScoreBadgeColor(recommendation.priority === 'high' ? 20 : recommendation.priority === 'medium' ? 60 : 80)}>
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">{recommendation.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Impact: {recommendation.impact}</span>
                        <span>Effort: {recommendation.effort}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
