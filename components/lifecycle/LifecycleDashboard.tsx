"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';
import { lifecycleMetrics } from '@/lib/lifecycle/metrics';
import { LIFECYCLE_STAGES, getStageProgress, type LifecycleStage } from '@/lib/lifecycle/framework';

interface MetricsSummary {
  domainToFirstFix: { value: number | null; target: number; met: boolean };
  integrationsDay7: { value: number; target: number; met: boolean };
  retentionDay7: { value: boolean; target: number; met: boolean };
  unlockedPulses: { value: number; ratio: number; target: number; met: boolean };
  timeToFirstValue: { value: number | null; target: number; met: boolean };
}

export default function LifecycleDashboard({ userId, tenantId }: { userId: string; tenantId: string }) {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [currentStage, setCurrentStage] = useState<LifecycleStage>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch(`/api/lifecycle/metrics?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
          // Determine current stage based on metrics
          determineStage(data.metrics);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetrics();
  }, [userId]);

  function determineStage(metrics: MetricsSummary) {
    if (metrics.retentionDay7.met) {
      setCurrentStage('retained');
    } else if (metrics.integrationsDay7.met) {
      setCurrentStage('integrated');
    } else if (metrics.domainToFirstFix.met) {
      setCurrentStage('activated');
    } else if (metrics.unlockedPulses.met) {
      setCurrentStage('personalized');
    } else if (metrics.timeToFirstValue.met) {
      setCurrentStage('recognized');
    } else {
      setCurrentStage('idle');
    }
  }

  if (loading) {
    return <div className="p-6">Loading lifecycle metrics...</div>;
  }

  if (!metrics) {
    return <div className="p-6">No metrics available</div>;
  }

  const progress = getStageProgress(currentStage);

  return (
    <div className="p-6 space-y-6">
      <div className="border rounded-lg p-6 bg-white/80 backdrop-blur">
        <h2 className="text-2xl font-semibold mb-4">Customer Lifecycle</h2>
        
        {/* Stage Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Current Stage: <strong className="text-gray-900">{currentStage}</strong></span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-blue-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {LIFECYCLE_STAGES.map((stage) => (
              <span key={stage} className={currentStage === stage ? 'font-semibold text-blue-600' : ''}>
                {stage}
              </span>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Domain-to-First Fix"
            value={metrics.domainToFirstFix.value ? `${metrics.domainToFirstFix.value}s` : 'Not started'}
            target={`< ${metrics.domainToFirstFix.target}s`}
            met={metrics.domainToFirstFix.met}
            why="Proves "magnetic" pull"
          />
          <MetricCard
            title="Integrations (Day 7)"
            value={`${metrics.integrationsDay7.value} / ${metrics.integrationsDay7.target}`}
            target="≥ 2"
            met={metrics.integrationsDay7.met}
            why="PLG adoption"
          />
          <MetricCard
            title="Retention (D7)"
            value={metrics.retentionDay7.value ? 'Retained' : 'Not retained'}
            target="> 60%"
            met={metrics.retentionDay7.met}
            why="Curiosity sustained"
          />
          <MetricCard
            title="Unlocked Pulses"
            value={`${metrics.unlockedPulses.value} / 12`}
            target="≥ 6 / 12"
            met={metrics.unlockedPulses.met}
            why="Engagement"
          />
          <MetricCard
            title="Time to First Value"
            value={metrics.timeToFirstValue.value ? `${metrics.timeToFirstValue.value}s` : 'Not started'}
            target={`< ${metrics.timeToFirstValue.target}s`}
            met={metrics.timeToFirstValue.met}
            why="Immediate dopamine"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, target, met, why }: {
  title: string;
  value: string;
  target: string;
  met: boolean;
  why: string;
}) {
  return (
    <motion.div
      className={`p-4 rounded-lg border ${
        met ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        {met ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Clock className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-600">Target: {target}</div>
      <div className="text-xs text-gray-500 mt-1">{why}</div>
    </motion.div>
  );
}
