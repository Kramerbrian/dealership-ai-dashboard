/**
 * Coach Policies - Orchestrator-specific rules
 */

import type { CoachEvent } from '@/packages/core-models/src/coach';

/**
 * Check if event should trigger coach in orchestrator context
 */
export function shouldTriggerCoach(event: CoachEvent): boolean {
  // Orchestrator has stricter rules - only high-severity or critical flows
  if (event.app !== 'orchestrator') {
    return true; // Dash/store can be more lenient
  }

  // In orchestrator, only trigger for:
  // - Compliance blocks (critical)
  // - High-value recommendations ignored
  // - Repeated errors
  const criticalKinds: CoachEvent['kind'][] = [
    'compliance_block_waiting',
    'error_loop',
    'override_without_reason',
  ];

  return criticalKinds.includes(event.kind);
}

/**
 * Escalate to manager if friction is persistent
 */
export function shouldEscalateToManager(
  userId: string,
  eventKind: CoachEvent['kind'],
  repeatCount: number
): boolean {
  // Escalate if:
  // - Same event type > 3 times in 24 hours
  // - High revenue at risk
  // - Critical compliance issue
  if (repeatCount >= 3) {
    return true;
  }

  if (eventKind === 'compliance_block_waiting') {
    return true;
  }

  return false;
}

