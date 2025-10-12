'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Progress } from '@/src/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { 
  Brain, 
  Target, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Settings,
  RefreshCw,
  Zap,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';

interface QAIMetrics {
  qaiScore: number;
  vaiScore: number;
  piqrScore: number;
  hrpScore: number;
  ociValue: number;
  authorityVelocity: number;
  competitivePosition: 'dominant' | 'competitive' | 'behind';
}

interface QAIASR {
  summaryHeader: string;
  targetVDPVIN: string;
  currentVCOProbability: number;
  prescribedAction: {
    actionType: string;
    vcoFeatureImpact: string;
    estimatedNetProfitGain: number;
    justification: string;
    requiredProtocol: string;
    qaiImprovement: number;
    aemdImpact: string;
  };
  actionDataContext: {
    vcoClusterId: string;
    highestRiskFactor: string;
    requiredContentProtocol: string;
  };
  qaiIntegration: {
    currentQAIScore: number;
    expectedQaiImprovement: number;
    aemdImpact: string;
  };
}

export default function QAIDashboard() {
  const [metrics, setMetrics] = useState<QAIMetrics | null>(null);
  const [asr, setAsr] = useState<QAIASR | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  useEffect(() => {
    const mockMetrics: QAIMetrics = {
      qaiScore: 67.3,
      vaiScore: 0.78,
      piqrScore: 1.12,
      hrpScore: 0.18,
      ociValue: 1250.50,
      authorityVelocity: 5.2,
      competitivePosition: 'competitive'
    };

    const mockASR: QAIASR = {
      summaryHeader: 'Autonomous Strategy Recommendation for Dealer #ABC Honda - Segment: QAI Segment 1',
      targetVDPVIN: '1HGBH41JXMN109186',
      currentVCOProbability: 75.5,
      prescribedAction: {
        actionType: 'Add Odometer Photo',
        vcoFeatureImpact: '+15.00 SHAP Points',
        estimatedNetProfitGain: 595.00,
        justification: 'Model identified \'Add Odometer Photo\' as the highest ROI fix, directly addressing a critical feature gap.',
        requiredProtocol: 'VDP-TOP Compliant Text Generation is MANDATORY for this update.',
        qaiImprovement: 1.5,
        aemdImpact: 'Will improve Featured Snippet capture and AI Overview citations'
      },
      actionDataContext: {
        vcoClusterId: 'QAI_CID_1',
        highestRiskFactor: 'Missing Odometer Photo/Deceptive Pricing',
        requiredContentProtocol: 'VDP-TOP Compliant Text Generation is MANDATORY for this update.'
      },
      qaiIntegration: {
        currentQAIScore: 67.3,
        expectedQaiImprovement: 1.5,
        aemdImpact: 'Will improve Featured Snippet capture and AI Overview citations'
      }
    };

    setMetrics(mockMetrics);
    setAsr(mockASR);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading QAI metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QAI Dashboard</h1>
          <p className="text-muted-foreground">
            Quantum Authority Index (QAI*) - Complete AI Visibility Optimization
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
            <CardTitle className="text-sm font-medium">QAI* Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.qaiScore.toFixed(1)}</div>
            <Progress value={metrics?.qaiScore} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Quantum Authority Index
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAI Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics?.vaiScore * 100).toFixed(1)}%</div>
            <Progress value={metrics?.vaiScore * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Risk-Adjusted Visibility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PIQR Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.piqrScore.toFixed(2)}</div>
            <Progress value={Math.min(metrics?.piqrScore * 50, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Proactive Inventory Quality Radar
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
              vs. Market Competitors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>PIQR Analysis</span>
            </CardTitle>
            <CardDescription>
              Proactive Inventory Quality Radar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Score</span>
                <Badge variant={metrics?.piqrScore <= 1.2 ? 'default' : 'destructive'}>
                  {metrics?.piqrScore.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Target (Ideal)</span>
                <Badge variant="outline">1.00</Badge>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {metrics?.piqrScore > 1.2 
                    ? 'PIQR score indicates quality issues that need attention'
                    : 'PIQR score is within acceptable range'
                  }
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>HRP Analysis</span>
            </CardTitle>
            <CardDescription>
              Hallucination Risk Penalty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Score</span>
                <Badge variant={metrics?.hrpScore <= 0.3 ? 'default' : 'destructive'}>
                  {metrics?.hrpScore.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Target (Ideal)</span>
                <Badge variant="outline">0.00</Badge>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {metrics?.hrpScore > 0.3 
                    ? 'High hallucination risk detected - improve content verifiability'
                    : 'HRP score is within acceptable range'
                  }
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>OCI Analysis</span>
            </CardTitle>
            <CardDescription>
              Opportunity Cost Index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Value</span>
                <Badge variant={metrics?.ociValue > 1000 ? 'destructive' : 'default'}>
                  ${metrics?.ociValue.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Velocity</span>
                <Badge variant="outline">
                  {metrics?.authorityVelocity.toFixed(1)}%
                </Badge>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {metrics?.ociValue > 1000 
                    ? 'High opportunity cost - prioritize optimization'
                    : 'Opportunity cost is manageable'
                  }
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="asr">ASR Recommendations</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QAI* Performance Overview</CardTitle>
              <CardDescription>
                Comprehensive analysis of Quantum Authority Index metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">QAI* Score</h4>
                    <div className="text-3xl font-bold text-blue-600">{metrics?.qaiScore.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground">Overall Performance</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">VAI Score</h4>
                    <div className="text-3xl font-bold text-green-600">{(metrics?.vaiScore * 100).toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Visibility AI</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Risk Score</h4>
                    <div className="text-3xl font-bold text-orange-600">
                      {((metrics?.piqrScore - 1) * 50 + (metrics?.hrpScore * 50)).toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">Combined Risk</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Opportunity</h4>
                    <div className="text-3xl font-bold text-purple-600">${metrics?.ociValue.toFixed(0)}</div>
                    <p className="text-sm text-muted-foreground">Cost Index</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Performance Analysis:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">QAI* Score Status</span>
                      <Badge variant={metrics?.qaiScore >= 70 ? 'default' : metrics?.qaiScore >= 50 ? 'secondary' : 'destructive'}>
                        {metrics?.qaiScore >= 70 ? 'Excellent' : metrics?.qaiScore >= 50 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Risk Level</span>
                      <Badge variant={metrics?.piqrScore <= 1.2 && metrics?.hrpScore <= 0.3 ? 'default' : 'destructive'}>
                        {metrics?.piqrScore <= 1.2 && metrics?.hrpScore <= 0.3 ? 'Low Risk' : 'High Risk'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Optimization Priority</span>
                      <Badge variant={metrics?.ociValue > 1000 ? 'destructive' : 'default'}>
                        {metrics?.ociValue > 1000 ? 'High Priority' : 'Standard Priority'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autonomous Strategy Recommendation (ASR)</CardTitle>
              <CardDescription>
                AI-generated recommendations for optimizing QAI* performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {asr && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{asr.summaryHeader}</h4>
                        <p className="text-sm text-muted-foreground">Target VDP: {asr.targetVDPVIN}</p>
                      </div>
                      <Badge variant="outline">VCO: {asr.currentVCOProbability}%</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium mb-2">Prescribed Action</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{asr.prescribedAction.actionType}</span>
                            <Badge variant="default">{asr.prescribedAction.vcoFeatureImpact}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {asr.prescribedAction.justification}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Estimated Net Profit Gain:</span>
                            <span className="font-medium text-green-600">
                              ${asr.prescribedAction.estimatedNetProfitGain.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium">Action Context:</h5>
                        <div className="text-sm space-y-1">
                          <p><strong>VCO Cluster ID:</strong> {asr.actionDataContext.vcoClusterId}</p>
                          <p><strong>Highest Risk Factor:</strong> {asr.actionDataContext.highestRiskFactor}</p>
                          <p><strong>Required Protocol:</strong> {asr.actionDataContext.requiredContentProtocol}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium">QAI Integration:</h5>
                        <div className="text-sm space-y-1">
                          <p><strong>Current QAI Score:</strong> {asr.qaiIntegration.currentQAIScore}</p>
                          <p><strong>Expected Improvement:</strong> +{asr.qaiIntegration.expectedQaiImprovement} points</p>
                          <p><strong>AEMD Impact:</strong> {asr.qaiIntegration.aemdImpact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QAI* Optimization Strategies</CardTitle>
              <CardDescription>
                Detailed strategies for improving each QAI component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* PIQR Optimization */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium">PIQR Optimization</h3>
                    <Badge variant="outline">Current: {metrics?.piqrScore.toFixed(2)}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Immediate Actions:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Ensure minimum 12 high-quality photos per VDP</li>
                        <li>• Remove deceptive pricing language</li>
                        <li>• Improve content uniqueness (reduce duplication)</li>
                        <li>• Enhance trust signals and credibility</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Expected Results:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• PIQR score improvement to 1.0-1.2 range</li>
                        <li>• Better compliance with quality standards</li>
                        <li>• Reduced risk penalties</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* HRP Optimization */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-medium">HRP Optimization</h3>
                    <Badge variant="outline">Current: {metrics?.hrpScore.toFixed(2)}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Immediate Actions:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Add verifiable dealer facts and statistics</li>
                        <li>• Include Master Technician quotes</li>
                        <li>• Reference specific service capabilities</li>
                        <li>• Add local market data and citations</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Expected Results:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• HRP score reduction to 0.0-0.3 range</li>
                        <li>• Higher content verifiability</li>
                        <li>• Better AI trust signals</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* VAI Optimization */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-medium">VAI Optimization</h3>
                    <Badge variant="outline">Current: {(metrics?.vaiScore * 100).toFixed(1)}%</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Immediate Actions:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Optimize for Featured Snippets (40-60 word answers)</li>
                        <li>• Improve AI Overview citation potential</li>
                        <li>• Enhance PAA Box ownership</li>
                        <li>• Implement VDP-TOP protocol</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Expected Results:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• VAI score improvement to 80%+</li>
                        <li>• Better AI platform visibility</li>
                        <li>• Higher conversion rates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VDP-TOP + AEMD + QAI Integration</CardTitle>
              <CardDescription>
                How QAI* integrates with VDP-TOP and AEMD systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">VDP-TOP Protocol</h4>
                    <div className="text-2xl font-bold text-blue-600">70%</div>
                    <p className="text-sm text-muted-foreground">QAI* Contribution</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">AEMD Scoring</h4>
                    <div className="text-2xl font-bold text-green-600">30%</div>
                    <p className="text-sm text-muted-foreground">QAI* Contribution</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">SEO Score</h4>
                    <div className="text-2xl font-bold text-purple-600">80%</div>
                    <p className="text-sm text-muted-foreground">Baseline Score</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Integration Benefits:</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Unified Scoring:</strong> Single QAI* score combines VDP-TOP, AEMD, and SEO metrics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Risk Adjustment:</strong> PIQR and HRP penalties ensure quality compliance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Prescriptive Actions:</strong> ASR provides specific, actionable recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Financial Impact:</strong> OCI quantifies opportunity cost of suboptimal performance</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Next Steps:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Implement ASR recommendations for immediate impact</li>
                    <li>Monitor QAI* score improvements weekly</li>
                    <li>Track VCO probability changes</li>
                    <li>Update AEMD metrics monthly</li>
                    <li>Optimize based on competitive position</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
