"use client";

import { useEffect, useState } from "react";
import { AviReport } from "@/types/avi-report";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnhancedAVIDashboardProps {
  tenantId?: string;
}

export default function EnhancedAVIDashboard({ tenantId }: EnhancedAVIDashboardProps) {
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
        <div className="text-white text-lg">Loading AVI Report...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-red-400 text-lg">{error || 'No data available'}</div>
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Visibility Dashboard</h1>
            <p className="text-gray-400">Week of {report.asOf} • {report.windowWeeks}-week analysis • v{report.version}</p>
          </div>
          <Badge className={`px-4 py-2 text-sm ${getRegimeColor(report.regimeState)}`}>
            {report.regimeState}
          </Badge>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-sm text-gray-400 mb-2">AIV Score</h3>
            <div className="text-4xl font-bold text-white mb-1">{report.aivPct.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">
              CI95: {report.ci95.aiv.low.toFixed(1)} - {report.ci95.aiv.high.toFixed(1)}
            </div>
            <Progress value={report.aivPct} className="mt-3 h-2" />
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-sm text-gray-400 mb-2">ATI Score</h3>
            <div className="text-4xl font-bold text-white mb-1">{report.atiPct.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">
              CI95: {report.ci95.ati.low.toFixed(1)} - {report.ci95.ati.high.toFixed(1)}
            </div>
            <Progress value={report.atiPct} className="mt-3 h-2" />
          </Card>

          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-sm text-gray-400 mb-2">CRS Score</h3>
            <div className="text-4xl font-bold text-white mb-1">{report.crsPct.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">
              CI95: {report.ci95.crs.low.toFixed(1)} - {report.ci95.crs.high.toFixed(1)}
            </div>
            <Progress value={report.crsPct} className="mt-3 h-2" />
          </Card>
        </div>

        {/* Elasticity & Counterfactual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Elasticity</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">USD per AIV Point</div>
                <div className="text-3xl font-bold text-green-400">
                  {formatCurrency(report.elasticity.usdPerPoint)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">R² Coefficient</div>
                <div className="text-2xl font-semibold">{(report.elasticity.r2 * 100).toFixed(1)}%</div>
              </div>
              <div className="text-xs text-gray-500">
                CI95: {formatCurrency(report.ci95.elasticity.low)} - {formatCurrency(report.ci95.elasticity.high)}
              </div>
            </div>
          </Card>

          {report.counterfactual && (
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Counterfactual Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Observed Revenue</span>
                  <span className="font-semibold">{formatCurrency(report.counterfactual.rarObservedUsd || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Predicted (no AI)</span>
                  <span className="font-semibold">{formatCurrency(report.counterfactual.rarCounterfactualUsd || 0)}</span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-semibold">AI Impact</span>
                    <span className="text-2xl font-bold text-green-400">
                      {formatCurrency(report.counterfactual.deltaUsd || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Tabs for detailed sections */}
        <Tabs defaultValue="pillars" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="pillars">Five Pillars</TabsTrigger>
            <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
            <TabsTrigger value="clarity">Clarity Metrics</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            {report.anomalies && report.anomalies.length > 0 && (
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            )}
            {report.backlogSummary && report.backlogSummary.length > 0 && (
              <TabsTrigger value="backlog">Optimization Backlog</TabsTrigger>
            )}
          </TabsList>

          {/* Five Pillars */}
          <TabsContent value="pillars" className="mt-6">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-6">Five Pillars of AI Visibility</h3>
              <div className="space-y-6">
                {Object.entries(report.pillars).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium uppercase text-gray-300">{key}</span>
                      <span className="text-sm font-bold">{value.toFixed(1)}%</span>
                    </div>
                    <Progress value={value} className="h-3" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Modifiers */}
          <TabsContent value="modifiers" className="mt-6">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-6">Performance Modifiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(report.modifiers).map(([key, value]) => (
                  <div key={key} className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-2xl font-bold">{value.toFixed(2)}×</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Clarity Metrics */}
          <TabsContent value="clarity" className="mt-6">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-6">Signal Clarity Metrics</h3>
              <div className="space-y-4">
                {Object.entries(report.clarity).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm font-medium uppercase text-gray-300">{key}</span>
                    <div className="flex items-center gap-3">
                      <Progress value={value * 100} className="w-32 h-2" />
                      <span className="text-sm font-bold w-12 text-right">{(value * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              {report.secondarySignals && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-lg font-semibold mb-4">Secondary Signals</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(report.secondarySignals).map(([key, value]) => (
                      value !== undefined && (
                        <div key={key} className="p-3 bg-white/5 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-lg font-bold">{value.toFixed(1)}%</div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Drivers */}
          {report.drivers && report.drivers.length > 0 && (
            <TabsContent value="drivers" className="mt-6">
              <Card className="bg-white/5 border-white/10 p-6">
                <h3 className="text-xl font-semibold mb-6">Performance Drivers</h3>
                <div className="space-y-4">
                  {report.drivers.map((driver, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Badge className={driver.metric === 'AIV' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}>
                            {driver.metric}
                          </Badge>
                          <span className="ml-3 font-medium">{driver.name}</span>
                        </div>
                        <span className="text-xl font-bold text-green-400">
                          +{driver.contribution.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          )}

          {/* Anomalies */}
          {report.anomalies && report.anomalies.length > 0 && (
            <TabsContent value="anomalies" className="mt-6">
              <Card className="bg-white/5 border-white/10 p-6">
                <h3 className="text-xl font-semibold mb-6">Detected Anomalies</h3>
                <div className="space-y-4">
                  {report.anomalies.map((anomaly, idx) => (
                    <div key={idx} className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{anomaly.signal}</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          z-score: {anomaly.zScore.toFixed(2)}
                        </Badge>
                      </div>
                      {anomaly.note && (
                        <p className="text-sm text-gray-300">{anomaly.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          )}

          {/* Optimization Backlog */}
          {report.backlogSummary && report.backlogSummary.length > 0 && (
            <TabsContent value="backlog" className="mt-6">
              <Card className="bg-white/5 border-white/10 p-6">
                <h3 className="text-xl font-semibold mb-6">Optimization Backlog</h3>
                <div className="space-y-4">
                  {report.backlogSummary.map((task) => (
                    <div key={task.taskId} className="p-5 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-500/20 text-blue-400">{task.taskId}</Badge>
                            {task.banditScore && (
                              <Badge className="bg-green-500/20 text-green-400">
                                Score: {task.banditScore.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold">{task.title}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Effort</div>
                          <div className="text-lg font-bold">{task.effortPoints} pts</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">AIV Impact</div>
                          <div className="text-sm font-semibold text-green-400">
                            +{task.estDeltaAivLow.toFixed(1)} to +{task.estDeltaAivHigh.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Revenue Impact</div>
                          <div className="text-sm font-semibold text-green-400">
                            {formatCurrency(task.projectedImpactLowUsd)} - {formatCurrency(task.projectedImpactHighUsd)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
