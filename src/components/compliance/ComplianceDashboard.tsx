'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  FileText,
  Users,
  Settings
} from 'lucide-react';

interface ComplianceMetrics {
  total_assessments: number;
  compliant_percentage: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  average_confidence: number;
  last_assessment: Date;
}

interface ComplianceAssessment {
  assessment_id: string;
  question_type: 'security' | 'seo' | 'aeo' | 'ai_visibility' | 'general';
  compliant: 'yes' | 'no';
  explanation: string;
  confidence_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
  timestamp: Date;
  assessed_by: string;
}

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const [metricsData, assessmentsData] = await Promise.all([
      //   api.compliance.getComplianceMetrics.query(),
      //   api.compliance.getAssessmentHistory.query({ limit: 10 })
      // ]);
      
      // Mock data for now
      const mockMetrics: ComplianceMetrics = {
        total_assessments: 24,
        compliant_percentage: 87.5,
        risk_distribution: {
          low: 18,
          medium: 4,
          high: 2,
          critical: 0,
        },
        average_confidence: 0.82,
        last_assessment: new Date(),
      };

      const mockAssessments: ComplianceAssessment[] = [
        {
          assessment_id: 'comp_1',
          question_type: 'security',
          compliant: 'yes',
          explanation: 'A dedicated security team follows strict protocols for handling incidents.',
          confidence_score: 0.85,
          risk_level: 'low',
          timestamp: new Date(),
          assessed_by: 'system',
        },
        {
          assessment_id: 'comp_2',
          question_type: 'ai_visibility',
          compliant: 'yes',
          explanation: 'A search engine agent for SEO, AEO, AIO, and Generative Search constantly improves the measurement and calculation of AI search visibility.',
          confidence_score: 0.92,
          risk_level: 'low',
          timestamp: new Date(Date.now() - 86400000),
          assessed_by: 'system',
        },
      ];

      setMetrics(mockMetrics);
      setAssessments(mockAssessments);
    } catch (err) {
      setError('Failed to load compliance data');
      console.error('Error fetching compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getComplianceIcon = (compliant: 'yes' | 'no') => {
    return compliant === 'yes' ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'seo': return <TrendingUp className="h-4 w-4" />;
      case 'aeo': return <FileText className="h-4 w-4" />;
      case 'ai_visibility': return <Users className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
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
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security and search visibility compliance across your organization
          </p>
        </div>
        <Button onClick={fetchComplianceData}>
          Refresh Data
        </Button>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_assessments}</div>
              <p className="text-xs text-muted-foreground">
                Last updated {metrics.last_assessment.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.compliant_percentage}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.compliant_percentage >= 90 ? 'Excellent' : 
                 metrics.compliant_percentage >= 80 ? 'Good' : 'Needs Improvement'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.average_confidence * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Assessment quality score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.risk_distribution.high + metrics.risk_distribution.critical}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Distribution */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center space-x-2">
                <Badge variant="default">Low</Badge>
                <span className="text-sm font-medium">{metrics.risk_distribution.low}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Medium</Badge>
                <span className="text-sm font-medium">{metrics.risk_distribution.medium}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">High</Badge>
                <span className="text-sm font-medium">{metrics.risk_distribution.high}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">Critical</Badge>
                <span className="text-sm font-medium">{metrics.risk_distribution.critical}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="aeo">AEO</TabsTrigger>
              <TabsTrigger value="ai_visibility">AI Visibility</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.assessment_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getComplianceIcon(assessment.compliant)}
                      <div className="flex items-center space-x-2">
                        {getQuestionTypeIcon(assessment.question_type)}
                        <span className="text-sm font-medium capitalize">
                          {assessment.question_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRiskBadgeVariant(assessment.risk_level)}>
                        {assessment.risk_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(assessment.confidence_score * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      {assessment.explanation}
                    </p>
                  </div>
                  
                  {assessment.recommendations && assessment.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {assessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-muted-foreground">
                    Assessed on {assessment.timestamp.toLocaleDateString()} by {assessment.assessed_by}
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
