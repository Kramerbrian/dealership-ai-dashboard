/**
 * Monitoring API Endpoint for DealershipAI
 * Provides access to error monitoring and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { ErrorMonitoring } from '@/lib/error-monitoring';

// Initialize monitoring with default config
const monitoring = ErrorMonitoring.getInstance({
  errorThresholds: {
    low: 10,
    medium: 5,
    high: 3,
    critical: 1
  },
  performanceThresholds: {
    warning: 2000, // 2 seconds
    critical: 5000 // 5 seconds
  },
  alertChannels: {
    email: process.env.ALERT_EMAIL ? [process.env.ALERT_EMAIL] : undefined,
    slack: process.env.SLACK_WEBHOOK_URL,
    webhook: process.env.MONITORING_WEBHOOK_URL
  },
  retentionDays: 30
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const timeframe = url.searchParams.get('timeframe') as 'hour' | 'day' | 'week' || 'day';

    switch (action) {
      case 'dashboard':
        const dashboardData = await monitoring.getDashboardData();
        return NextResponse.json(dashboardData);

      case 'error-stats':
        const errorStats = monitoring.getErrorStats(timeframe);
        return NextResponse.json(errorStats);

      case 'performance-stats':
        const performanceStats = monitoring.getPerformanceStats(timeframe);
        return NextResponse.json(performanceStats);

      case 'active-alerts':
        const activeAlerts = monitoring.getActiveAlerts();
        return NextResponse.json({ alerts: activeAlerts });

      case 'health':
        const healthData = await monitoring.getDashboardData();
        return NextResponse.json({
          status: healthData.health.status,
          checks: healthData.health.checks,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          error: 'Unknown action',
          availableActions: [
            'dashboard',
            'error-stats',
            'performance-stats',
            'active-alerts',
            'health'
          ]
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json({
      error: 'Monitoring request failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'track-error':
        const { error, context } = params;
        if (!error) {
          return NextResponse.json({ error: 'error object required' }, { status: 400 });
        }

        const errorObj = new Error(error.message);
        errorObj.name = error.name || 'Error';
        errorObj.stack = error.stack;

        await monitoring.trackError(errorObj, context || {});
        return NextResponse.json({ success: true, message: 'Error tracked' });

      case 'track-performance':
        const { operation, duration, success, error: perfError, metadata } = params;
        if (!operation || duration === undefined || success === undefined) {
          return NextResponse.json({ 
            error: 'operation, duration, and success are required' 
          }, { status: 400 });
        }

        await monitoring.trackPerformance(operation, duration, success, perfError, metadata);
        return NextResponse.json({ success: true, message: 'Performance tracked' });

      case 'resolve-alert':
        const { alertId, resolution } = params;
        if (!alertId) {
          return NextResponse.json({ error: 'alertId required' }, { status: 400 });
        }

        const resolved = await monitoring.resolveAlert(alertId, resolution);
        if (!resolved) {
          return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Alert resolved' });

      case 'test-alert':
        const { severity = 'Medium', category = 'Test', message = 'Test alert' } = params;
        const testError = new Error(message);
        testError.name = 'TestError';

        await monitoring.trackError(testError, {
          severity: severity as any,
          category,
          operation: 'test-alert',
          metadata: { test: true }
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Test alert created',
          severity,
          category
        });

      default:
        return NextResponse.json({
          error: 'Unknown action',
          availableActions: [
            'track-error',
            'track-performance',
            'resolve-alert',
            'test-alert'
          ]
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring POST error:', error);
    return NextResponse.json({
      error: 'Monitoring operation failed',
      details: error.message
    }, { status: 500 });
  }
}
