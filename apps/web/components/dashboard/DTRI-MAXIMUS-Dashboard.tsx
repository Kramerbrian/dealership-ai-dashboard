/**
 * DTRI-MAXIMUS Dashboard Component
 * Comprehensive Digital Trust Revenue Index visualization with negative signal detection
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Target,
  Shield,
  Zap,
  BarChart3,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DTRIResult {
  dtriScore: number;
  qaiScores: {
    ftfr: number;
    vdpd: number;
    proc: number;
    cert: number;
    overall: number;
  };
  eeatScores: {
    trustworthiness: number;
    experience: number;
    expertise: number;
    authoritativeness: number;
    overall: number;
  };
  financialImpact: {
    decayTaxCost: number;
    aroiScore: number;
    totalLeadLift: number;
    totalGPLift: number;
    strategicWindowValue: number;
  };
  riskAssessment: {
    tsmMultiplier: number;
    criticalRisks: string[];
    recommendedActions: string[];
  };
  autonomousTriggers: {
    crisisAlerts: boolean;
    competitiveThreats: boolean;
    budgetReallocation: boolean;
  };
}

interface NegativeSignalAnalysis {
  aeoContaminants: {
    overallAEOPenalty: number;
    contentContaminants: {
      promotionalDensity: number;
      hyperboleCount: number;
      unverifiedClaims: number;
      queryMisalignment: number;
    };
    trustGaps: {
      citationVoids: number;
      schemaGaps: number;
      authorBiosMissing: number;
      expertiseClaims: number;
    };
    harmfulContent: {
      misleadingClaims: number;
      ymylViolations: number;
      safetyMisinformation: number;
      financialMisleading: number;
    };
  };
  geoContaminants: {
    overallGEOPenalty: number;
    geoNegatives: {
      serviceAreaOverreach: number;
      irrelevantTowns: number;
      proximityDilution: number;
    };
    napInconsistencies: {
      nameVariations: number;
      addressMismatches: number;
      phoneVariations: number;
      consistencyScore: number;
    };
    categoryMisalignment: {
      irrelevantCategories: number;
      primaryMismatch: number;
      trafficQuality: number;
    };
    inventoryIssues: {
      outOfStockVDPs: number;
      phantomInventory: number;
      availabilityMismatch: number;
    };
  };
  totalPenaltyScore: number;
  criticalIssues: string[];
  recommendedFixes: string[];
  dtriImpact: {
    trustworthinessPenalty: number;
    experiencePenalty: number;
    expertisePenalty: number;
    authoritativenessPenalty: number;
  };
}

export default function DTRIMaximusDashboard() {
  const [dtriData, setDtriData] = useState<DTRIResult | null>(null);
  const [negativeSignals, setNegativeSignals] = useState<NegativeSignalAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'opportunities' | 'actions'>('overview');

  useEffect(() => {
    fetchDTRIData();
  }, []);

  const fetchDTRIData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - in production, this would call the actual API
      const mockDTRIResult: DTRIResult = {
        dtriScore: 78.5,
        qaiScores: {
          ftfr: 82,
          vdpd: 75,
          proc: 68,
          cert: 85,
          overall: 77.5
        },
        eeatScores: {
          trustworthiness: 72,
          experience: 80,
          expertise: 65,
          authoritativeness: 78,
          overall: 73.75
        },
        financialImpact: {
          decayTaxCost: 45000,
          aroiScore: 8.5,
          totalLeadLift: 97,
          totalGPLift: 125000,
          strategicWindowValue: 35000
        },
        riskAssessment: {
          tsmMultiplier: 1.25,
          criticalRisks: [
            'Low trustworthiness score increases decay tax risk',
            'Poor process adherence impacting conversion rates'
          ],
          recommendedActions: [
            'Implement automated review response system',
            'Optimize VDP speed and implement schema markup',
            'Enhance technician certification tracking'
          ]
        },
        autonomousTriggers: {
          crisisAlerts: true,
          competitiveThreats: false,
          budgetReallocation: false
        }
      };

      const mockNegativeSignals: NegativeSignalAnalysis = {
        aeoContaminants: {
          overallAEOPenalty: 65,
          contentContaminants: {
            promotionalDensity: 8.5,
            hyperboleCount: 12,
            unverifiedClaims: 5,
            queryMisalignment: 35
          },
          trustGaps: {
            citationVoids: 8,
            schemaGaps: 3,
            authorBiosMissing: 1,
            expertiseClaims: 6
          },
          harmfulContent: {
            misleadingClaims: 2,
            ymylViolations: 1,
            safetyMisinformation: 0,
            financialMisleading: 1
          }
        },
        geoContaminants: {
          overallGEOPenalty: 55,
          geoNegatives: {
            serviceAreaOverreach: 30,
            irrelevantTowns: 4,
            proximityDilution: 20
          },
          napInconsistencies: {
            nameVariations: 2,
            addressMismatches: 1,
            phoneVariations: 1,
            consistencyScore: 85
          },
          categoryMisalignment: {
            irrelevantCategories: 2,
            primaryMismatch: 0,
            trafficQuality: 70
          },
          inventoryIssues: {
            outOfStockVDPs: 8,
            phantomInventory: 2,
            availabilityMismatch: 15
          }
        },
        totalPenaltyScore: 60,
        criticalIssues: [
          'High AEO penalty - content contaminants blocking AI citations',
          'GEO penalty affecting local visibility',
          'YMYL violations detected - immediate content review required'
        ],
        recommendedFixes: [
          'Reduce promotional language density by 50%',
          'Add external citations and links to support expertise claims',
          'Standardize NAP across all directories',
          'Remove irrelevant GBP categories',
          'Implement real-time inventory sync'
        ],
        dtriImpact: {
          trustworthinessPenalty: 24,
          experiencePenalty: 8,
          expertisePenalty: 16,
          authoritativenessPenalty: 12
        }
      };

      setDtriData(mockDTRIResult);
      setNegativeSignals(mockNegativeSignals);
    } catch (err) {
      setError('Failed to load DTRI-MAXIMUS data');
      console.error('DTRI data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 85) return { level: 'LOW', color: 'green' };
    if (score >= 70) return { level: 'MEDIUM', color: 'yellow' };
    return { level: 'HIGH', color: 'red' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dtriData || !negativeSignals) {
    return null;
  }

  const riskLevel = getRiskLevel(dtriData.dtriScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DTRI-MAXIMUS Dashboard</h1>
          <p className="text-gray-600">Digital Trust Revenue Index - Autonomous Predictive System</p>
        </div>
        <Badge className={`${getScoreBadge(dtriData.dtriScore)} text-lg px-4 py-2`}>
          {dtriData.dtriScore}/100
        </Badge>
      </div>

      {/* Critical Alerts */}
      {dtriData.autonomousTriggers.crisisAlerts && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Crisis Alert:</strong> Trustworthiness score below threshold. Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      {/* Main DTRI Score Gauge */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            DTRI-MAXIMUS Composite Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-blue-600">
              {dtriData.dtriScore}
            </div>
            <div className="text-2xl text-gray-600">/ 100</div>
            <Badge className={`${getScoreBadge(dtriData.dtriScore)} text-lg px-6 py-2`}>
              {riskLevel.level} RISK
            </Badge>
            <Progress 
              value={dtriData.dtriScore} 
              className="h-4"
            />
            <p className="text-sm text-gray-500">
              Trust Sensitivity Multiplier: {dtriData.riskAssessment.tsmMultiplier}x
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'risks', label: 'Risks & Penalties', icon: AlertTriangle },
          { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
          { id: 'actions', label: 'Actions', icon: Zap }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* QAI Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                QAI (Internal Execution)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>FTFR Score</span>
                <span className={getScoreColor(dtriData.qaiScores.ftfr)}>
                  {dtriData.qaiScores.ftfr}
                </span>
              </div>
              <div className="flex justify-between">
                <span>VDP Detail</span>
                <span className={getScoreColor(dtriData.qaiScores.vdpd)}>
                  {dtriData.qaiScores.vdpd}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Process Adherence</span>
                <span className={getScoreColor(dtriData.qaiScores.proc)}>
                  {dtriData.qaiScores.proc}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Certification</span>
                <span className={getScoreColor(dtriData.qaiScores.cert)}>
                  {dtriData.qaiScores.cert}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Overall QAI</span>
                  <span className={getScoreColor(dtriData.qaiScores.overall)}>
                    {dtriData.qaiScores.overall}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* E-E-A-T Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                E-E-A-T (External Perception)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Trustworthiness</span>
                <span className={getScoreColor(dtriData.eeatScores.trustworthiness)}>
                  {dtriData.eeatScores.trustworthiness}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Experience</span>
                <span className={getScoreColor(dtriData.eeatScores.experience)}>
                  {dtriData.eeatScores.experience}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expertise</span>
                <span className={getScoreColor(dtriData.eeatScores.expertise)}>
                  {dtriData.eeatScores.expertise}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Authoritativeness</span>
                <span className={getScoreColor(dtriData.eeatScores.authoritativeness)}>
                  {dtriData.eeatScores.authoritativeness}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Overall E-E-A-T</span>
                  <span className={getScoreColor(dtriData.eeatScores.overall)}>
                    {dtriData.eeatScores.overall}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Decay Tax Risk</span>
                <span className="text-red-600 font-semibold">
                  ${dtriData.financialImpact.decayTaxCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profit Opportunity</span>
                <span className="text-green-600 font-semibold">
                  ${dtriData.financialImpact.totalGPLift.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Lead Gain Potential</span>
                <span className="text-blue-600 font-semibold">
                  +{dtriData.financialImpact.totalLeadLift}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AROI Score</span>
                <span className="text-purple-600 font-semibold">
                  {dtriData.financialImpact.aroiScore}x
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Window */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Strategic Window
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${dtriData.financialImpact.strategicWindowValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Competitive Advantage Value</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Window Duration</span>
                  <span>4-6 months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Threat Level</span>
                  <Badge className={dtriData.autonomousTriggers.competitiveThreats ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {dtriData.autonomousTriggers.competitiveThreats ? 'HIGH' : 'LOW'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-6">
          {/* Negative Signal Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Negative Signal Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AEO Contaminants */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">AEO Contaminants</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall AEO Penalty</span>
                      <Badge className={getScoreBadge(100 - negativeSignals.aeoContaminants.overallAEOPenalty)}>
                        {negativeSignals.aeoContaminants.overallAEOPenalty}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Promotional Density: {negativeSignals.aeoContaminants.contentContaminants.promotionalDensity}%</div>
                      <div>Citation Voids: {negativeSignals.aeoContaminants.trustGaps.citationVoids}</div>
                      <div>YMYL Violations: {negativeSignals.aeoContaminants.harmfulContent.ymylViolations}</div>
                    </div>
                  </div>
                </div>

                {/* GEO Contaminants */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">GEO Contaminants</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall GEO Penalty</span>
                      <Badge className={getScoreBadge(100 - negativeSignals.geoContaminants.overallGEOPenalty)}>
                        {negativeSignals.geoContaminants.overallGEOPenalty}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>NAP Consistency: {negativeSignals.geoContaminants.napInconsistencies.consistencyScore}%</div>
                      <div>Out-of-Stock VDPs: {negativeSignals.geoContaminants.inventoryIssues.outOfStockVDPs}</div>
                      <div>Irrelevant Categories: {negativeSignals.geoContaminants.categoryMisalignment.irrelevantCategories}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {negativeSignals.criticalIssues.map((issue, index) => (
                  <Alert key={index} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{issue}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          {/* Profit Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Profit Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    ${dtriData.financialImpact.totalGPLift.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Annual Gross Profit Uplift</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    +{dtriData.financialImpact.totalLeadLift}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Lead Gain</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {dtriData.financialImpact.aroiScore}x
                  </div>
                  <div className="text-sm text-gray-600">AROI Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DTRI Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>DTRI Impact from Negative Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    -{negativeSignals.dtriImpact.trustworthinessPenalty}
                  </div>
                  <div className="text-sm text-gray-600">Trustworthiness Penalty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    -{negativeSignals.dtriImpact.experiencePenalty}
                  </div>
                  <div className="text-sm text-gray-600">Experience Penalty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    -{negativeSignals.dtriImpact.expertisePenalty}
                  </div>
                  <div className="text-sm text-gray-600">Expertise Penalty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    -{negativeSignals.dtriImpact.authoritativenessPenalty}
                  </div>
                  <div className="text-sm text-gray-600">Authoritativeness Penalty</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-6">
          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dtriData.riskAssessment.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">{action}</div>
                      <div className="text-sm text-blue-700">Priority: High</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Negative Signal Fixes */}
          <Card>
            <CardHeader>
              <CardTitle>Negative Signal Mitigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {negativeSignals.recommendedFixes.map((fix, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-900">{fix}</div>
                      <div className="text-sm text-yellow-700">Impact: Reduces penalty score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
