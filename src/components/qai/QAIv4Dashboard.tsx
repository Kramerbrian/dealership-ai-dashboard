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
  Activity,
  Gauge,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface QAIv4Metrics {
  qaiStarScore: number;
  authorityVelocity: number;
  ociValue: number;
  piqrScore: number;
  vaiScore: number;
  hrpScore: number;
  aemdScore: number;
  competitivePosition: 'dominant' | 'competitive' | 'behind';
  lastUpdated: string;
}

interface ASRAction {
  id: string;
  actionType: string;
  priority: 'high' | 'medium' | 'low';
  vcoImpact: number;
  estimatedGain: number;
  cost: number;
  roi: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  targetVDP: string;
  clusterId: string;
  requiredProtocol: string;
}

interface SegmentData {
  id: string;
  name: string;
  qaiScore: number;
  velocity: number;
  riskLevel: 'low' | 'medium' | 'high';
  vdpCount: number;
  conversionRate: number;
  lastTraining: string;
}

export default function QAIv4Dashboard() {
  const [metrics, setMetrics] = useState<QAIv4Metrics | null>(null);
  const [asrQueue, setAsrQueue] = useState<ASRAction[]>([]);
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('executive');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // Apple Park White Mode styling
  const appleParkTheme = {
    background: 'bg-white',
    card: 'bg-white border border-gray-100',
    shadow: 'shadow-[0px_2px_24px_rgba(0,0,0,0.05)]',
    radius: 'rounded-[20px]',
    accent: '#007AFF',
    text: 'text-gray-900',
    muted: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-orange-500',
    danger: 'text-red-500'
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockMetrics: QAIv4Metrics = {
      qaiStarScore: 78.5,
      authorityVelocity: 12.3,
      ociValue: 2847.50,
      piqrScore: 1.08,
      vaiScore: 0.82,
      hrpScore: 0.15,
      aemdScore: 67.2,
      competitivePosition: 'competitive',
      lastUpdated: new Date().toISOString()
    };

    const mockASRQueue: ASRAction[] = [
      {
        id: 'asr-001',
        actionType: 'Add Odometer Photo',
        priority: 'high',
        vcoImpact: 15.2,
        estimatedGain: 1250.00,
        cost: 5.00,
        roi: 24900,
        status: 'pending',
        targetVDP: '1HGBH41JXMN109186',
        clusterId: 'Cluster-1-Family',
        requiredProtocol: 'VDP-TOP Compliant'
      },
      {
        id: 'asr-002',
        actionType: 'Rewrite VDP Text (TOP)',
        priority: 'high',
        vcoImpact: 22.8,
        estimatedGain: 3420.00,
        cost: 150.00,
        roi: 2180,
        status: 'in_progress',
        targetVDP: '1HGBH41JXMN109187',
        clusterId: 'Cluster-2-Luxury',
        requiredProtocol: 'VDP-TOP Compliant'
      },
      {
        id: 'asr-003',
        actionType: 'Add Master Technician Quote',
        priority: 'medium',
        vcoImpact: 8.5,
        estimatedGain: 680.00,
        cost: 25.00,
        roi: 2620,
        status: 'pending',
        targetVDP: '1HGBH41JXMN109188',
        clusterId: 'Cluster-3-Value',
        requiredProtocol: 'E-E-A-T Compliant'
      }
    ];

    const mockSegments: SegmentData[] = [
      {
        id: 'segment-1',
        name: 'Family Vehicles',
        qaiScore: 82.3,
        velocity: 8.5,
        riskLevel: 'low',
        vdpCount: 1247,
        conversionRate: 12.3,
        lastTraining: '2024-01-15T10:30:00Z'
      },
      {
        id: 'segment-2',
        name: 'Luxury Vehicles',
        qaiScore: 91.7,
        velocity: 15.2,
        riskLevel: 'low',
        vdpCount: 892,
        conversionRate: 18.7,
        lastTraining: '2024-01-15T10:30:00Z'
      },
      {
        id: 'segment-3',
        name: 'Value Vehicles',
        qaiScore: 65.4,
        velocity: -2.1,
        riskLevel: 'high',
        vdpCount: 2103,
        conversionRate: 8.9,
        lastTraining: '2024-01-14T14:20:00Z'
      }
    ];

    setMetrics(mockMetrics);
    setAsrQueue(mockASRQueue);
    setSegments(mockSegments);
    setLoading(false);
  }, []);

  const getVelocityIcon = (velocity: number) => {
    if (velocity > 5) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (velocity < -5) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getVelocityColor = (velocity: number) => {
    if (velocity > 5) return 'text-green-600';
    if (velocity < -5) return 'text-red-500';
    return 'text-gray-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-orange-500 bg-orange-50';
      case 'high': return 'text-red-500 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-500 bg-orange-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-[#007AFF]" />
        <span className="ml-2 text-gray-600">Loading QAI* v4.0 Dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${appleParkTheme.background} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'SF Pro Display, system-ui, sans-serif' }}>
              QAI* v4.0 Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Quantum Authority Index - Apple Park White Mode
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="rounded-[20px] border-gray-200">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="rounded-[20px] text-white" style={{ backgroundColor: '#007AFF' }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Executive Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">QAI* Score</CardTitle>
                <Gauge className="h-5 w-5 text-[#007AFF]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{metrics?.qaiStarScore.toFixed(1)}</div>
              <div className="flex items-center space-x-2 mb-3">
                <Progress value={metrics?.qaiStarScore} className="h-2" />
                <span className="text-xs text-gray-500">Target: ≥86</span>
              </div>
              <div className="flex items-center space-x-2">
                {getVelocityIcon(metrics?.authorityVelocity || 0)}
                <span className={`text-sm font-medium ${getVelocityColor(metrics?.authorityVelocity || 0)}`}>
                  {metrics?.authorityVelocity > 0 ? '+' : ''}{metrics?.authorityVelocity.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Authority Velocity</CardTitle>
                <TrendingUp className="h-5 w-5 text-[#007AFF]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {metrics?.authorityVelocity > 0 ? '+' : ''}{metrics?.authorityVelocity.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mb-3">
                λ_A = (Current - LastWeek) / LastWeek
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Accelerating</span>
              </div>
            </CardContent>
          </Card>

          <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">OCI Value</CardTitle>
                <DollarSign className="h-5 w-5 text-[#007AFF]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">${metrics?.ociValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mb-3">
                Opportunity Cost of Inaction
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600 font-medium">High Impact</span>
              </div>
            </CardContent>
          </Card>

          <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">PIQR Score</CardTitle>
                <Shield className="h-5 w-5 text-[#007AFF]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{metrics?.piqrScore.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mb-3">
                Proactive Inventory Quality Radar
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Compliant</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius} p-1`}>
            <TabsTrigger value="executive" className="rounded-[16px]">Executive Scoreboard</TabsTrigger>
            <TabsTrigger value="asr" className="rounded-[16px]">Prescriptive Action Queue</TabsTrigger>
            <TabsTrigger value="heatmap" className="rounded-[16px]">Diagnostic Segment View</TabsTrigger>
            <TabsTrigger value="ml" className="rounded-[16px]">ML Engine Status</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Assessment */}
              <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-[#007AFF]" />
                    <span>Risk Assessment</span>
                  </CardTitle>
                  <CardDescription>
                    PIQR and HRP analysis across all segments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px]">
                      <div>
                        <h4 className="font-medium text-gray-900">PIQR Score</h4>
                        <p className="text-sm text-gray-600">Proactive Inventory Quality Radar</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{metrics?.piqrScore.toFixed(2)}</div>
                        <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px]">
                      <div>
                        <h4 className="font-medium text-gray-900">HRP Score</h4>
                        <p className="text-sm text-gray-600">Hallucination Risk Penalty</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{metrics?.hrpScore.toFixed(2)}</div>
                        <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px]">
                      <div>
                        <h4 className="font-medium text-gray-900">VAI Score</h4>
                        <p className="text-sm text-gray-600">Visibility AI Score</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{(metrics?.vaiScore * 100).toFixed(1)}%</div>
                        <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-[#007AFF]" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                  <CardDescription>
                    Key performance indicators and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">AEMD Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="text-lg font-bold text-gray-900">{metrics?.aemdScore.toFixed(1)}</div>
                        <Badge className="bg-green-100 text-green-800">Competitive</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Competitive Position</span>
                      <Badge className="bg-yellow-100 text-yellow-800 capitalize">
                        {metrics?.competitivePosition}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm text-gray-500">
                        {new Date(metrics?.lastUpdated || '').toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600 mb-2">Weekly Training Status</div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Model trained successfully</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="asr" className="space-y-6">
            <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-[#007AFF]" />
                  <span>Prescriptive Action Queue</span>
                </CardTitle>
                <CardDescription>
                  AI-generated recommendations with RPAS optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {asrQueue.map((action) => (
                    <div key={action.id} className={`p-4 border border-gray-100 rounded-[16px] ${appleParkTheme.shadow}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{action.actionType}</h4>
                            <Badge className={`${getPriorityColor(action.priority)} rounded-full`}>
                              {action.priority}
                            </Badge>
                            <Badge className={`${action.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                              action.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                              'bg-green-100 text-green-800'} rounded-full`}>
                              {action.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Target VDP: {action.targetVDP} | Cluster: {action.clusterId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Protocol: {action.requiredProtocol}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">${action.estimatedGain.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">ROI: {action.roi.toLocaleString()}%</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">VCO Impact:</span>
                          <span className="ml-1 font-medium text-gray-900">+{action.vcoImpact}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cost:</span>
                          <span className="ml-1 font-medium text-gray-900">${action.cost}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Net Gain:</span>
                          <span className="ml-1 font-medium text-green-600">${(action.estimatedGain - action.cost).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-[#007AFF]" />
                  <span>Diagnostic Segment View</span>
                </CardTitle>
                <CardDescription>
                  Segment performance analysis and risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segments.map((segment) => (
                    <div 
                      key={segment.id} 
                      className={`p-4 border border-gray-100 rounded-[16px] ${appleParkTheme.shadow} cursor-pointer hover:border-[#007AFF] transition-colors ${
                        selectedSegment === segment.id ? 'border-[#007AFF] bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedSegment(selectedSegment === segment.id ? null : segment.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{segment.name}</h4>
                          <p className="text-sm text-gray-600">{segment.vdpCount.toLocaleString()} VDPs</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{segment.qaiScore.toFixed(1)}</div>
                          <div className="flex items-center space-x-2">
                            {getVelocityIcon(segment.velocity)}
                            <span className={`text-sm font-medium ${getVelocityColor(segment.velocity)}`}>
                              {segment.velocity > 0 ? '+' : ''}{segment.velocity.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Risk Level:</span>
                          <Badge className={`ml-1 ${getRiskColor(segment.riskLevel)} rounded-full`}>
                            {segment.riskLevel}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversion Rate:</span>
                          <span className="ml-1 font-medium text-gray-900">{segment.conversionRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Training:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {new Date(segment.lastTraining).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ml" className="space-y-6">
            <Card className={`${appleParkTheme.card} ${appleParkTheme.shadow} ${appleParkTheme.radius}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-[#007AFF]" />
                  <span>ML Engine Status</span>
                </CardTitle>
                <CardDescription>
                  XGBoost Classifier with SHAP explainability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Model Configuration</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model Type:</span>
                          <span className="font-medium">XGBClassifier</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Explainability:</span>
                          <span className="font-medium">SHAP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Training Frequency:</span>
                          <span className="font-medium">Weekly</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min New VDPs:</span>
                          <span className="font-medium">10,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Retrain Threshold:</span>
                          <span className="font-medium">AUC Drop 0.03</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Current Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Model Active</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">SHAP Explainer Ready</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Last Training: 2 days ago</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">AUC Score: 0.847</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-3">Feature Importance (Top 5)</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Odometer_Photo_Binary', importance: 0.25, impact: 'High' },
                        { name: 'Deceptive_Price_Binary', importance: 0.20, impact: 'High' },
                        { name: 'Trust_Alpha', importance: 0.15, impact: 'Medium' },
                        { name: 'Expertise_Alpha', importance: 0.12, impact: 'Medium' },
                        { name: 'Photo_Count', importance: 0.10, impact: 'Low' }
                      ].map((feature, index) => (
                        <div key={feature.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-[12px]">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                            <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                            <Badge className={`${feature.impact === 'High' ? 'bg-red-100 text-red-800' : 
                                              feature.impact === 'Medium' ? 'bg-orange-100 text-orange-800' : 
                                              'bg-blue-100 text-blue-800'} rounded-full`}>
                              {feature.impact}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {(feature.importance * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
