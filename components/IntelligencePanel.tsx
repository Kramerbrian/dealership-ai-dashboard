/**
 * Intelligence Panel - Unified right-rail component
 * Combines metric tracking, anomaly detection, and automated fixes
 *
 * Features:
 * - "What Changed?" analyzer for metric deltas
 * - Fix Loop Executor for visibility playbooks
 * - Performance Budget Monitor for Core Web Vitals
 * - Performance Fix Executor for optimization playbooks
 *
 * Usage:
 * <IntelligencePanel mode="full" /> // All features
 * <IntelligencePanel mode="performance" /> // Performance only
 * <IntelligencePanel mode="visibility" /> // Visibility only
 */

'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Lazy-load components for better performance
const WhatChangedAnalyzer = dynamic(() => import('./WhatChangedAnalyzer'), {
  ssr: false,
  loading: () => <PanelSkeleton />
});

const FixLoopExecutor = dynamic(() => import('./FixLoopExecutor'), {
  ssr: false,
  loading: () => <PanelSkeleton />
});

const PerformanceBudgetMonitor = dynamic(() => import('./PerformanceBudgetMonitor'), {
  ssr: false,
  loading: () => <PanelSkeleton />
});

const PerfFixExecutor = dynamic(() => import('./PerfFixExecutor'), {
  ssr: false,
  loading: () => <PanelSkeleton />
});

type PanelMode = 'full' | 'performance' | 'visibility' | 'custom';

interface IntelligencePanelProps {
  mode?: PanelMode;
  showWhatChanged?: boolean;
  showFixLoop?: boolean;
  showPerformanceBudget?: boolean;
  showPerfFix?: boolean;
  className?: string;
}

function PanelSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export default function IntelligencePanel({
  mode = 'full',
  showWhatChanged,
  showFixLoop,
  showPerformanceBudget,
  showPerfFix,
  className = ''
}: IntelligencePanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Determine which components to show based on mode
  const displaySettings = {
    full: {
      whatChanged: true,
      fixLoop: true,
      performanceBudget: true,
      perfFix: true
    },
    performance: {
      whatChanged: false,
      fixLoop: false,
      performanceBudget: true,
      perfFix: true
    },
    visibility: {
      whatChanged: true,
      fixLoop: true,
      performanceBudget: false,
      perfFix: false
    },
    custom: {
      whatChanged: showWhatChanged ?? false,
      fixLoop: showFixLoop ?? false,
      performanceBudget: showPerformanceBudget ?? false,
      perfFix: showPerfFix ?? false
    }
  };

  const display = displaySettings[mode];

  if (collapsed) {
    return (
      <div className={`space-y-4 ${className}`}>
        <button
          onClick={() => setCollapsed(false)}
          className="w-full rounded-2xl border border-gray-200 bg-white/70 p-4 shadow hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Intelligence Panel</div>
              <div className="text-xs text-gray-500">Click to expand</div>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <aside className={`space-y-4 ${className}`}>
      {/* Panel Header */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-base">🧠 Intelligence Panel</div>
            <div className="text-xs text-gray-600">Real-time insights & auto-fix</div>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Collapse panel"
          >
            ←
          </button>
        </div>
      </div>

      {/* Visibility Section */}
      {(display.whatChanged || display.fixLoop) && (
        <>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
            AI Visibility
          </div>
          {display.whatChanged && <WhatChangedAnalyzer />}
          {display.fixLoop && <FixLoopExecutor />}
        </>
      )}

      {/* Performance Section */}
      {(display.performanceBudget || display.perfFix) && (
        <>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
            Performance
          </div>
          {display.performanceBudget && <PerformanceBudgetMonitor />}
          {display.perfFix && <PerfFixExecutor />}
        </>
      )}

      {/* Footer */}
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-3 shadow text-center">
        <div className="text-xs text-gray-500">
          Powered by <span className="font-semibold text-gray-700">DealerGPT 2.0</span>
        </div>
      </div>
    </aside>
  );
}

/**
 * Alternative: Tabbed Layout
 * Use this if you prefer a tabbed interface over stacked panels
 */
export function IntelligencePanelTabs({ className = '' }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<'visibility' | 'performance'>('visibility');

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white/70 shadow ${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('visibility')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'visibility'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          AI Visibility
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'performance'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Performance
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'visibility' && (
          <>
            <WhatChangedAnalyzer />
            <FixLoopExecutor />
          </>
        )}
        {activeTab === 'performance' && (
          <>
            <PerformanceBudgetMonitor />
            <PerfFixExecutor />
          </>
        )}
      </div>
    </div>
  );
}
