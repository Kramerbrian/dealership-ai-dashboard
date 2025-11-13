/**
 * Client-Safe SLO Tracking
 * Performance monitoring for client-side operations
 */

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
 * Get all SLO metrics
 */
export function getAllSLOs(): Record<string, { p95: number; p99: number; count: number }> {
  const result: Record<string, { p95: number; p99: number; count: number }> = {};
  
  for (const [name, arr] of Object.entries(buckets)) {
    result[name] = {
      p95: p95(name),
      p99: p99(name),
      count: arr.length
    };
  }
  
  return result;
}

/**
 * Clear SLO data for a specific operation
 */
export function clearSLO(name: string): void {
  delete buckets[name];
}

/**
 * Clear all SLO data
 */
export function clearAllSLOs(): void {
  Object.keys(buckets).forEach(key => delete buckets[key]);
}