"use client";

import { useEffect, useState } from "react";
import { AviReport } from "@/types/avi-report";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PillarRadarChart from "@/components/visualizations/PillarRadarChart";
import ModifiersGauge from "@/components/visualizations/ModifiersGauge";
import ClarityHeatmap from "@/components/visualizations/ClarityHeatmap";
import CounterfactualRevenue from "@/components/visualizations/CounterfactualRevenue";
import DriversBreakdown from "@/components/visualizations/DriversBreakdown";
import AnomaliesTimeline from "@/components/visualizations/AnomaliesTimeline";
import BacklogPrioritization from "@/components/visualizations/BacklogPrioritization";

interface ComprehensiveAVIDashboardProps {
  tenantId?: string;
}

export default function ComprehensiveAVIDashboard({ tenantId }: ComprehensiveAVIDashboardProps) {
  const [report, setReport] = useState<AviReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const url = tenantId
          ? `/api/avi-report?tenantId=${encodeURIComponent(tenantId)}`
          : '/api/avi-report';
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AVI report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading AVI Report...</div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-400 text-lg">{error || 'No data available'}</div>
        </div>
      </div>
    );
  }

  const getRegimeColor = (state: string) => {
    switch (state) {
      case 'Normal': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'ShiftDetected': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Quarantine': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1800px] mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Visibility Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Week of {report.asOf} • {report.windowWeeks}-week rolling analysis • Schema v{report.version}
            </p>
          </div>
          <Badge className={`px-6 py-3 text-base ${getRegimeColor(report.regimeState)}`}>
            {report.regimeState}
          </Badge>
        </div>

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 p-6">
            <h3 className="text-sm text-blue-300 mb-2 uppercase tracking-wide">AIV Score</h3>
            <div className="text-5xl font-bold text-white mb-2">{report.aivPct.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mb-3">
              CI95: {report.ci95.aiv.low.toFixed(1)} - {report.ci95.aiv.high.toFixed(1)}
            </div>
            <Progress value={report.aivPct} className="mt-3 h-3" />
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 p-6">
            <h3 className="text-sm text-purple-300 mb-2 uppercase tracking-wide">ATI Score</h3>
            <div className="text-5xl font-bold text-white mb-2">{report.atiPct.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mb-3">
              CI95: {report.ci95.ati.low.toFixed(1)} - {report.ci95.ati.high.toFixed(1)}
            </div>
            <Progress value={report.atiPct} className="mt-3 h-3" />
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 p-6">
            <h3 className="text-sm text-green-300 mb-2 uppercase tracking-wide">CRS Score</h3>
            <div className="text-5xl font-bold text-white mb-2">{report.crsPct.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mb-3">
              CI95: {report.ci95.crs.low.toFixed(1)} - {report.ci95.crs.high.toFixed(1)}
            </div>
            <Progress value={report.crsPct} className="mt-3 h-3" />
          </Card>
        </div>

        {/* Counterfactual Revenue */}
        {report.counterfactual && (
          <CounterfactualRevenue
            counterfactual={report.counterfactual}
            elasticity={report.elasticity}
            ci95={report.ci95}
          />
        )}

        {/* Five Pillars Radar */}
        <PillarRadarChart pillars={report.pillars} />

        {/* Modifiers Gauges */}
        <ModifiersGauge modifiers={report.modifiers} />

        {/* Clarity Heatmap */}
        <ClarityHeatmap clarity={report.clarity} secondarySignals={report.secondarySignals} />

        {/* Drivers Breakdown */}
        {report.drivers && report.drivers.length > 0 && (
          <DriversBreakdown drivers={report.drivers} />
        )}

        {/* Anomalies Timeline */}
        {(report.anomalies && report.anomalies.length > 0) || report.regimeState !== 'Normal' ? (
          <AnomaliesTimeline
            anomalies={report.anomalies || []}
            regimeState={report.regimeState}
          />
        ) : null}

        {/* Optimization Backlog */}
        {report.backlogSummary && report.backlogSummary.length > 0 && (
          <BacklogPrioritization backlog={report.backlogSummary} />
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-white/10">
          <p className="text-gray-500 text-sm">
            Report ID: {report.id} • Tenant: {report.tenantId}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Generated with DealershipAI Analytics Engine • Statistical methods: Kalman filtering, Bayesian regression, Monte Carlo simulation
          </p>
        </div>
      </div>
    </div>
  );
}
