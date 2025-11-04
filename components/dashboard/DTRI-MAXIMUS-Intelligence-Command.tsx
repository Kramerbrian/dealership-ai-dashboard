/**
 * DTRI-MAXIMUS Intelligence Command Center
 * Digital Trust Revenue Index - Ultimate Edition
 * 
 * Matches the Intelligence Command Center design with dark Cupertino theme,
 * slate backgrounds, and soft indigo gradients
 */

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  DollarSign, 
  Shield, 
  Target,
  Zap,
  Brain,
  BarChart3,
  Play,
  ChevronRight
} from 'lucide-react';

interface DTriMaximusIntelligenceProps {
  tenantId: string;
  dealershipId: string;
}

interface DTriMaximusData {
  supermodal: {
    dtriScore: number;
    scoreColorCode: 'green' | 'yellow' | 'red';
    maximusInsight: string;
    profitOpportunityDollars: number;
    decayTaxRiskDollars: number;
    lastUpdated: string;
  };
  microSegmentation: {
    totalProfitLift: number;
    segmentedBreakdown: {
      sales: { profitLift: number; dtriScore: number; deltaLeads: number };
      service: { profitLift: number; dtriScore: number; deltaLeads: number };
      leads: { profitLift: number; dtriScore: number; deltaLeads: number };
      lifetimeValue: { profitLift: number; dtriScore: number; deltaLeads: number };
    };
  };
  feedbackLoop: {
    pendingRecalibrations: number;
    appliedRecalibrations: number;
    mlAccuracy: number;
    autonomousTriggers: number;
  };
  ultimateEnhancements: {
    mlPredictive: { accuracy: number; models: number };
    autonomousAgents: { activeTriggers: number; actionsExecuted: number };
    contextualFiltering: { segments: number; tsmCalibrations: number };
    causalForecasting: { models: number; forecastHorizon: number };
  };
}

// Fetch function for React Query
async function fetchDTriMaximusData(
  tenantId: string,
  dealershipId: string
): Promise<DTriMaximusData> {
  // Try to fetch from APIs, but fall back to mock data if they fail
  try {
    const [supermodalRes, microSegRes, feedbackRes, ultimateRes] = await Promise.all([
      fetch(`/api/dtri-maximus/supermodal?tenantId=${tenantId}&dealershipId=${dealershipId}`),
      fetch(`/api/dtri-maximus/micro-segmentation?tenantId=${tenantId}&dealershipId=${dealershipId}`),
      fetch(`/api/dtri-maximus/feedback-loop?tenantId=${tenantId}&dealershipId=${dealershipId}&action=get_recalibration`),
      fetch(`/api/dtri-maximus/ultimate?tenantId=${tenantId}&dealershipId=${dealershipId}&enhancement=all`)
    ]);

    const [supermodal, microSeg, feedback, ultimate] = await Promise.all([
      supermodalRes.json(),
      microSegRes.json(),
      feedbackRes.json(),
      ultimateRes.json()
    ]);

    if (supermodal.success && microSeg.success && feedback.success && ultimate.success) {
      return {
        supermodal: supermodal.data,
        microSegmentation: microSeg.data,
        feedbackLoop: feedback.data,
        ultimateEnhancements: ultimate.data
      };
    }
  } catch (apiError) {
    console.log('APIs not available, using mock data:', apiError);
  }

  // Fallback to mock data
  return {
    supermodal: {
      dtriScore: 85.2,
      scoreColorCode: 'green' as const,
      maximusInsight: 'Your current score translates to an immediate $90,000 Profit Opportunity and $18,000 in Decay Tax Risk.',
      profitOpportunityDollars: 90000,
      decayTaxRiskDollars: 18000,
      lastUpdated: new Date().toISOString()
    },
    microSegmentation: {
      totalProfitLift: 56100,
      segmentedBreakdown: {
        sales: { profitLift: 52500, dtriScore: 87.3, deltaLeads: 15 },
        service: { profitLift: 3600, dtriScore: 82.1, deltaLeads: 8 },
        leads: { profitLift: 0, dtriScore: 75.5, deltaLeads: 0 },
        lifetimeValue: { profitLift: 0, dtriScore: 78.9, deltaLeads: 0 }
      }
    },
    feedbackLoop: {
      pendingRecalibrations: 3,
      appliedRecalibrations: 12,
      mlAccuracy: 0.92,
      autonomousTriggers: 8
    },
    ultimateEnhancements: {
      mlPredictive: { accuracy: 0.92, models: 4 },
      autonomousAgents: { activeTriggers: 8, actionsExecuted: 24 },
      contextualFiltering: { segments: 12, tsmCalibrations: 48 },
      causalForecasting: { models: 3, forecastHorizon: 180 }
    }
  };
}

