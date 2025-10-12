'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Progress } from '@/src/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { 
  Car, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';

interface VDPMetrics {
  totalVDPs: number;
  compliantVDPs: number;
  publishableVDPs: number;
  requiresReview: number;
  averageVAIScore: number;
  averagePIQRScore: number;
  averageHRPScore: number;
  complianceRate: number;
  publishRate: number;
}

interface VDPContent {
  vin: string;
  content: {
    AEO_Snippet_Block: string;
    GEO_Authority_Block: string;
    SEO_Descriptive_Block: string;
    Internal_Link_Block: Array<{ anchor: string; url: string }>;
  };
  compliance: {
    piqrScore: number;
    hrpScore: number;
    vaiScore: number;
    complianceFails: string[];
    warningSignals: string[];
  };
  complianceCheck: {
    isCompliant: boolean;
    score: number;
    canPublish: boolean;
    requiresReview: boolean;
    issues: string[];
    recommendations: string[];
  };
  metadata: {
    generatedAt: string;
    clusterId: string;
    sentiment: string;
    wordCounts: {
      aeo: number;
      geo: number;
      seo: number;
    };
  };
}

export default function VDPManagementDashboard() {
  const [metrics, setMetrics] = useState<VDPMetrics | null>(null);
  const [vdpContents, setVdpContents] = useState<VDPContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVIN, setSelectedVIN] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  useEffect(() => {
    const mockMetrics: VDPMetrics = {
      totalVDPs: 1247,
      compliantVDPs: 1089,
      publishableVDPs: 1156,
      requiresReview: 91,
      averageVAIScore: 78.5,
      averagePIQRScore: 1.12,
      averageHRPScore: 0.18,
      complianceRate: 87.3,
      publishRate: 92.7
    };

    const mockVDPs: VDPContent[] = [
      {
        vin: '1HGBH41JXMN109186',
        content: {
          AEO_Snippet_Block: '2024 Honda Civic in Los Angeles - 36 MPG combined fuel economy. Perfect for families seeking safety and reliability.',
          GEO_Authority_Block: 'This 2024 Honda Civic has been verified with our 150-point inspection by Master Technician John Smith. Our certified service center has maintained this vehicle to factory standards, ensuring optimal performance and reliability for your family.',
          SEO_Descriptive_Block: 'Discover the perfect blend of performance and efficiency in this 2024 Honda Civic. Featuring a powerful 1.5L Turbo 4-Cylinder engine and smooth CVT transmission, this vehicle delivers 32 city and 42 highway MPG...',
          Internal_Link_Block: [
            { anchor: 'Apply for Financing', url: '/finance-application' },
            { anchor: 'Schedule Service', url: '/service-center' },
            { anchor: 'Meet Our Master Technician', url: '/technician-bio' }
          ]
        },
        compliance: {
          piqrScore: 1.05,
          hrpScore: 0.12,
          vaiScore: 82.3,
          complianceFails: [],
          warningSignals: []
        },
        complianceCheck: {
          isCompliant: true,
          score: 95,
          canPublish: true,
          requiresReview: false,
          issues: [],
          recommendations: ['Consider adding more brand mentions for better SEO']
        },
        metadata: {
          generatedAt: '2024-01-15T10:30:00Z',
          clusterId: 'Cluster 1: High-Value, Family Shoppers',
          sentiment: 'Safety and Reliability',
          wordCounts: { aeo: 18, geo: 32, seo: 45 }
        }
      }
    ];

    setMetrics(mockMetrics);
    setVdpContents(mockVDPs);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading VDP metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">VDP Management Dashboard</h1>
          <p className="text-muted-foreground">
            Triple-Optimization Content Protocol (VDP-TOP) Analytics
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
            <CardTitle className="text-sm font-medium">Total VDPs</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalVDPs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active vehicle descriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.complianceRate.toFixed(1)}%</div>
            <Progress value={metrics?.complianceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              {metrics?.compliantVDPs} of {metrics?.totalVDPs} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publish Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.publishRate.toFixed(1)}%</div>
            <Progress value={metrics?.publishRate} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              {metrics?.publishableVDPs} ready to publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg VAI Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageVAIScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Unified AI Visibility Score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* PIQR vs HRP Chart */}
            <Card>
              <CardHeader>
                <CardTitle>PIQR vs HRP Distribution</CardTitle>
                <CardDescription>
                  Proactive Inventory Quality Radar vs Hallucination Risk Penalty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average PIQR Score</span>
                    <Badge variant={metrics?.averagePIQRScore <= 1.2 ? 'default' : 'destructive'}>
                      {metrics?.averagePIQRScore.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average HRP Score</span>
                    <Badge variant={metrics?.averageHRPScore <= 0.3 ? 'default' : 'destructive'}>
                      {metrics?.averageHRPScore.toFixed(2)}
                    </Badge>
                  </div>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {metrics?.requiresReview} VDPs require manual review
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Cluster Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Cluster Performance</CardTitle>
                <CardDescription>
                  VCO Cluster ID performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High-Value, Family Shoppers</span>
                    <Badge className="bg-green-100 text-green-800">92%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Luxury, Performance Buyers</span>
                    <Badge className="bg-blue-100 text-blue-800">88%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Budget-Conscious, First-Time</span>
                    <Badge className="bg-yellow-100 text-yellow-800">85%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>
                Detailed compliance analysis for all VDPs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vdpContents.map((vdp) => (
                  <div key={vdp.vin} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{vdp.vin}</span>
                        <Badge className={getStatusColor(
                          vdp.complianceCheck.isCompliant ? 'compliant' : 
                          vdp.complianceCheck.requiresReview ? 'warning' : 'critical'
                        )}>
                          {getStatusIcon(
                            vdp.complianceCheck.isCompliant ? 'compliant' : 
                            vdp.complianceCheck.requiresReview ? 'warning' : 'critical'
                          )}
                          <span className="ml-1">
                            {vdp.complianceCheck.isCompliant ? 'Compliant' : 
                             vdp.complianceCheck.requiresReview ? 'Review' : 'Critical'}
                          </span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        VAI: {vdp.compliance.vaiScore.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">PIQR:</span>
                        <span className="ml-1 font-medium">{vdp.compliance.piqrScore.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">HRP:</span>
                        <span className="ml-1 font-medium">{vdp.compliance.hrpScore.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cluster:</span>
                        <span className="ml-1 font-medium">{vdp.metadata.clusterId.split(':')[0]}</span>
                      </div>
                    </div>

                    {vdp.complianceCheck.issues.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-600 mb-1">Issues:</p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {vdp.complianceCheck.issues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
              <CardDescription>
                Word count and content quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vdpContents.map((vdp) => (
                  <div key={vdp.vin} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm font-medium">{vdp.vin}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedVIN(selectedVIN === vdp.vin ? null : vdp.vin)}
                      >
                        {selectedVIN === vdp.vin ? 'Hide' : 'View'} Content
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">AEO Words:</span>
                        <span className="ml-1 font-medium">{vdp.metadata.wordCounts.aeo}/40</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">GEO Words:</span>
                        <span className="ml-1 font-medium">{vdp.metadata.wordCounts.geo}/100</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">SEO Words:</span>
                        <span className="ml-1 font-medium">{vdp.metadata.wordCounts.seo}/250</span>
                      </div>
                    </div>

                    {selectedVIN === vdp.vin && (
                      <div className="space-y-4 mt-4 pt-4 border-t">
                        <div>
                          <h4 className="font-medium text-sm mb-2">AEO Snippet Block:</h4>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                            {vdp.content.AEO_Snippet_Block}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">GEO Authority Block:</h4>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                            {vdp.content.GEO_Authority_Block}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Internal Links:</h4>
                          <div className="space-y-1">
                            {vdp.content.Internal_Link_Block.map((link, index) => (
                              <div key={index} className="text-sm">
                                <a href={link.url} className="text-blue-600 hover:underline">
                                  {link.anchor}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Automated suggestions for improving VDP performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Priority Action:</strong> 91 VDPs require immediate review due to compliance issues.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">Top Recommendations:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Add more verifiable dealer facts to GEO Authority Blocks to reduce HRP scores</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Optimize AEO Snippet Blocks to stay within 40-word limit for better AEO performance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Increase internal link density to improve E-E-A-T signals</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Remove conditional language that triggers deceptive pricing warnings</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
