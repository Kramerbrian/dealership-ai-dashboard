/**
 * Lifecycle Metrics Tracking
 * 
 * Tracks key PLG metrics:
 * - Domain-to-First Fix: < 60s
 * - Integrations / Dealer (Day 7): ≥ 2
 * - Retention (D7): > 60%
 * - Avg Unlocked Pulses: ≥ 6 / 12
 * - Time to First Value: < 2 min
 */

import { LifecycleMetrics } from './framework';
import { storeTelemetry } from '@/lib/telemetry/storage';

const METRIC_TARGETS = {
  domainToFirstFix: 60, // seconds
  integrationsDay7: 2,
  retentionDay7: 0.6, // 60%
  unlockedPulsesRatio: 0.5, // 6/12 = 0.5
  timeToFirstValue: 120 // seconds (2 minutes)
} as const;

export interface MetricEvent {
  type: 'domain_to_first_fix' | 'integration_added' | 'pulse_unlocked' | 'first_value' | 'day7_check';
  userId: string;
  tenantId: string;
  timestamp: Date;
  value?: number;
  metadata?: Record<string, any>;
}

export class LifecycleMetricsTracker {
  private metrics: Map<string, LifecycleMetrics> = new Map();

  async trackDomainToFirstFix(userId: string, tenantId: string, seconds: number): Promise<void> {
    const key = `${userId}:${tenantId}`;
    const current = this.getMetrics(userId, tenantId);
    
    current.domainToFirstFixSeconds = seconds;
    current.domainToFirstFixTimestamp = new Date();
    
    this.metrics.set(key, current);
    
    await storeTelemetry({
      event_type: 'lifecycle_metric',
      tenant_id: tenantId,
      user_id: userId,
      metadata: {
        metric: 'domain_to_first_fix',
        value: seconds,
        target: METRIC_TARGETS.domainToFirstFix,
        met_target: seconds < METRIC_TARGETS.domainToFirstFix
      },
      timestamp: new Date()
    });
  }

  async trackIntegration(userId: string, tenantId: string, integrationName: string): Promise<void> {
    const current = this.getMetrics(userId, tenantId);
    
    if (!current.integrationsList.includes(integrationName)) {
      current.integrationsList.push(integrationName);
      current.integrationsAtDay7 = current.integrationsList.length;
    }
    
    await storeTelemetry({
      event_type: 'lifecycle_metric',
      tenant_id: tenantId,
      user_id: userId,
      metadata: {
        metric: 'integration_added',
        integration: integrationName,
        total_integrations: current.integrationsAtDay7,
        target: METRIC_TARGETS.integrationsDay7,
        met_target: current.integrationsAtDay7 >= METRIC_TARGETS.integrationsDay7
      },
      timestamp: new Date()
    });
  }

  async trackPulseUnlock(userId: string, tenantId: string): Promise<void> {
    const current = this.getMetrics(userId, tenantId);
    
    current.unlockedPulsesCount++;
    current.unlockedPulsesTotal = 12; // Total available pulses
    current.unlockedPulsesRatio = current.unlockedPulsesCount / current.unlockedPulsesTotal;
    
    await storeTelemetry({
      event_type: 'lifecycle_metric',
      tenant_id: tenantId,
      user_id: userId,
      metadata: {
        metric: 'pulse_unlocked',
        count: current.unlockedPulsesCount,
        ratio: current.unlockedPulsesRatio,
        target: METRIC_TARGETS.unlockedPulsesRatio,
        met_target: current.unlockedPulsesRatio >= METRIC_TARGETS.unlockedPulsesRatio
      },
      timestamp: new Date()
    });
  }

  async trackTimeToFirstValue(userId: string, tenantId: string, seconds: number): Promise<void> {
    const current = this.getMetrics(userId, tenantId);
    
    if (!current.timeToFirstValueSeconds) {
      current.timeToFirstValueSeconds = seconds;
      current.timeToFirstValueTimestamp = new Date();
      
      await storeTelemetry({
        event_type: 'lifecycle_metric',
        tenant_id: tenantId,
        user_id: userId,
        metadata: {
          metric: 'time_to_first_value',
          value: seconds,
          target: METRIC_TARGETS.timeToFirstValue,
          met_target: seconds < METRIC_TARGETS.timeToFirstValue
        },
        timestamp: new Date()
      });
    }
  }

  async checkDay7Retention(userId: string, tenantId: string, signupDate: Date): Promise<boolean> {
    const daysSinceSignup = (Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceSignup >= 7) {
      const current = this.getMetrics(userId, tenantId);
      // Check if user has been active in last 7 days
      const isRetained = current.timeToFirstValueSeconds !== null && 
                         current.unlockedPulsesCount > 0;
      
      current.retentionDay7 = isRetained;
      current.retentionDay7Timestamp = new Date();
      
      await storeTelemetry({
        event_type: 'lifecycle_metric',
        tenant_id: tenantId,
        user_id: userId,
        metadata: {
          metric: 'day7_retention',
          retained: isRetained,
          target: METRIC_TARGETS.retentionDay7,
          met_target: isRetained
        },
        timestamp: new Date()
      });
      
      return isRetained;
    }
    
    return false;
  }

  getMetrics(userId: string, tenantId: string): LifecycleMetrics {
    const key = `${userId}:${tenantId}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        domainToFirstFixSeconds: null,
        domainToFirstFixTimestamp: null,
        integrationsAtDay7: 0,
        integrationsList: [],
        retentionDay7: false,
        retentionDay7Timestamp: null,
        unlockedPulsesCount: 0,
        unlockedPulsesTotal: 12,
        unlockedPulsesRatio: 0,
        timeToFirstValueSeconds: null,
        timeToFirstValueTimestamp: null
      });
    }
    return this.metrics.get(key)!;
  }

  getMetricsSummary(userId: string, tenantId: string) {
    const metrics = this.getMetrics(userId, tenantId);
    
    return {
      domainToFirstFix: {
        value: metrics.domainToFirstFixSeconds,
        target: METRIC_TARGETS.domainToFirstFix,
        met: metrics.domainToFirstFixSeconds !== null && metrics.domainToFirstFixSeconds < METRIC_TARGETS.domainToFirstFix
      },
      integrationsDay7: {
        value: metrics.integrationsAtDay7,
        target: METRIC_TARGETS.integrationsDay7,
        met: metrics.integrationsAtDay7 >= METRIC_TARGETS.integrationsDay7
      },
      retentionDay7: {
        value: metrics.retentionDay7,
        target: METRIC_TARGETS.retentionDay7,
        met: metrics.retentionDay7
      },
      unlockedPulses: {
        value: metrics.unlockedPulsesCount,
        ratio: metrics.unlockedPulsesRatio,
        target: METRIC_TARGETS.unlockedPulsesRatio,
        met: metrics.unlockedPulsesRatio >= METRIC_TARGETS.unlockedPulsesRatio
      },
      timeToFirstValue: {
        value: metrics.timeToFirstValueSeconds,
        target: METRIC_TARGETS.timeToFirstValue,
        met: metrics.timeToFirstValueSeconds !== null && metrics.timeToFirstValueSeconds < METRIC_TARGETS.timeToFirstValue
      }
    };
  }
}

export const lifecycleMetrics = new LifecycleMetricsTracker();
