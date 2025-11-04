/**
 * Performance Monitoring Middleware
 * Tracks API response times, errors, and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  requestId?: string;
  userId?: string;
  error?: string;
}

// In-memory metrics store (for development)
// In production, send to monitoring service
const metricsStore: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

/**
 * Performance monitoring wrapper
 * Wraps API route handlers to track performance
 */
export function withPerformanceMonitoring<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  endpoint: string
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const startTime = Date.now();
    const requestId = req.headers.get('x-request-id') || generateRequestId();
    const userId = req.headers.get('x-user-id') || undefined;
    
    let response: NextResponse<T>;
    let error: Error | null = null;
    
    try {
      // Add request ID to headers
      req.headers.set('x-request-id', requestId);
      
      // Execute handler
      response = await handler(req);
      
      // Record metrics
      const duration = Date.now() - startTime;
      await recordMetrics({
        endpoint,
        method: req.method,
        duration,
        status: response.status,
        timestamp: Date.now(),
        requestId,
        userId,
      });
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('X-Request-ID', requestId);
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow request detected: ${endpoint} took ${duration}ms`);
      }
      
      return response;
      
    } catch (err) {
      error = err instanceof Error ? err : new Error('Unknown error');
      const duration = Date.now() - startTime;
      
      // Record error metrics
      await recordMetrics({
        endpoint,
        method: req.method,
        duration,
        status: 500,
        timestamp: Date.now(),
        requestId,
        userId,
        error: error.message,
      });
      
      // Return error response instead of throwing
      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'An unexpected error occurred',
          requestId,
          timestamp: new Date().toISOString(),
        },
        { 
          status: 500,
          headers: {
            'X-Request-ID': requestId,
            'X-Response-Time': `${duration}ms`,
          },
        }
      ) as NextResponse<T>;
    }
  };
}

/**
 * Record performance metrics
 */
async function recordMetrics(metrics: PerformanceMetrics): Promise<void> {
  // Add to in-memory store
  metricsStore.push(metrics);
  
  // Keep only last N metrics
  if (metricsStore.length > MAX_METRICS) {
    metricsStore.shift();
  }
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Send to monitoring service (e.g., Datadog, New Relic, Sentry)
      await sendToMonitoringService(metrics);
    } catch (error) {
      console.error('Failed to send metrics to monitoring service:', error);
    }
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metrics.method} ${metrics.endpoint} - ${metrics.duration}ms - ${metrics.status}`);
  }
}

/**
 * Send metrics to monitoring service
 */
async function sendToMonitoringService(metrics: PerformanceMetrics): Promise<void> {
  // Implement integration with your monitoring service
  // Example: Datadog, New Relic, Sentry, or custom endpoint
  
  if (process.env.MONITORING_ENDPOINT) {
    try {
      await fetch(process.env.MONITORING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`,
        },
        body: JSON.stringify(metrics),
      });
    } catch (error) {
      // Fail silently - don't block request
      console.error('Failed to send metrics:', error);
    }
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(endpoint?: string): {
  total: number;
  average: number;
  p50: number;
  p95: number;
  p99: number;
  errors: number;
  slowRequests: number;
} {
  const filtered = endpoint
    ? metricsStore.filter(m => m.endpoint === endpoint)
    : metricsStore;
  
  if (filtered.length === 0) {
    return {
      total: 0,
      average: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      errors: 0,
      slowRequests: 0,
    };
  }
  
  const durations = filtered.map(m => m.duration).sort((a, b) => a - b);
  const errors = filtered.filter(m => m.status >= 400).length;
  const slowRequests = filtered.filter(m => m.duration > 1000).length;
  
  return {
    total: filtered.length,
    average: durations.reduce((a, b) => a + b, 0) / durations.length,
    p50: durations[Math.floor(durations.length * 0.5)],
    p95: durations[Math.floor(durations.length * 0.95)],
    p99: durations[Math.floor(durations.length * 0.99)],
    errors,
    slowRequests,
  };
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Clear metrics store (for testing)
 */
export function clearMetrics(): void {
  metricsStore.length = 0;
}

