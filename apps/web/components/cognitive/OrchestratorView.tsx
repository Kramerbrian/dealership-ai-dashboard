/**
 * Orchestrator View Panel
 * Shows HAL status, active agents, and latest ASR decisions
 */

'use client';

import { useEffect, useState } from 'react';
import { Brain, Activity, Play, Pause, RefreshCw } from 'lucide-react';
import { getPersonalityCopy } from '@/lib/cognitive-personality';

interface OrchestratorViewProps {
  dealerId: string;
}

interface OrchestratorStatus {
  confidence: number;
  autonomyEnabled: boolean;
  activeAgents: string[];
  lastOrchestration: string | null;
  orchestrationCount: number;
  currentMode: string;
  lastASR?: {
    decision: string;
    rationale: string;
    timestamp: string;
  };
}

export default function OrchestratorView({ dealerId }: OrchestratorViewProps) {
  const [status, setStatus] = useState<OrchestratorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await fetch(`/api/orchestrator/status?dealerId=${dealerId}`);
      const data = await res.json();
      setStatus(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load orchestrator status:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // Refresh every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, [dealerId]);

  const handleRunOrchestration = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId }),
      });
      if (res.ok) {
        await loadStatus();
      }
    } catch (error) {
      console.error('Failed to run orchestration:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggleAutonomy = async () => {
    try {
      const res = await fetch('/api/orchestrator/autonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId,
          enabled: !status?.autonomyEnabled,
        }),
      });
      if (res.ok) {
        await loadStatus();
      }
    } catch (error) {
      console.error('Failed to toggle autonomy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  const personality = getPersonalityCopy('tooltip');
  const confidencePercent = status ? Math.round(status.confidence * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Brain className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Orchestrator 3.0 Status</h3>
            <p className="text-xs text-gray-400">{personality.primary}</p>
          </div>
        </div>
        <button
          onClick={loadStatus}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Model Confidence</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums text-emerald-400">
              {confidencePercent}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-gray-500">Current Mode</div>
          <div className="text-sm font-medium text-white">{status?.currentMode || 'AI_CSO'}</div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-gray-500">Agents Active</div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">
              {status?.activeAgents.length || 0}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-gray-500">Orchestrations Run</div>
          <div className="text-sm font-medium text-white">
            {status?.orchestrationCount || 0}
          </div>
        </div>
      </div>

      {/* Last Orchestration */}
      {status?.lastOrchestration && (
        <div className="pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-2">Last Orchestration</div>
          <div className="text-sm text-gray-300">
            {new Date(status.lastOrchestration).toLocaleString()}
          </div>
        </div>
      )}

      {/* Latest ASR Decision */}
      {status?.lastASR && (
        <div className="pt-4 border-t border-gray-700 space-y-2">
          <div className="text-xs text-gray-500">Latest ASR Decision</div>
          <div className="rounded-lg bg-gray-800/50 p-3 space-y-2">
            <div className="text-sm font-medium text-white">{status.lastASR.decision}</div>
            <div className="text-xs text-gray-400">{status.lastASR.rationale}</div>
            <div className="text-xs text-gray-500">
              {new Date(status.lastASR.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <button
          onClick={handleRunOrchestration}
          disabled={isRunning}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Full Orchestration
            </>
          )}
        </button>
        <button
          onClick={handleToggleAutonomy}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
            status?.autonomyEnabled
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {status?.autonomyEnabled ? (
            <>
              <Pause className="h-4 w-4" />
              Pause Autonomy
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Enable Autonomy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

