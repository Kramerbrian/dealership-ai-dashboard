'use client';
import { useHudStore } from '@/lib/store/hud';
import { playSonic } from '@/lib/sound/palette';
import { tap, doubleTap, success } from '@/lib/sound/haptics';

/**
 * Mock action - Deploy Auto-Fix
 * Simulates deploying an automated fix with sonic/haptic feedback
 */
export function deployMockFix(params?: { kpi?: string; delta?: string }): void {
  const { addPulse, addToast } = useHudStore.getState();

  // Start
  playSonic('autofix');
  tap();

  addPulse({
    level: 'high',
    title: 'Auto-Fix deployed',
    detail: `Patching ${params?.kpi ?? 'Schema Coverage'}…`,
    delta: params?.delta ?? '+12',
  });

  addToast('Deploying fix...', 'info', 1000);

  // Simulate async resolution (700ms)
  setTimeout(() => {
    playSonic('resolved');
    doubleTap();

    addPulse({
      level: 'medium',
      title: 'Resolution achieved',
      detail: `Re-indexed successfully. KPI recalculated.`,
      delta: params?.delta ?? '+12',
    });

    addToast('Fix deployed successfully!', 'success');
  }, 700);
}

/**
 * Mock action - Triage Incidents
 */
export function openTriage(): void {
  const { addPulse, addToast } = useHudStore.getState();

  playSonic('open');
  tap();

  addPulse({
    level: 'medium',
    title: 'Triage opened',
    detail: 'Ranking incidents by impact × urgency ÷ time',
  });

  addToast('Triage view opened', 'info');
}

/**
 * Mock action - Insights AIV
 */
export function openInsightsAIV(): void {
  const { addPulse, addToast } = useHudStore.getState();

  playSonic('pulse');
  tap();

  addPulse({
    level: 'low',
    title: 'Insights: AIV',
    detail: 'Surface visibility drivers and citations',
    delta: '+8',
  });

  addToast('AI Visibility insights loaded', 'info');
}

/**
 * Mock action - Compare Competitors
 */
export function compareCompetitors(): void {
  const { addPulse, addToast } = useHudStore.getState();

  playSonic('pulse');
  tap();

  addPulse({
    level: 'high',
    title: 'Competitive gap identified',
    detail: 'Fort Myers −6 GEO; opportunity to overtake',
    delta: '+6',
  });

  addToast('Competitor analysis complete', 'success');
}

/**
 * Mock action - Toggle Pulse
 */
export function togglePulse(): void {
  const { setPulseDock, pulseDockOpen, addToast } = useHudStore.getState();

  playSonic('click');
  tap();

  setPulseDock(!pulseDockOpen);
  addToast(`Pulse ${!pulseDockOpen ? 'opened' : 'closed'}`, 'info', 1500);
}
