'use client';

/**
 * Orchestrator Status Panel
 * Shows AI CSO status, confidence, and active agents
 */

import React, { useState, useEffect } from 'react';
import { Activity, Brain, Zap, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface OrchestratorStatus {
  status: 'active' | 'degraded' | 'critical';
  dealerId: string;
  confidence: number;
  lastSync: string;
  agentsRunning: number;
  platformMode: string;
  orchestratorRole: string;
}

interface OrchestratorStatusPanelProps {
  dealerId: string;
}

export default function OrchestratorStatusPanel({ dealerId }: OrchestratorStatusPanelProps) {
  const [status, setStatus] = useState<OrchestratorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [dealerId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/orchestrator?dealerId=${dealerId}`);
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullOrchestration = async () => {
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_asr',
          dealerId
        })
      });
      if (response.ok) {
        fetchStatus(); // Refresh status
      }
    } catch (err) {
      console.error('Orchestration error:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-800 rounded w-1/4" />
          <div className="h-8 bg-slate-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-slate-900/80 border border-red-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load orchestrator status</span>
        </div>
      </div>
    );
  }

  const statusColor = 
    status.status === 'active' ? 'text-green-400' :
    status.status === 'degraded' ? 'text-yellow-400' : 'text-red-400';

  const confidenceColor =
    status.confidence >= 0.9 ? 'text-green-400' :
    status.confidence >= 0.75 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Orchestrator 3.0 Status</h3>
          </div>
          <p className="text-sm text-slate-400">AI Chief Strategy Officer</p>
        </div>
        <div className={`flex items-center gap-2 ${statusColor}`}>
          <Activity className="w-5 h-5" />
          <span className="font-medium capitalize">{status.status}</span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Model Confidence</div>
          <div className={`text-2xl font-bold ${confidenceColor}`}>
            {(status.confidence * 100).toFixed(1)}%
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all ${
                status.confidence >= 0.9 ? 'bg-green-500' :
                status.confidence >= 0.75 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${status.confidence * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Active Agents</div>
          <div className="text-2xl font-bold text-white">{status.agentsRunning}</div>
          <div className="text-xs text-slate-500 mt-1">Running in parallel</div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Platform Mode</div>
          <div className="text-lg font-semibold text-blue-400">{status.platformMode}</div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Last Sync</div>
          <div className="text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date(status.lastSync).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleRunFullOrchestration}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                   rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all
                   shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
      >
        <Zap className="w-5 h-5" />
        Run Full Orchestration
      </button>

      {/* Latest ASR Preview */}
      <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-slate-300">AI CSO Active</span>
        </div>
        <p className="text-xs text-slate-400">
          Orchestrator is continuously scanning, diagnosing, and prescribing improvements.
          The AI Chief Strategy Officer is operating in <span className="text-blue-400">{status.orchestratorRole}</span> mode.
        </p>
      </div>
    </div>
  );
}

