/**
 * Performance Monitoring API
 * Real-time performance tracking and alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withCache, CACHE_KEYS } from '@/lib/cache';

const PerformanceMetricSchema = z.object({
  page: z.string(),
  loadTime: z.number(),
  firstContentfulPaint: z.number(),
  largestContentfulPaint: z.number(),
  cumulativeLayoutShift: z.number(),
  firstInputDelay: z.number(),
  timestamp: z.string(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional()
});

interface PerformanceAlert {
  type: 'SLOW_LOAD' | 'HIGH_CLS' | 'LONG_FID' | 'API_ERROR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  threshold: number;
  actual: number;
  timestamp: string;
}

class PerformanceMonitor {
  private alerts: PerformanceAlert[] = [];
  private metrics: any[] = [];

  async collectMetric(data: any): Promise<void> {
    try {
      const validated = PerformanceMetricSchema.parse(data);
      this.metrics.push(validated);
      
      // Check for performance issues
      await this.checkPerformanceThresholds(validated);
      
      // Keep only last 1000 metrics in memory
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }
    } catch (error) {
      console.error('Invalid performance metric:', error);
    }
  }

  private async checkPerformanceThresholds(metric: any): Promise<void> {
    const thresholds = {
      loadTime: 3000, // 3 seconds
      firstContentfulPaint: 1800, // 1.8 seconds
      largestContentfulPaint: 2500, // 2.5 seconds
      cumulativeLayoutShift: 0.1, // 0.1 CLS score
      firstInputDelay: 100 // 100ms
    };

    // Check load time
    if (metric.loadTime > thresholds.loadTime) {
      this.addAlert({
        type: 'SLOW_LOAD',
        severity: metric.loadTime > 5000 ? 'CRITICAL' : 'HIGH',
        message: `Page load time exceeded threshold: ${metric.loadTime}ms > ${thresholds.loadTime}ms`,
        threshold: thresholds.loadTime,
        actual: metric.loadTime,
        timestamp: new Date().toISOString()
      });
    }

    // Check CLS
    if (metric.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) {
      this.addAlert({
        type: 'HIGH_CLS',
        severity: metric.cumulativeLayoutShift > 0.25 ? 'CRITICAL' : 'MEDIUM',
        message: `Cumulative Layout Shift exceeded threshold: ${metric.cumulativeLayoutShift} > ${thresholds.cumulativeLayoutShift}`,
        threshold: thresholds.cumulativeLayoutShift,
        actual: metric.cumulativeLayoutShift,
        timestamp: new Date().toISOString()
      });
    }

    // Check FID
    if (metric.firstInputDelay > thresholds.firstInputDelay) {
      this.addAlert({
        type: 'LONG_FID',
        severity: metric.firstInputDelay > 300 ? 'CRITICAL' : 'MEDIUM',
        message: `First Input Delay exceeded threshold: ${metric.firstInputDelay}ms > ${thresholds.firstInputDelay}ms`,
        threshold: thresholds.firstInputDelay,
        actual: metric.firstInputDelay,
        timestamp: new Date().toISOString()
      });
    }
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log critical alerts
    if (alert.severity === 'CRITICAL') {
      console.error('🚨 CRITICAL Performance Alert:', alert);
    }
  }

  getMetrics(timeRange: string = '1h'): any[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.parseTimeRange(timeRange));
    
    return this.metrics.filter(m => new Date(m.timestamp) > cutoff);
  }

  getAlerts(severity?: string): PerformanceAlert[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity);
    }
    return this.alerts;
  }

  getPerformanceScore(): number {
    const recentMetrics = this.getMetrics('1h');
    if (recentMetrics.length === 0) return 100;

    let score = 100;
    
    // Deduct points for performance issues
    recentMetrics.forEach(metric => {
      if (metric.loadTime > 3000) score -= 10;
      if (metric.cumulativeLayoutShift > 0.1) score -= 15;
      if (metric.firstInputDelay > 100) score -= 10;
    });

    return Math.max(0, score);
  }

  private parseTimeRange(range: string): number {
    const units = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    };
    
    return units[range as keyof typeof units] || units['1h'];
  }
}

// Global monitor instance
const monitor = new PerformanceMonitor();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await monitor.collectMetric(body);
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Performance monitoring error:', error);
    
    return NextResponse.json(
      { error: 'Failed to collect performance metric' },
      { status: 400 }
    );
  }
}

async function getPerformanceData(req: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '1h';
    const severity = searchParams.get('severity');
    
    // Optimize data fetching
    const metrics = monitor.getMetrics(timeRange);
    const alerts = monitor.getAlerts(severity || undefined);
    const performanceScore = monitor.getPerformanceScore();
    
    // Optimize response data
    const responseData = {
      performanceScore,
      metrics: metrics.slice(-20), // Reduced from 50 to 20 for faster response
      alerts: alerts.slice(-10), // Reduced from 20 to 10 for faster response
      summary: {
        totalMetrics: metrics.length,
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL').length,
        averageLoadTime: metrics.length > 0 
          ? Math.round(metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length)
          : 0
      },
      timestamp: new Date().toISOString()
    };
    
    const duration = performance.now() - startTime;
    
    const response = NextResponse.json(responseData);
    
    // Performance optimization headers
    response.headers.set('Server-Timing', `performance-monitor;dur=${duration}`);
    response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    return response;
    
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('Performance monitoring fetch error:', error);
    
    const response = NextResponse.json(
      { 
        error: 'Failed to fetch performance data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
    
    response.headers.set('Server-Timing', `error;dur=${duration}`);
    
    return response;
  }
}

// Apply caching middleware
export const GET = withCache(getPerformanceData, CACHE_KEYS?.PERFORMANCE_MONITOR || 'performance_monitor');
