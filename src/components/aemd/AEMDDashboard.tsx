'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Progress } from '@/src/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { 
  TrendingUp, 
  Target, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Settings,
  RefreshCw,
  Brain,
  Search,
  MessageSquare,
  Zap
} from 'lucide-react';

interface AEMDMetrics {
  aemdScore: number;
  vaiScore: number;
  integratedScore: number;
  competitivePosition: 'dominant' | 'competitive' | 'behind';
  contentQuality: 'excellent' | 'good' | 'needs_improvement';
  optimizationPotential: 'high' | 'medium' | 'low';
}

interface AEMDComponentScores {
  fsCaptureShare: number;
  aioCitationShare: number;
  paaBoxOwnership: number;
  eEATTrustAlpha: number;
}

interface PrescriptiveAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string[];
  expectedImpact: string;
  timeframe: string;
}

export default function AEMDDashboard() {
  const [metrics, setMetrics] = useState<AEMDMetrics | null>(null);
  const [componentScores, setComponentScores] = useState<AEMDComponentScores | null>(null);
  const [prescriptiveActions, setPrescriptiveActions] = useState<PrescriptiveAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  useEffect(() => {
    const mockMetrics: AEMDMetrics = {
      aemdScore: 67.3,
      vaiScore: 78.5,
      integratedScore: 72.4,
      competitivePosition: 'competitive',
      contentQuality: 'good',
      optimizationPotential: 'medium'
    };

    const mockComponentScores: AEMDComponentScores = {
      fsCaptureShare: 0.35,
      aioCitationShare: 0.45,
      paaBoxOwnership: 1.8,
      eEATTrustAlpha: 0.85
    };

    const mockActions: PrescriptiveAction[] = [
      {
        action: 'AEO TACTICAL SHIFT',
        priority: 'high',
        description: 'Implement 40-60 word Direct Answer Protocol and List/Table Schema',
        implementation: [
          'Implement 40-60 word Direct Answer Protocol on top 10 informational pages',
          'Mandate List/Table Schema implementation for Featured Snippets',
          'Optimize AEO Snippet Blocks in VDP-TOP protocol',
          'Create FAQ sections with structured answers'
        ],
        expectedImpact: 'Increase Featured Snippet capture rate by 25-40%',
        timeframe: '2-4 weeks'
      },
      {
        action: 'GEO/E-E-A-T INTERVENTION',
        priority: 'medium',
        description: 'Enhance content with Master Technician quotes and statistical citations',
        implementation: [
          'Feature Master Technician or Finance Director quotes in all content',
          'Add inline statistical citations about local market conditions',
          'Boost α_Ex (Expertise) signals with industry-specific data',
          'Include dealer-specific performance metrics and certifications'
        ],
        expectedImpact: 'Increase AI Overview citation share by 30-50%',
        timeframe: '3-6 weeks'
      },
      {
        action: 'TOPICAL DEPTH FIX',
        priority: 'low',
        description: 'Add FAQ/Q&A Schema Blocks to capture PAA features',
        implementation: [
          'Review top 5 highest-traffic pages for PAA opportunities',
          'Add dedicated FAQ/Q&A Schema Block with minimum 5 questions each',
          'Create comprehensive question-answer pairs for each vehicle segment'
        ],
        expectedImpact: 'Increase PAA Box ownership by 40-60%',
        timeframe: '4-8 weeks'
      }
    ];

    setMetrics(mockMetrics);
    setComponentScores(mockComponentScores);
    setPrescriptiveActions(mockActions);
    setLoading(false);
  }, []);

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'dominant': return 'bg-green-100 text-green-800';
      case 'competitive': return 'bg-yellow-100 text-yellow-800';
      case 'behind': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'dominant': return <CheckCircle className="h-4 w-4" />;
      case 'competitive': return <Target className="h-4 w-4" />;
      case 'behind': return <AlertTriangle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading AEMD metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AEMD Dashboard</h1>
          <p className="text-muted-foreground">
            Answer Engine Market Dominance Optimizer
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AEMD Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.aemdScore.toFixed(1)}</div>
            <Progress value={metrics?.aemdScore} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Answer Engine Market Dominance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAI Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.vaiScore.toFixed(1)}</div>
            <Progress value={metrics?.vaiScore} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Unified AI Visibility Score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrated Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.integratedScore.toFixed(1)}</div>
            <Progress value={metrics?.integratedScore} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Combined Optimization Score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitive Position</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getPositionIcon(metrics?.competitivePosition || 'competitive')}
              <Badge className={getPositionColor(metrics?.competitivePosition || 'competitive')}>
                {metrics?.competitivePosition?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs. Local Competitors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Component Performance */}
      <Card>
        <CardHeader>
          <CardTitle>AEMD Component Performance</CardTitle>
          <CardDescription>
            Detailed breakdown of AEO feature capture metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Featured Snippets</span>
              </div>
              <div className="text-2xl font-bold">{(componentScores?.fsCaptureShare || 0) * 100}%</div>
              <Progress value={(componentScores?.fsCaptureShare || 0) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Capture Share</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">AI Overviews</span>
              </div>
              <div className="text-2xl font-bold">{(componentScores?.aioCitationShare || 0) * 100}%</div>
              <Progress value={(componentScores?.aioCitationShare || 0) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Citation Share</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">PAA Boxes</span>
              </div>
              <div className="text-2xl font-bold">{componentScores?.paaBoxOwnership || 0}</div>
              <Progress value={((componentScores?.paaBoxOwnership || 0) / 3) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Ownership Index</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">E-E-A-T Trust</span>
              </div>
              <div className="text-2xl font-bold">{(componentScores?.eEATTrustAlpha || 0) * 100}%</div>
              <Progress value={(componentScores?.eEATTrustAlpha || 0) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">Trust Alpha</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="actions">Prescriptive Actions</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  AEMD score progression over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current AEMD Score</span>
                    <Badge variant="outline">{metrics?.aemdScore.toFixed(1)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Target Score</span>
                    <Badge variant="outline">75.0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gap to Target</span>
                    <Badge variant={metrics && metrics.aemdScore < 75 ? 'destructive' : 'default'}>
                      {metrics ? (75 - metrics.aemdScore).toFixed(1) : '0.0'}
                    </Badge>
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {metrics && metrics.aemdScore < 75 
                        ? `${(75 - metrics.aemdScore).toFixed(1)} points needed to reach target`
                        : 'Target score achieved!'
                      }
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Optimization Potential */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Potential</CardTitle>
                <CardDescription>
                  Content quality and improvement opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Quality</span>
                    <Badge className={
                      metrics?.contentQuality === 'excellent' ? 'bg-green-100 text-green-800' :
                      metrics?.contentQuality === 'good' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {metrics?.contentQuality?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Optimization Potential</span>
                    <Badge className={
                      metrics?.optimizationPotential === 'high' ? 'bg-red-100 text-red-800' :
                      metrics?.optimizationPotential === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {metrics?.optimizationPotential?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Key Opportunities:</span>
                    <ul className="text-sm space-y-1">
                      <li>• Featured Snippet optimization</li>
                      <li>• AI Overview citation enhancement</li>
                      <li>• PAA Box content expansion</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptive Actions</CardTitle>
              <CardDescription>
                AI-generated recommendations for improving AEMD performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptiveActions.map((action, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority.toUpperCase()}
                        </Badge>
                        <h4 className="font-medium">{action.action}</h4>
                      </div>
                      <Badge variant="outline">{action.timeframe}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </p>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Implementation Steps:</h5>
                      <ul className="text-sm space-y-1">
                        {action.implementation.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Expected Impact:</strong> {action.expectedImpact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Strategies</CardTitle>
              <CardDescription>
                Detailed strategies for improving each AEMD component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Featured Snippets Strategy */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium">Featured Snippets Optimization</h3>
                    <Badge variant="outline">Current: {(componentScores?.fsCaptureShare || 0) * 100}%</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Immediate Actions:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Implement 40-60 word Direct Answer Protocol</li>
                        <li>• Add List/Table Schema markup</li>
                        <li>• Optimize AEO Snippet Blocks</li>
                        <li>• Create FAQ sections with structured answers</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Expected Results:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 25-40% increase in FS capture rate</li>
                        <li>• Better visibility for informational queries</li>
                        <li>• Improved click-through rates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* AI Overviews Strategy */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-medium">AI Overviews Optimization</h3>
                    <Badge variant="outline">Current: {(componentScores?.aioCitationShare || 0) * 100}%</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Immediate Actions:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Feature Master Technician quotes</li>
                        <li>• Add statistical citations</li>
                        <li>• Include dealer-specific metrics</li>
                        <li>• Reference local market data</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Expected Results:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 30-50% increase in AIO citations</li>
                        <li>• Higher E-E-A-T trust signals</li>
                        <li>• Better AI platform recognition</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* PAA Boxes Strategy */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-medium">PAA Boxes Optimization</h3>
                    <Badge variant="outline">Current: {componentScores?.paaBoxOwnership || 0}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Immediate Actions:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Add FAQ/Q&A Schema Blocks</li>
                        <li>• Create question-answer pairs</li>
                        <li>• Review high-traffic pages</li>
                        <li>• Develop question clusters</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Expected Results:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 40-60% increase in PAA ownership</li>
                        <li>• Better topical depth coverage</li>
                        <li>• Enhanced user engagement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
              <CardDescription>
                Market position and competitor benchmarking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Your AEMD Score</h4>
                    <div className="text-3xl font-bold text-blue-600">{metrics?.aemdScore.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground">Current Performance</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Competitor Average</h4>
                    <div className="text-3xl font-bold text-orange-600">72.5</div>
                    <p className="text-sm text-muted-foreground">Market Benchmark</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Gap</h4>
                    <div className={`text-3xl font-bold ${(metrics?.aemdScore || 0) < 72.5 ? 'text-red-600' : 'text-green-600'}`}>
                      {((metrics?.aemdScore || 0) - 72.5).toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">vs. Competitors</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Competitive Position Analysis:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Featured Snippets</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">You: {(componentScores?.fsCaptureShare || 0) * 100}%</span>
                        <span className="text-sm text-muted-foreground">vs.</span>
                        <span className="text-sm">Competitors: 42%</span>
                        <Badge variant={((componentScores?.fsCaptureShare || 0) * 100) < 42 ? 'destructive' : 'default'}>
                          {((componentScores?.fsCaptureShare || 0) * 100) < 42 ? 'Behind' : 'Ahead'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">AI Overviews</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">You: {(componentScores?.aioCitationShare || 0) * 100}%</span>
                        <span className="text-sm text-muted-foreground">vs.</span>
                        <span className="text-sm">Competitors: 38%</span>
                        <Badge variant={((componentScores?.aioCitationShare || 0) * 100) < 38 ? 'destructive' : 'default'}>
                          {((componentScores?.aioCitationShare || 0) * 100) < 38 ? 'Behind' : 'Ahead'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">PAA Boxes</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">You: {componentScores?.paaBoxOwnership || 0}</span>
                        <span className="text-sm text-muted-foreground">vs.</span>
                        <span className="text-sm">Competitors: 2.1</span>
                        <Badge variant={(componentScores?.paaBoxOwnership || 0) < 2.1 ? 'destructive' : 'default'}>
                          {(componentScores?.paaBoxOwnership || 0) < 2.1 ? 'Behind' : 'Ahead'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
