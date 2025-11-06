"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Clock, Activity, Zap, Shield, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ComponentStatus {
  name: string;
  status: string;
  lastRun?: string;
  nextRun?: string;
  lastCheck?: string;
  nextCheck?: string;
  lastPolicyUpdate?: string;
  confidence?: number;
  activeAgents?: number;
  lastFix?: string;
  version: string;
}

interface OrchestratorStatus {
  phase: string;
  components: ComponentStatus[];
  governance: {
    apiCostRemaining: number;
    rewardThreshold: number;
    rollbackEnabled: boolean;
  };
  telemetry: {
    metricsStore: string;
    auditTrailEnabled: boolean;
    retentionDays: number;
  };
  timestamp: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  "adaptive-weight-learner": Brain,
  "drift-sentinel": Shield,
  "rl-controller": Zap,
  "auto-fix-agents": Activity,
};

const statusColors: Record<string, string> = {
  active: "text-green-400",
  scheduled: "text-blue-400",
  paused: "text-yellow-400",
  error: "text-red-400",
};

export default function OrchestratorStatus() {
  const [status, setStatus] = useState<OrchestratorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/orchestrator/status", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch orchestrator status:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(isoString?: string): string {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (Math.abs(diffMins) < 1) return "Just now";
    if (diffMins < 0) return `${Math.abs(diffMins)}m ago`;
    return `in ${diffMins}m`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-red-400">
        <AlertCircle className="w-6 h-6 inline mr-2" />
        {error || "Failed to load orchestrator status"}
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            Autonomic Orchestrator Status
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Phase: <span className="text-green-400 font-semibold">{status.phase.toUpperCase()}</span>
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Last updated: {formatTime(status.timestamp)}
        </div>
      </div>

      {/* Component Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {status.components.map((component) => {
          const Icon = iconMap[component.name] || Activity;
          const statusColor = statusColors[component.status] || "text-slate-400";

          return (
            <Card key={component.name} className="bg-slate-800/50 border border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-white capitalize">
                        {component.name.replace(/-/g, " ")}
                      </h3>
                      <p className="text-xs text-slate-400">v{component.version}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${statusColor}`}>
                    {component.status === "active" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium capitalize">{component.status}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  {component.lastRun && (
                    <div>Last run: {formatTime(component.lastRun)}</div>
                  )}
                  {component.nextRun && (
                    <div>Next run: {formatTime(component.nextRun)}</div>
                  )}
                  {component.lastCheck && (
                    <div>Last check: {formatTime(component.lastCheck)}</div>
                  )}
                  {component.lastPolicyUpdate && (
                    <div>Policy updated: {formatTime(component.lastPolicyUpdate)}</div>
                  )}
                  {component.confidence !== undefined && (
                    <div className="text-green-400">
                      Confidence: {(component.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                  {component.activeAgents !== undefined && (
                    <div>Active agents: {component.activeAgents}</div>
                  )}
                  {component.lastFix && (
                    <div>Last fix: {formatTime(component.lastFix)}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Governance & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold text-white mb-3">Governance</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>API Cost Remaining:</span>
                <span className="text-green-400">
                  ${status.governance.apiCostRemaining.toFixed(2)}/dealer/month
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reward Threshold:</span>
                <span className="text-blue-400">{status.governance.rewardThreshold}x</span>
              </div>
              <div className="flex justify-between">
                <span>Auto Rollback:</span>
                <span className={status.governance.rollbackEnabled ? "text-green-400" : "text-red-400"}>
                  {status.governance.rollbackEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold text-white mb-3">Telemetry</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div>
                <span className="text-slate-400">Metrics Store:</span>
                <div className="text-xs text-slate-500 mt-1 break-all">
                  {status.telemetry.metricsStore}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Audit Trail:</span>
                <span className={status.telemetry.auditTrailEnabled ? "text-green-400" : "text-red-400"}>
                  {status.telemetry.auditTrailEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Retention:</span>
                <span>{status.telemetry.retentionDays} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

