/**
 * Enhanced Dashboard
 * Bloomberg terminal-style dashboard with AI-powered insights
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Brain, 
  Target, 
  Star,
  MessageSquare,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Eye,
  MousePointer,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';

interface ReputationReview {
  id: string;
  platform: string;
  rating: number;
  comment: string;
  date: string;
  author: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  autoReply?: string;
}

interface PredictiveInsight {
  metric: string;
  current: number;
  forecast: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
  recommendation: string;
}

interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  impact: {
    traffic: number;
    leads: number;
    revenue: number;
  };
  cost: number;
  timeline: string;
}

export default function EnhancedDashboard() {
  const [reviews, setReviews] = useState<ReputationReview[]>([
    {
      id: '1',
      platform: 'Google',
      rating: 2,
      comment: 'Terrible service, waited 3 hours for a simple oil change!',
      date: '2024-01-15',
      author: 'John D.',
      sentiment: 'negative',
    },
    {
      id: '2',
      platform: 'Yelp',
      rating: 5,
      comment: 'Amazing experience! The team was professional and helpful.',
      date: '2024-01-14',
      author: 'Sarah M.',
      sentiment: 'positive',
    },
    {
      id: '3',
      platform: 'Facebook',
      rating: 1,
      comment: 'Worst dealership ever. Stay away!',
      date: '2024-01-13',
      author: 'Mike R.',
      sentiment: 'negative',
    },
  ]);

  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([
    {
      metric: 'SEO Visibility',
      current: 75,
      forecast: 95,
      trend: 'up',
      confidence: 87,
      timeframe: '30 days',
      recommendation: 'Deploy FAQ schema markup to boost visibility by 20 points',
    },
    {
      metric: 'Local Search Ranking',
      current: 3.2,
      forecast: 1.8,
      trend: 'up',
      confidence: 92,
      timeframe: '14 days',
      recommendation: 'Optimize Google Business Profile with new photos and posts',
    },
    {
      metric: 'Review Response Rate',
      current: 45,
      forecast: 78,
      trend: 'up',
      confidence: 95,
      timeframe: '7 days',
      recommendation: 'Enable auto-reply for reviews below 3 stars',
    },
  ]);

  const [whatIfScenarios, setWhatIfScenarios] = useState<WhatIfScenario[]>([
    {
      id: '1',
      name: 'FAQ Schema Deployment',
      description: 'Add structured data to answer common questions',
      impact: { traffic: 25, leads: 15, revenue: 12000 },
      cost: 500,
      timeline: '1 week',
    },
    {
      id: '2',
      name: 'PPC Campaign Launch',
      description: 'Target high-intent keywords for service appointments',
      impact: { traffic: 40, leads: 30, revenue: 25000 },
      cost: 2000,
      timeline: '2 weeks',
    },
    {
      id: '3',
      name: 'Video Testimonials',
      description: 'Create customer success stories for social proof',
      impact: { traffic: 15, leads: 20, revenue: 8000 },
      cost: 1500,
      timeline: '3 weeks',
    },
  ]);

  const [selectedTone, setSelectedTone] = useState<'witty' | 'professional' | 'friendly'>('witty');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyThreshold, setAutoReplyThreshold] = useState([3]);

  const generateWittyResponse = (review: ReputationReview) => {
    const responses = {
      witty: [
        "Well, that's not the review we were hoping for! 😅 Let's turn this frown upside down together.",
        "Ouch! That stings more than a bee in a convertible. Let's make this right!",
        "Houston, we have a problem! 🚀 But don't worry, we've got the best engineers on it.",
        "That's a plot twist we didn't see coming! Let's rewrite this story with a happy ending.",
      ],
      professional: [
        "Thank you for your feedback. We appreciate your business and will work to improve our service.",
        "We sincerely apologize for the inconvenience. Please contact us directly to resolve this matter.",
        "Your experience is important to us. We'd like to make this right and earn back your trust.",
      ],
      friendly: [
        "Thanks so much for taking the time to share your experience! We'd love to make things right.",
        "Oh no! That's definitely not the experience we want you to have. Let's chat and fix this!",
        "We're really sorry to hear about this! Can we get in touch to make it better?",
      ],
    };

    const toneResponses = responses[selectedTone];
    return toneResponses[Math.floor(Math.random() * toneResponses.length)];
  };

  const handleEngageLudicrousMode = (review: ReputationReview) => {
    const response = generateWittyResponse(review);
    setReviews(prev => prev.map(r => 
      r.id === review.id ? { ...r, autoReply: response } : r
    ));
    toast.success('Ludicrous mode engaged!', {
      description: 'AI response generated and ready to deploy.',
    });
  };

  const handleDeployResponse = (review: ReputationReview) => {
    toast.success('Response deployed!', {
      description: `Reply sent to ${review.platform} review.`,
    });
  };

  const handleRunScenario = (scenario: WhatIfScenario) => {
    toast.success('Scenario activated!', {
      description: `${scenario.name} is now running. Expected impact: +${scenario.impact.traffic}% traffic, +${scenario.impact.leads}% leads.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AIV Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.2</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visibility Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Low</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24.5K</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reputation">Reputation Engine</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="whatif">What-If Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Predictive Insights</span>
              </CardTitle>
              <CardDescription>
                AI-powered forecasts and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {predictiveInsights.map((insight) => (
                  <Card key={insight.metric} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.metric}</h4>
                      <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                        {insight.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {insight.trend}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: {insight.current}</span>
                        <span>Forecast: {insight.forecast}</span>
                      </div>
                      <Progress value={insight.confidence} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {insight.recommendation}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                One-click solutions for common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Target className="h-6 w-6" />
                  <span>Fix SEO Issues</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Zap className="h-6 w-6" />
                  <span>Deploy Schema</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Respond to Reviews</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Generate Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reputation" className="space-y-4">
          {/* Reputation Engine Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Auto-Reply Engine Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoReply"
                    checked={autoReplyEnabled}
                    onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="autoReply">Enable auto-reply</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Threshold:</span>
                  <Slider
                    value={autoReplyThreshold}
                    onValueChange={setAutoReplyThreshold}
                    max={5}
                    min={1}
                    step={1}
                    className="w-20"
                  />
                  <span className="text-sm">{autoReplyThreshold[0]} stars</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm">Response tone:</span>
                <Select value={selectedTone} onValueChange={(value: any) => setSelectedTone(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="witty">Witty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Manage your online reputation with AI-powered responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{review.platform}</Badge>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-sm mb-2">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">by {review.author}</p>
                        {review.autoReply && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium mb-1">AI Response:</p>
                            <p className="text-sm">{review.autoReply}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        {review.sentiment === 'negative' && !review.autoReply && (
                          <Button
                            size="sm"
                            onClick={() => handleEngageLudicrousMode(review)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Engage Ludicrous Mode
                          </Button>
                        )}
                        {review.autoReply && (
                          <Button
                            size="sm"
                            onClick={() => handleDeployResponse(review)}
                            variant="outline"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Deploy Response
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI-Powered Insights</span>
              </CardTitle>
              <CardDescription>
                Advanced analytics and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SEO Visibility</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-20 h-2" />
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Local Search</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={68} className="w-20 h-2" />
                        <span className="text-sm font-medium">68%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Social Presence</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={82} className="w-20 h-2" />
                        <span className="text-sm font-medium">82%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Forecast</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        You'll hit 95 visibility by Dec 15 if you deploy FAQ schema now
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        Local ranking will improve by 1.4 positions in 14 days
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">
                        Revenue impact: +$12K with current optimization trajectory
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatif" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>What-If Simulator</span>
              </CardTitle>
              <CardDescription>
                Test strategic scenarios and see projected impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {whatIfScenarios.map((scenario) => (
                  <Card key={scenario.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Traffic Impact:</span>
                          <span className="text-green-600">+{scenario.impact.traffic}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Leads Impact:</span>
                          <span className="text-green-600">+{scenario.impact.leads}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Revenue Impact:</span>
                          <span className="text-green-600">+${scenario.impact.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Cost:</span>
                          <span>${scenario.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Timeline:</span>
                          <span>{scenario.timeline}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRunScenario(scenario)}
                        className="w-full"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Scenario
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
