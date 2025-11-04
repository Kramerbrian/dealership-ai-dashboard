/**
 * Advanced Analytics & Funnels
 * 
 * Tracks user journeys, conversion funnels, and cohort analysis
 */

import { logger } from './logger';

interface FunnelStep {
  step: string;
  name: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

interface Cohort {
  cohortId: string; // e.g., "2025-01-15"
  userId: string;
  firstSeen: Date;
  events: FunnelStep[];
}

const funnels: Map<string, FunnelStep[]> = new Map();
const cohorts: Map<string, Cohort> = new Map();
const MAX_FUNNEL_STEPS = 1000;

/**
 * Track a funnel step
 */
export async function trackFunnelStep(
  funnelId: string,
  step: string,
  name: string,
  options?: {
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }
): Promise<void> {
  const funnelStep: FunnelStep = {
    step,
    name,
    timestamp: new Date(),
    userId: options?.userId,
    sessionId: options?.sessionId || 'anonymous',
    properties: options?.properties,
  };

  const steps = funnels.get(funnelId) || [];
  steps.push(funnelStep);

  // Keep only recent steps
  if (steps.length > MAX_FUNNEL_STEPS) {
    steps.shift();
  }

  funnels.set(funnelId, steps);

  // Log for analytics
  await logger.info('Funnel step tracked', {
    funnelId,
    step,
    name,
    userId: options?.userId,
  });
}

/**
 * Get funnel conversion rate
 */
export function getFunnelConversion(
  funnelId: string,
  steps: string[]
): {
  steps: Array<{
    step: string;
    name: string;
    count: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
  overallConversion: number;
} {
  const funnelSteps = funnels.get(funnelId) || [];

  const stepCounts = steps.map((step, index) => {
    const count = funnelSteps.filter(s => s.step === step).length;
    const previousCount = index > 0 
      ? funnelSteps.filter(s => s.step === steps[index - 1]).length 
      : funnelSteps.length;

    return {
      step,
      name: funnelSteps.find(s => s.step === step)?.name || step,
      count,
      conversionRate: previousCount > 0 ? count / previousCount : 0,
      dropoffRate: previousCount > 0 ? (previousCount - count) / previousCount : 0,
    };
  });

  const overallConversion = funnelSteps.length > 0
    ? stepCounts[stepCounts.length - 1].count / funnelSteps.length
    : 0;

  return {
    steps: stepCounts,
    overallConversion,
  };
}

/**
 * Track cohort
 */
export function trackCohort(
  userId: string,
  cohortId: string = new Date().toISOString().split('T')[0] // Default to today
): void {
  if (!cohorts.has(userId)) {
    cohorts.set(userId, {
      cohortId,
      userId,
      firstSeen: new Date(),
      events: [],
    });
  }
}

/**
 * Add event to cohort
 */
export function addCohortEvent(
  userId: string,
  event: string,
  properties?: Record<string, any>
): void {
  const cohort = cohorts.get(userId);
  if (cohort) {
    cohort.events.push({
      step: event,
      name: event,
      timestamp: new Date(),
      userId,
      properties,
    });
  }
}

/**
 * Get cohort retention
 */
export function getCohortRetention(cohortId: string, days: number = 30): {
  cohortId: string;
  totalUsers: number;
  retentionByDay: Record<number, number>;
} {
  const cohortUsers = Array.from(cohorts.values()).filter(c => c.cohortId === cohortId);

  const retentionByDay: Record<number, number> = {};

  for (let day = 1; day <= days; day++) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - day);

    const activeUsers = cohortUsers.filter(user => {
      const recentEvents = user.events.filter(e => e.timestamp >= cutoffDate);
      return recentEvents.length > 0;
    }).length;

    retentionByDay[day] = cohortUsers.length > 0 
      ? activeUsers / cohortUsers.length 
      : 0;
  }

  return {
    cohortId,
    totalUsers: cohortUsers.length,
    retentionByDay,
  };
}

/**
 * Get user journey
 */
export function getUserJourney(userId: string): FunnelStep[] {
  const cohort = cohorts.get(userId);
  return cohort?.events || [];
}

