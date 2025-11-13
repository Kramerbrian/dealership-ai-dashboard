type Point = { dur: number; t: number };

const buckets: Record<string, Point[]> = {};

/**
 * Track SLO performance for a given operation
 */
export function trackSLO(name: string, dur: number): void {
  const arr = buckets[name] ||= [];
  arr.push({ dur, t: Date.now() });
  
  // Keep only the last 500 measurements to prevent memory leaks
  while (arr.length > 500) arr.shift();
}

/**
 * Calculate p95 latency for a given operation
 */
export function p95(name: string): number {
  const arr = (buckets[name] || []).map(x => x.dur).sort((a, b) => a - b);
  if (!arr.length) return 0;
  return arr[Math.floor(arr.length * 0.95) - 1] || arr[arr.length - 1];
}

/**
 * Calculate p99 latency for a given operation
 */
export function p99(name: string): number {
  const arr = (buckets[name] || []).map(x => x.dur).sort((a, b) => a - b);
  if (!arr.length) return 0;
  return arr[Math.floor(arr.length * 0.99) - 1] || arr[arr.length - 1];
}

/**
 * Calculate average latency for a given operation
 */
export function avg(name: string): number {
  const arr = buckets[name] || [];
  if (!arr.length) return 0;
  return arr.reduce((sum, p) => sum + p.dur, 0) / arr.length;
}

/**
 * Check if SLO is breached for a given operation
 */
export function breach(name: string, target: number): boolean {
  return p95(name) > target;
}

/**
 * Get all SLO metrics for observability
 */
export function getAllMetrics(): Record<string, {
  p95: number;
  p99: number;
  avg: number;
  count: number;
  latest: number;
}> {
  const result: Record<string, any> = {};
  
  for (const [name, points] of Object.entries(buckets)) {
    if (points.length === 0) continue;
    
    const durations = points.map(p => p.dur).sort((a, b) => a - b);
    const latest = points[points.length - 1];
    
    result[name] = {
      p95: p95(name),
      p99: p99(name),
      avg: avg(name),
      count: points.length,
      latest: latest.dur,
      lastSeen: latest.t
    };
  }
  
  return result;
}

/**
 * Clear old measurements (older than 1 hour)
 */
export function cleanupOldMeasurements(): void {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  for (const [name, points] of Object.entries(buckets)) {
    buckets[name] = points.filter(p => p.t > oneHourAgo);
  }
}

/**
 * SLO targets for different operations
 */
export const SLO_TARGETS = {
  'api.dashboard.overview': 250,
  'api.ai-scores': 250,
  'api.content-audit': 500,
  'api.seo.metrics.query': 300,
  'api.seo.hooks.metrics': 200,
  'api.seo.ab.allocate': 150,
  'api.dealership.profile': 200,
  'api.dealership.profile.update': 300,
  'api.aeo.leaderboard': 300,
  'api.aeo.breakdown': 300,
  'api.health': 50,
  'api.quick-audit': 500,
  'api.performance-test': 100,
  'api.observability': 200,
  'api.ai.visibility-index': 300,
  'api.ai.visibility-index.post': 400,
  'api.console.query': 200,
} as const;

/**
 * Check all SLOs and return breach status
 */
export function checkAllSLOs(): Array<{
  name: string;
  p95ms: number;
  sloMs: number;
  breached: boolean;
  status: 'OK' | 'WARNING' | 'BREACHED';
}> {
  return Object.entries(SLO_TARGETS).map(([name, target]) => {
    const p95ms = p95(name);
    const breached = breach(name, target);
    const status = breached ? 'BREACHED' : (p95ms > target * 0.8 ? 'WARNING' : 'OK');
    
    return {
      name,
      p95ms,
      sloMs: target,
      breached,
      status
    };
  });
}

// Cleanup old measurements every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupOldMeasurements, 5 * 60 * 1000);
}
