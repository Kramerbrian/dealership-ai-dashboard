// src/lib/monitoring.ts

import * as Sentry from '@sentry/nextjs';

interface MetricEvent {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

class Monitoring {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
    
    if (this.enabled) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
      });
    }
  }

  trackMetric(event: MetricEvent): void {
    if (!this.enabled) return;

    // Send to your monitoring service (Datadog, New Relic, etc.)
    console.log(`[METRIC] ${event.name}: ${event.value}`, event.tags);
  }

  trackError(error: Error, context?: Record<string, any>): void {
    console.error('[ERROR]', error, context);

    if (this.enabled) {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  trackCacheHit(key: string, strategy: string): void {
    this.trackMetric({
      name: 'cache.hit',
      value: 1,
      tags: { strategy, key_prefix: key.split(':')[0] },
    });
  }

  trackCacheMiss(key: string): void {
    this.trackMetric({
      name: 'cache.miss',
      value: 1,
      tags: { key_prefix: key.split(':')[0] },
    });
  }

  trackAIQuery(provider: string, cost: number): void {
    this.trackMetric({
      name: 'ai.query',
      value: 1,
      tags: { provider },
    });

    this.trackMetric({
      name: 'ai.cost',
      value: cost,
      tags: { provider },
    });
  }

  trackAPILatency(endpoint: string, ms: number): void {
    this.trackMetric({
      name: 'api.latency',
      value: ms,
      tags: { endpoint },
    });
  }

  async trackAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      this.trackMetric({
        name: `${name}.duration`,
        value: duration,
        tags: { status: 'success' },
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      this.trackMetric({
        name: `${name}.duration`,
        value: duration,
        tags: { status: 'error' },
      });
      
      this.trackError(error as Error, { operation: name });
      throw error;
    }
  }
}

export const monitoring = new Monitoring();
