import { NextResponse } from 'next/server';

/**
 * Add Server-Timing header to response
 */
export function addServerTiming(
  response: NextResponse,
  name: string,
  duration: number,
  description?: string
): NextResponse {
  const timing = description 
    ? `${name};dur=${duration.toFixed(1)};desc="${description}"`
    : `${name};dur=${duration.toFixed(1)}`;
  
  const existing = response.headers.get('Server-Timing');
  const newTiming = existing ? `${existing}, ${timing}` : timing;
  
  response.headers.set('Server-Timing', newTiming);
  return response;
}

/**
 * Timing decorator for functions
 */
export function withTiming<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
) {
  return async (...args: T): Promise<{ result: R; duration: number }> => {
    const start = performance.now();
    const result = await fn(...args);
    const duration = performance.now() - start;
    
    console.log(`[Server-Timing] ${name}: ${duration.toFixed(1)}ms`);
    
    return { result, duration };
  };
}

/**
 * Performance measurement utility
 */
export class PerformanceTimer {
  private startTime: number;
  private measurements: Map<string, number> = new Map();
  
  constructor() {
    this.startTime = performance.now();
  }
  
  mark(name: string): void {
    const now = performance.now();
    const duration = now - this.startTime;
    this.measurements.set(name, duration);
  }
  
  getTimings(): Record<string, number> {
    return Object.fromEntries(this.measurements);
  }
  
  addToResponse(response: NextResponse): NextResponse {
    for (const [name, duration] of this.measurements) {
      addServerTiming(response, name, duration);
    }
    return response;
  }
}

/**
 * SLO monitoring utilities
 */
export const SLO_TARGETS = {
  READ_P95: 150, // 150ms for 95th percentile reads
  WRITE_P95: 400, // 400ms for 95th percentile writes
  UPTIME: 99.9, // 99.9% uptime
} as const;

export function checkSLO(
  operation: 'read' | 'write',
  duration: number
): { passed: boolean; target: number; actual: number } {
  const target = operation === 'read' ? SLO_TARGETS.READ_P95 : SLO_TARGETS.WRITE_P95;
  const passed = duration <= target;
  
  return {
    passed,
    target,
    actual: duration,
  };
}
