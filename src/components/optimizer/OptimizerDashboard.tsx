'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  Wrench,
  FileText,
  MapPin,
  Zap,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';

interface OptimizerRecommendation {
  id: string;
  actionable_win: string;
  opportunity: string;
  score: number;
  explanation: string;
  category: 'seo' | 'aeo' | 'geo' | 'ai_visibility' | 'content' | 'technical' | 'local';
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort_level: 'low' | 'medium' | 'high';
  impact_level: 'low' | 'medium' | 'high';
  estimated_time: string;
  required_skills: string[];
  tools_needed: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

interface OptimizerMetrics {
  total_recommendations: number;
  high_priority_count: number;
  completed_count: number;
  average_score: number;
  category_distribution: Record<string, number>;
  effort_distribution: Record<string, number>;
  impact_distribution: Record<string, number>;
}

export default function OptimizerDashboard() {
  const [recommendations, setRecommendations] = useState<OptimizerRecommendation[]>([]);
  const [metrics, setMetrics] = useState<OptimizerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    fetchOptimizerData();
  }, []);

  const fetchOptimizerData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const [recommendationsData, metricsData] = await Promise.all([
      //   api.optimizer.getRecommendations.query({ limit: 20 }),
      //   api.optimizer.getOptimizerMetrics.query()
      // ]);
      
      // Mock data for demonstration
      const mockRecommendations: OptimizerRecommendation[] = [
        {
          id: 'opt_1',
          actionable_win: "Implement comprehensive structured data markup",
          opportunity: "Add JSON-LD structured data for LocalBusiness, AutoDealer, and Service schemas to improve search engine understanding and local pack visibility",
          score: 95,
          explanation: "Structured data helps search engines understand your business type, services, and location, leading to better local search visibility and rich snippets in search results.",
          category: 'seo',
          priority: 'high',
          effort_level: 'medium',
          impact_level: 'high',
          estimated_time: "4-6 hours",
          required_skills: ['HTML', 'JSON-LD', 'Schema.org'],
          tools_needed: ['Google Rich Results Test', 'Schema Markup Validator'],
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'opt_2',
          actionable_win: "Optimize content for featured snippets and zero-click results",
          opportunity: "Create FAQ pages, how-to guides, and structured content that answers common automotive questions to capture featured snippet positions",
          score: 90,
          explanation: "Featured snippets and zero-click results are increasingly important as users get answers directly in search results. Optimizing for these positions can significantly increase visibility.",
          category: 'aeo',
          priority: 'high',
          effort_level: 'high',
          impact_level: 'high',
          estimated_time: "1-2 weeks",
          required_skills: ['Content Writing', 'SEO', 'Research'],
          tools_needed: ['Answer The Public', 'SEMrush', 'Ahrefs'],
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'opt_3',
          actionable_win: "Enhance AI assistant visibility through content optimization",
          opportunity: "Create comprehensive, authoritative content about automotive services and local market information that AI assistants can reference and cite",
          score: 85,
          explanation: "AI assistants like ChatGPT and Claude increasingly influence consumer decisions. By creating authoritative, well-structured content, you can improve your visibility in AI-generated responses.",
          category: 'ai_visibility',
          priority: 'critical',
          effort_level: 'high',
          impact_level: 'high',
          estimated_time: "2-3 weeks",
          required_skills: ['Content Strategy', 'AI Optimization', 'Local SEO'],
          tools_needed: ['ChatGPT', 'Claude', 'Content Analysis Tools'],
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockMetrics: OptimizerMetrics = {
        total_recommendations: 12,
        high_priority_count: 8,
        completed_count: 3,
        average_score: 87.5,
        category_distribution: {
          seo: 3,
          aeo: 2,
          ai_visibility: 2,
          content: 2,
          technical: 2,
          local: 1,
        },
        effort_distribution: {
          low: 2,
          medium: 5,
          high: 5,
        },
        impact_distribution: {
          low: 1,
          medium: 3,
          high: 8,
        },
      };

      setRecommendations(mockRecommendations);
      setMetrics(mockMetrics);
    } catch (err) {
      setError('Failed to load optimizer data');
      console.error('Error fetching optimizer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateOptimizations = async () => {
    if (!selectedDomain) {
      setError('Please enter a domain to analyze');
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const result = await api.optimizer.generateOptimizations.mutate({
      //   domain: selectedDomain,
      // });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchOptimizerData();
    } catch (err) {
      setError('Failed to generate optimizations');
      console.error('Error generating optimizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendationStatus = async (id: string, status: string) => {
    try {
      // TODO: Replace with actual API call
      // await api.optimizer.updateRecommendationStatus.mutate({
      //   recommendation_id: id,
      //   status: status as any,
      // });
      
      // Update local state
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id 
            ? { ...rec, status: status as any, updated_at: new Date() }
            : rec
        )
      );
    } catch (err) {
      console.error('Error updating recommendation status:', err);
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seo': return <TrendingUp className="h-4 w-4" />;
      case 'aeo': return <FileText className="h-4 w-4" />;
      case 'ai_visibility': return <Zap className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      case 'technical': return <Wrench className="h-4 w-4" />;
      case 'local': return <MapPin className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Optimizer Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered recommendations to improve your dealership's digital visibility
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Enter domain to analyze..."
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={generateOptimizations} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Optimizations'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_recommendations}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.completed_count} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.high_priority_count}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.average_score}</div>
              <p className="text-xs text-muted-foreground">
                Potential improvement score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((metrics.completed_count / metrics.total_recommendations) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Recommendations implemented
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="aeo">AEO</TabsTrigger>
              <TabsTrigger value="ai_visibility">AI Visibility</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="local">Local</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(recommendation.status)}
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(recommendation.category)}
                        <span className="text-sm font-medium capitalize">
                          {recommendation.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityBadgeVariant(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                      <Badge variant="outline">
                        Score: {recommendation.score}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-blue-600">
                      {recommendation.actionable_win}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground">
                      <strong>Opportunity:</strong> {recommendation.opportunity}
                    </p>
                    
                    <p className="text-sm">
                      <strong>Explanation:</strong> {recommendation.explanation}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Effort Level:</strong> 
                        <Badge variant="outline" className="ml-2">
                          {recommendation.effort_level}
                        </Badge>
                      </div>
                      <div>
                        <strong>Impact Level:</strong> 
                        <Badge variant="outline" className="ml-2">
                          {recommendation.impact_level}
                        </Badge>
                      </div>
                      <div>
                        <strong>Estimated Time:</strong> 
                        <span className="ml-2">{recommendation.estimated_time}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Required Skills:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recommendation.required_skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong>Tools Needed:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recommendation.tools_needed.map((tool, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Created {recommendation.created_at.toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      {recommendation.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateRecommendationStatus(recommendation.id, 'in_progress')}
                          >
                            Start
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateRecommendationStatus(recommendation.id, 'completed')}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      {recommendation.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateRecommendationStatus(recommendation.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
