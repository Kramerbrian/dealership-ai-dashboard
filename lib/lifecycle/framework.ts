/**
 * Customer Lifecycle Framework
 * 
 * Tracks user progression through: Idle → Recognized → Personalized → Activated → Integrated → Retained
 */

export type LifecycleStage = 
  | 'idle'
  | 'recognized'
  | 'personalized'
  | 'activated'
  | 'integrated'
  | 'retained';

export interface LifecycleState {
  stage: LifecycleStage;
  userId: string;
  tenantId: string;
  enteredAt: Date;
  metadata?: Record<string, any>;
}

export interface LifecycleMetrics {
  // Domain-to-First Fix: < 60s (proves "magnetic" pull)
  domainToFirstFixSeconds: number | null;
  domainToFirstFixTimestamp: Date | null;
  
  // Integrations / Dealer (Day 7): ≥ 2 (PLG adoption)
  integrationsAtDay7: number;
  integrationsList: string[];
  
  // Retention (D7): > 60% (curiosity sustained)
  retentionDay7: boolean;
  retentionDay7Timestamp: Date | null;
  
  // Avg Unlocked Pulses: ≥ 6 / 12 (engagement)
  unlockedPulsesCount: number;
  unlockedPulsesTotal: number;
  unlockedPulsesRatio: number;
  
  // Time to First Value: < 2 min (immediate dopamine)
  timeToFirstValueSeconds: number | null;
  timeToFirstValueTimestamp: Date | null;
}

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  'idle',
  'recognized',
  'personalized',
  'activated',
  'integrated',
  'retained'
];

export function getNextStage(current: LifecycleStage): LifecycleStage | null {
  const index = LIFECYCLE_STAGES.indexOf(current);
  return index < LIFECYCLE_STAGES.length - 1 ? LIFECYCLE_STAGES[index + 1] : null;
}

export function getStageProgress(stage: LifecycleStage): number {
  const index = LIFECYCLE_STAGES.indexOf(stage);
  return ((index + 1) / LIFECYCLE_STAGES.length) * 100;
}

export function isStageComplete(stage: LifecycleStage, metrics: LifecycleMetrics): boolean {
  switch (stage) {
    case 'idle':
      return true; // Always starts here
    case 'recognized':
      return metrics.timeToFirstValueSeconds !== null && metrics.timeToFirstValueSeconds < 120;
    case 'personalized':
      return metrics.unlockedPulsesRatio >= 0.5; // ≥ 6/12
    case 'activated':
      return metrics.domainToFirstFixSeconds !== null && metrics.domainToFirstFixSeconds < 60;
    case 'integrated':
      return metrics.integrationsAtDay7 >= 2;
    case 'retained':
      return metrics.retentionDay7 === true;
    default:
      return false;
  }
}
