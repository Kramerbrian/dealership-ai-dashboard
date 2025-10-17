/**
 * EXAMPLE: Complete Dashboard Page with Performance Monitoring
 *
 * This file demonstrates how to integrate the Performance Budget Monitor
 * and related intelligence components into your dashboard.
 *
 * Copy sections as needed into your actual dashboard pages.
 */

'use client';

import IntelligencePanel, { IntelligencePanelTabs } from '@/components/IntelligencePanel';
import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

// ============================================================================
// EXAMPLE 1: Full Intelligence Panel (Right Rail)
// ============================================================================

export function DashboardWithIntelligencePanel() {
  // Initialize Web Vitals tracking
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Main Content Area */}
          <main className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            {/* Your existing dashboard content */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <p className="text-gray-600">Your main dashboard content goes here...</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
                <h3 className="font-semibold mb-2">Metric 1</h3>
                <div className="text-3xl font-bold text-blue-600">87%</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
                <h3 className="font-semibold mb-2">Metric 2</h3>
                <div className="text-3xl font-bold text-green-600">94%</div>
              </div>
            </div>
          </main>

          {/* Intelligence Panel - Right Rail */}
          <IntelligencePanel mode="full" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Performance-Only Panel
// ============================================================================

export function PerformanceDashboard() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <main className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Performance Monitoring</h1>
            {/* Your content */}
          </main>

          {/* Performance-only panel */}
          <IntelligencePanel mode="performance" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Tabbed Intelligence Panel (Single Column)
// ============================================================================

export function DashboardWithTabs() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Main metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
            <h3 className="font-semibold mb-2">AI Visibility</h3>
            <div className="text-3xl font-bold text-blue-600">78%</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
            <h3 className="font-semibold mb-2">Trust Score</h3>
            <div className="text-3xl font-bold text-green-600">82%</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
            <h3 className="font-semibold mb-2">Performance</h3>
            <div className="text-3xl font-bold text-yellow-600">68%</div>
          </div>
        </div>

        {/* Tabbed intelligence panel */}
        <IntelligencePanelTabs />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Custom Component Selection
// ============================================================================

export function DashboardCustom() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <main className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Custom Dashboard</h1>
            {/* Your content */}
          </main>

          {/* Custom selection: Only show performance monitoring */}
          <IntelligencePanel
            mode="custom"
            showWhatChanged={false}
            showFixLoop={false}
            showPerformanceBudget={true}
            showPerfFix={true}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Inline Performance Widgets (No Side Panel)
// ============================================================================

import dynamic from 'next/dynamic';

const PerformanceBudgetMonitor = dynamic(
  () => import('@/components/PerformanceBudgetMonitor'),
  { ssr: false }
);
const PerfFixExecutor = dynamic(
  () => import('@/components/PerfFixExecutor'),
  { ssr: false }
);

export function DashboardInline() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Inline performance widgets in main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PerformanceBudgetMonitor />
          <PerfFixExecutor />
        </div>

        {/* Other dashboard content below */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Additional Content</h2>
          {/* ... */}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Mobile-Optimized Layout
// ============================================================================

export function DashboardMobile() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {/* Mobile: Stack everything vertically */}
        <div className="space-y-4">
          {/* Use tabbed interface on mobile to save space */}
          <IntelligencePanelTabs className="lg:hidden" />

          {/* Main content */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow">
            <h2 className="text-lg font-semibold mb-3">Overview</h2>
            {/* ... */}
          </div>

          {/* Desktop: Show side panel */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">{/* Main content */}</div>
            <IntelligencePanel mode="full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Integration with Existing Pages
// ============================================================================

/**
 * To integrate into your existing pages:
 *
 * 1. Add Web Vitals tracking to app/layout.tsx:
 *
 *    import { reportWebVitals } from '@/lib/web-vitals';
 *    useEffect(() => { reportWebVitals(); }, []);
 *
 * 2. Add IntelligencePanel to your dashboard:
 *
 *    import IntelligencePanel from '@/components/IntelligencePanel';
 *
 *    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
 *      <main>{existing content}</main>
 *      <IntelligencePanel mode="full" />
 *    </div>
 *
 * 3. That's it! The components will automatically:
 *    - Track Web Vitals in real-time
 *    - Display performance metrics
 *    - Offer automated fix playbooks
 *    - Show visibility tracking
 */

// ============================================================================
// EXAMPLE 8: Programmatic Interaction
// ============================================================================

import { reportCustomMetric } from '@/lib/web-vitals';

export function DashboardWithCustomMetrics() {
  useEffect(() => {
    reportWebVitals();

    // Track custom business metrics
    const trackCustomMetrics = async () => {
      // Example: Track time to first interaction
      const startTime = performance.now();

      // ... user interacts with page ...

      const interactionTime = performance.now() - startTime;
      reportCustomMetric('time-to-first-interaction', interactionTime, {
        page: window.location.pathname,
        userType: 'dealer'
      });
    };

    trackCustomMetrics();
  }, []);

  // Example: Trigger performance fix programmatically
  const handleOptimizeClick = async () => {
    const response = await fetch('/api/perf-fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playbookId: 'optimize-images',
        dryRun: false
      })
    });

    const result = await response.json();
    console.log('Optimization result:', result);

    // Show notification to user
    alert(`Optimization complete! Expected improvement: ${result.expectedImprovement}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleOptimizeClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
        >
          Optimize Performance Now
        </button>

        <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
          <main>{/* Your content */}</main>
          <IntelligencePanel mode="full" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Export all examples
// ============================================================================

export default DashboardWithIntelligencePanel;