export default function DTriMaximusIntelligenceCommand({ tenantId, dealershipId }: DTriMaximusIntelligenceProps) {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

  // React Query hook - replaces fetch/useState/useEffect
  const {
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dtri-maximus', tenantId, dealershipId],
    queryFn: () => fetchDTriMaximusData(tenantId, dealershipId),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryOnMount: false, // Don't refetch if already cached
  });

  const getScoreColor = (colorCode: string) => {
    switch (colorCode) {
      case 'green': return 'text-emerald-400';
      case 'yellow': return 'text-amber-400';
      case 'red': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const getScoreBgColor = (colorCode: string) => {
    switch (colorCode) {
      case 'green': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'yellow': return 'bg-amber-500/10 border-amber-500/20';
      case 'red': return 'bg-rose-500/10 border-rose-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading Intelligence Command Center...</p>
        </div>
        {/* Loading skeleton for the grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-sm p-6 animate-pulse">
              <div className="h-6 bg-slate-700 rounded mb-4"></div>
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="grid gap-3 md:grid-cols-2">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-sm p-4 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-8 bg-slate-700 rounded mb-2"></div>
                  <div className="space-y-1">
                    {[1,2,3,4].map(j => (
                      <div key={j} className="h-3 bg-slate-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-sm p-6 animate-pulse">
                <div className="h-6 bg-slate-700 rounded mb-4"></div>
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-12 bg-slate-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
        <p className="text-slate-400">Unable to load DTRI-MAXIMUS data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-100">Intelligence Command Center</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1">
              <span className="text-xs text-slate-400">Trial 13 days left</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1">
              <span className="text-xs text-slate-400">184/500</span>
            </div>
          </div>
        </div>

        {/* DTRI-MAXIMUS Supermodal - The Anchor Gauge */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Rail - Customer Journey Funnel */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Customer Journey Funnel</h3>
              <div className="space-y-4">
                <FunnelStage 
                  stage="Discover" 
                  kpi="AI Visibility Index" 
                  score={74} 
                  action="Fix AI Inclusion → Drawer"
                  onClick={() => setActiveDrawer('ai-inclusion')}
                />
                <FunnelStage 
                  stage="Consider" 
                  kpi="Trust & Author Credentials" 
                  score={63} 
                  action="Fix Reviews → Drawer"
                  onClick={() => setActiveDrawer('reviews')}
                />
                <FunnelStage 
                  stage="Engage" 
                  kpi="Structured Discoverability" 
                  score={58} 
                  action="Schema → Drawer"
                  onClick={() => setActiveDrawer('schema')}
                />
                <FunnelStage 
                  stage="Decide" 
                  kpi="Local Surface Strength" 
                  score={66} 
                  action="GBP → Drawer"
                  onClick={() => setActiveDrawer('gbp')}
                />
                <FunnelStage 
                  stage="Act" 
                  kpi="Operational Optimization Agent" 
                  score={49} 
                  action="Next Best Action → Drawer"
                  onClick={() => setActiveDrawer('optimization')}
                />
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Explainers</p>
                <p className="text-sm text-slate-300">"Clarity is king"</p>
                <p className="text-sm text-slate-300">"Evidence on demand"</p>
              </div>
            </div>
          </div>

          {/* Center Grid - DTRI-MAXIMUS Tiles */}
          <div className="lg:col-span-6">
            <div className="grid gap-3 md:grid-cols-2">
              {/* Overall Authority Score - DTRI-MAXIMUS */}
              <DTriMaximusTile 
                title="DTRI-MAXIMUS Score" 
                value={data.supermodal.dtriScore}
                maxValue={100}
                color="emerald"
                indicator="emerald"
                drivers={[
                  "Micro-Segmented Precision",
                  "Autonomous Feedback Loop", 
                  "ML Predictive Coefficients",
                  "Causal Forecasting"
                ]}
                onClick={() => setActiveDrawer('dtri-maximus')}
              />
              
              {/* AI Visibility Index */}
              <DTriMaximusTile 
                title="AI Visibility Index" 
                value={74}
                maxValue={100}
                color="amber"
                indicator="amber"
                drivers={[
                  "SERP+Answer fusion",
                  "Temporal decay",
                  "Clarity signals",
                  "GeoLocal optimization"
                ]}
                onClick={() => setActiveDrawer('ai-visibility')}
              />
              
              {/* Search Health */}
              <DTriMaximusTile 
                title="Search Health" 
                value={69}
                maxValue={100}
                color="amber"
                indicator="amber"
                drivers={[
                  "VDP Speed Score",
                  "NAP Consistency",
                  "Schema Markup",
                  "Technical SEO"
                ]}
                onClick={() => setActiveDrawer('search-health')}
              />
              
              {/* Trust & Reviews */}
              <DTriMaximusTile 
                title="Trust & Reviews" 
                value={61}
                maxValue={100}
                color="rose"
                indicator="rose"
                drivers={[
                  "Review Velocity",
                  "Response Time",
                  "Sentiment Analysis",
                  "E-E-A-T Signals"
                ]}
                onClick={() => setActiveDrawer('trust-reviews')}
              />
              
              {/* Opportunity Cost of Inaction */}
              <DTriMaximusTile 
                title="Opportunity Cost of Inaction" 
                value={data.supermodal.decayTaxRiskDollars}
                maxValue={100000}
                color="amber"
                indicator="amber"
                drivers={[
                  "Decay Tax Risk",
                  "Lost Revenue",
                  "Competitive Gap",
                  "Market Share Loss"
                ]}
                onClick={() => setActiveDrawer('opportunity-cost')}
              />
              
              {/* Vehicle Listing Integrity */}
              <DTriMaximusTile 
                title="Vehicle Listing Integrity" 
                value={72}
                maxValue={100}
                color="amber"
                indicator="amber"
                drivers={[
                  "Photo Quality",
                  "VIN/Price/Mileage",
                  "Required Schema",
                  "First Image Quality"
                ]}
                onClick={() => setActiveDrawer('vli')}
              />
            </div>
          </div>

          {/* Right Rail - Action Queue & Financial Lens */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Action Queue */}
              <div className="rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Action Queue</h3>
                <div className="space-y-3">
                  <ActionItem 
                    title="Repair VLI" 
                    onClick={() => setActiveDrawer('repair-vli')}
                  />
                  <ActionItem 
                    title="Reduce OCI" 
                    onClick={() => setActiveDrawer('reduce-oci')}
                  />
                  <ActionItem 
                    title="Stabilize Reviews" 
                    onClick={() => setActiveDrawer('stabilize-reviews')}
                  />
                </div>
              </div>

              {/* Financial Lens */}
              <div className="rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Financial Lens</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Algorithmic Trust Index</span>
                    <span className="text-lg font-semibold text-emerald-400">79</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Trust Impact Score</span>
                    <span className="text-lg font-semibold text-indigo-400">1.08</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Profit Opportunity</span>
                    <span className="text-lg font-semibold text-emerald-400">
                      ${data.supermodal.profitOpportunityDollars.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Overlay */}
        {activeDrawer && (
          <DrawerOverlay 
            drawerType={activeDrawer}
            onClose={() => setActiveDrawer(null)}
            data={data}
          />
        )}
      </div>
  );
}

// Funnel Stage Component
function FunnelStage({ 
  stage, 
  kpi, 
  score, 
  action, 
  onClick 
}: { 
  stage: string; 
  kpi: string; 
  score: number; 
  action: string; 
  onClick: () => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={onClick}>
      <div>
        <div className="text-xs text-slate-400 uppercase">{stage}</div>
        <div className="text-sm text-slate-200">{kpi}</div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-semibold ${getScoreColor(score)}`}>{score}%</div>
        <div className="text-xs text-slate-400">{action}</div>
      </div>
    </div>
  );
}

// DTRI-MAXIMUS Tile Component
function DTriMaximusTile({ 
  title, 
  value, 
  maxValue, 
  color, 
  indicator, 
  drivers, 
  onClick 
}: { 
  title: string; 
  value: number; 
  maxValue: number; 
  color: string; 
  indicator: string; 
  drivers: string[]; 
  onClick: () => void;
}) {
  const colorClasses = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    indigo: 'text-indigo-400',
    purple: 'text-purple-400'
  };

  const bgClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
    rose: 'bg-rose-500/10 border-rose-500/20',
    indigo: 'bg-indigo-500/10 border-indigo-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20'
  };

  const displayValue = maxValue === 100 ? `${value}/100` : 
                      maxValue === 100000 ? `$${value.toLocaleString()}` : 
                      value.toString();

  return (
    <div 
      className={`rounded-2xl border backdrop-blur-sm p-4 hover:shadow-lg transition-all duration-200 cursor-pointer ${bgClasses[indicator as keyof typeof bgClasses]}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400 uppercase">{title}</div>
        <div className={`w-2 h-2 rounded-full ${bgClasses[indicator as keyof typeof bgClasses]}`}></div>
      </div>
      
      <div className={`text-3xl font-light ${colorClasses[color as keyof typeof colorClasses]}`}>
        {displayValue}
      </div>
      
      <div className="mt-2 space-y-1">
        {drivers.map((driver, index) => (
          <div key={index} className="text-xs text-slate-400">
            • {driver}
          </div>
        ))}
      </div>
    </div>
  );
}

// Action Item Component
function ActionItem({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <span className="text-sm text-slate-200">{title}</span>
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </div>
  );
}

// Drawer Overlay Component
function DrawerOverlay({ 
  drawerType, 
  onClose, 
  data 
}: { 
  drawerType: string; 
  onClose: () => void; 
  data: DTriMaximusData;
}) {
  const getDrawerContent = () => {
    switch (drawerType) {
      case 'dtri-maximus':
        return {
          title: 'DTRI-MAXIMUS Strategy Report',
          explanation: data.supermodal.maximusInsight,
          playbook: 'Execute MAXIMUS Optimization Strategy'
        };
      case 'ai-inclusion':
        return {
          title: 'AI Inclusion Optimization',
          explanation: 'Improve AI visibility across search engines and voice assistants by optimizing content structure and schema markup.',
          playbook: 'Run AI Inclusion Playbook'
        };
      case 'reviews':
        return {
          title: 'Review Management Strategy',
          explanation: 'Implement automated review response system and improve review velocity to boost trust signals.',
          playbook: 'Execute Review Optimization'
        };
      case 'schema':
        return {
          title: 'Schema Markup Enhancement',
          explanation: 'Add structured data markup to improve search engine understanding and rich snippet appearance.',
          playbook: 'Deploy Schema Markup'
        };
      case 'gbp':
        return {
          title: 'Google Business Profile Optimization',
          explanation: 'Enhance local search presence and improve GBP performance metrics.',
          playbook: 'Optimize GBP Profile'
        };
      case 'optimization':
        return {
          title: 'Operational Optimization',
          explanation: 'Implement autonomous optimization agents to improve operational efficiency and reduce manual effort.',
          playbook: 'Deploy Optimization Agents'
        };
      default:
        return {
          title: 'Action Required',
          explanation: 'This action requires manual intervention or additional configuration.',
          playbook: 'Execute Action'
        };
    }
  };

  const content = getDrawerContent();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-100">{content.title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ×
          </button>
        </div>
        
        <p className="text-sm text-slate-300 mb-6">{content.explanation}</p>
        
        <button 
          onClick={onClose}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{content.playbook}</span>
        </button>
      </div>
    </div>
  );
}
