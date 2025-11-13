/**
 * Schema Validation Dashboard Component
 * 
 * Displays comprehensive validation results for the enhanced dAI algorithm
 * against the provided JSON schema specifications, ensuring 100% compliance.
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
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Target,
  Brain,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';

interface SchemaValidationDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SchemaValidationData {
  validation: {
    isValid: boolean;
    score: number;
    matchedMetrics: string[];
    missingMetrics: string[];
    formulaAccuracy: number;
    implementationGaps: string[];
    recommendations: string[];
  };
  formulaValidation: {
    isValid: boolean;
    score: number;
    details: Array<{
      formula: string;
      implemented: boolean;
      accuracy: number;
    }>;
  };
  schemaCompliance: {
    metrics: number;
    actionAreas: number;
    aiEngineAdapters: number;
    overall: number;
  };
  implementationReport: string;
  exportableSchema: string;
}

export default function SchemaValidationDashboard({ 
  autoRefresh = false, 
  refreshInterval = 30000 
}: SchemaValidationDashboardProps) {
  const [data, setData] = useState<SchemaValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchValidationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schema-validation?report=true&schema=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch schema validation data');
      }
      
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidationData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchValidationData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isValid: boolean, score: number) => {
    if (isValid && score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const downloadSchema = () => {
    if (!data?.exportableSchema) return;
    
    const blob = new Blob([data.exportableSchema], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dealership-ai-dashboard-schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadReport = () => {
    if (!data?.implementationReport) return;
    
    const blob = new Blob([data.implementationReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema-validation-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          Error loading schema validation data: {error}
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
          <h1 className="text-3xl font-bold text-gray-900">Schema Validation Dashboard</h1>
          <p className="text-gray-600">Enhanced dAI Algorithm Compliance Report</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchValidationData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
          <button
            onClick={downloadSchema}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Export Schema</span>
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Validation</CardTitle>
            {getStatusIcon(data.validation.isValid, data.validation.score)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.validation.score)}`}>
              {data.validation.score}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.validation.isValid ? 'Valid Implementation' : 'Issues Found'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formula Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.validation.formulaAccuracy)}`}>
              {data.validation.formulaAccuracy}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formula Implementation Accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schema Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.schemaCompliance.overall)}`}>
              {data.schemaCompliance.overall}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall Schema Compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matched Metrics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.validation.matchedMetrics.length}/10
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Schema Metrics Implemented
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issues Alert */}
      {data.validation.implementationGaps.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Implementation Gaps Detected:</strong> {data.validation.implementationGaps.length} issues found
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="formulas">Formulas</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schema Compliance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Schema Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Metrics</span>
                    <span className={getScoreColor(data.schemaCompliance.metrics)}>
                      {data.schemaCompliance.metrics}%
                    </span>
                  </div>
                  <Progress value={data.schemaCompliance.metrics} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Action Areas</span>
                    <span className={getScoreColor(data.schemaCompliance.actionAreas)}>
                      {data.schemaCompliance.actionAreas}%
                    </span>
                  </div>
                  <Progress value={data.schemaCompliance.actionAreas} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Engine Adapters</span>
                    <span className={getScoreColor(data.schemaCompliance.aiEngineAdapters)}>
                      {data.schemaCompliance.aiEngineAdapters}%
                    </span>
                  </div>
                  <Progress value={data.schemaCompliance.aiEngineAdapters} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Implementation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Implementation Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Matched Metrics</span>
                  <Badge className={getScoreBadgeColor(data.validation.score)}>
                    {data.validation.matchedMetrics.length}/10
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Missing Metrics</span>
                  <Badge className={data.validation.missingMetrics.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {data.validation.missingMetrics.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Implementation Gaps</span>
                  <Badge className={data.validation.implementationGaps.length > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                    {data.validation.implementationGaps.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Formula Accuracy</span>
                  <Badge className={getScoreBadgeColor(data.validation.formulaAccuracy)}>
                    {data.validation.formulaAccuracy}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Matched Metrics ({data.validation.matchedMetrics.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.validation.matchedMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{metric}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Metrics */}
            {data.validation.missingMetrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>Missing Metrics ({data.validation.missingMetrics.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.validation.missingMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Formulas Tab */}
        <TabsContent value="formulas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Formula Implementation Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.formulaValidation.details.map((formula, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{formula.formula}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formula.implemented ? 'Implemented' : 'Not Implemented'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {formula.implemented ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge className={getScoreBadgeColor(formula.accuracy)}>
                        {formula.accuracy}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Metrics Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(data.schemaCompliance.metrics)}`}>
                    {data.schemaCompliance.metrics}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Schema Metrics Implemented
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Areas Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(data.schemaCompliance.actionAreas)}`}>
                    {data.schemaCompliance.actionAreas}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Action Areas Covered
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Engine Adapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(data.schemaCompliance.aiEngineAdapters)}`}>
                    {data.schemaCompliance.aiEngineAdapters}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    AI Engine Adapters Implemented
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Implementation Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                  {data.implementationReport}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {data.validation.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.validation.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
