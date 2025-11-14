/**
 * Orchestrator Console Dashboard
 * Internal admin dashboard for monitoring orchestrator execution, system health, and governance status
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  RefreshCw,
  Download,
  Settings,
} from 'lucide-react';

interface SystemState {
  timestamp: string;
  orchestrator: {
    success: boolean;
    duration: number;
    jobsExecuted: number;
    jobsFailed: number;
    governancePassed: boolean;
    lighthouseScore?: number;
    safeModeTriggered: boolean;
  };
  lastRun: string;
}

interface JobStatus {
  id: string;
  success: boolean;
  duration: string;
  lastRun: string;
}

export default function OrchestratorConsolePage() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [jobs, setJobs] = useState<Record<string, JobStatus>>({});

  const fetchSystemState = async () => {
    try {
      const res = await fetch('/api/orchestrator/status');
      const data = await res.json();
      
      if (data.state) {
        setSystemState(data.state);
      }
      
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch system state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemState();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemState, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString();
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f14] text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-zinc-400">Loading orchestrator state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Orchestrator Console</h1>
            <p className="text-zinc-400 text-sm">
              System health, job execution, and governance status
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                autoRefresh
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={fetchSystemState}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition border border-zinc-700"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh Now
            </button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-white/5 p-6 border-zinc-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-400">Overall Status</h3>
              {systemState && getStatusIcon(systemState.orchestrator.success)}
            </div>
            <div className="text-2xl font-semibold mb-2">
              {systemState?.orchestrator.success ? 'Healthy' : 'Degraded'}
            </div>
            <div className="text-sm text-zinc-400">
              Last run: {systemState ? formatTimestamp(systemState.timestamp) : 'Never'}
            </div>
          </motion.div>

          {/* Jobs Executed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border bg-white/5 p-6 border-zinc-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-400">Jobs Executed</h3>
              <Activity className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="text-2xl font-semibold mb-2">
              {systemState?.orchestrator.jobsExecuted || 0}
            </div>
            <div className="text-sm text-zinc-400">
              {systemState?.orchestrator.jobsFailed || 0} failed
            </div>
          </motion.div>

          {/* Governance Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border bg-white/5 p-6 border-zinc-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-400">Governance</h3>
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-semibold mb-2">
              {systemState?.orchestrator.governancePassed ? 'Passed' : 'Failed'}
            </div>
            <div className="text-sm text-zinc-400">
              {systemState?.orchestrator.safeModeTriggered ? '⚠️ Safe mode active' : '✅ Normal'}
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Execution Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border bg-white/5 p-6 border-zinc-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-400">Execution Time</h3>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-semibold">
              {systemState ? formatDuration(systemState.orchestrator.duration) : 'N/A'}
            </div>
          </motion.div>

          {/* Lighthouse Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border bg-white/5 p-6 border-zinc-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-400">Lighthouse Score</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-semibold">
              {systemState?.orchestrator.lighthouseScore || 'N/A'}
            </div>
            {systemState?.orchestrator.lighthouseScore && (
              <div className="mt-2">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all"
                    style={{ width: `${systemState.orchestrator.lighthouseScore}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Job Status Table */}
        {Object.keys(jobs).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border bg-white/5 p-6 border-zinc-800"
          >
            <h3 className="text-lg font-semibold mb-4">Job Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Job ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Last Run</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(jobs).map(([id, job]) => (
                    <tr key={id} className="border-b border-zinc-800/50">
                      <td className="py-3 px-4 text-sm font-mono">{id}</td>
                      <td className="py-3 px-4">
                        {getStatusIcon(job.success)}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-400">{job.duration}</td>
                      <td className="py-3 px-4 text-sm text-zinc-400">
                        {formatTimestamp(job.lastRun)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              fetch('/api/orchestrator-background', { method: 'POST' });
              setTimeout(fetchSystemState, 2000);
            }}
            className="px-6 py-3 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition"
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Trigger Orchestrator Now
          </button>
          <button
            onClick={() => {
              const data = JSON.stringify(systemState, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `orchestrator-state-${Date.now()}.json`;
              a.click();
            }}
            className="px-6 py-3 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition border border-zinc-700"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Export State
          </button>
        </div>
      </div>
    </div>
  );
}

