import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import { redis } from '@/lib/redis';
import { MetricsCollector } from '@/lib/analytics/metrics-collector';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 3. Initialize metrics collector
    const metricsCollector = new MetricsCollector(redis, prisma);

    let result;

    switch (action) {
      case 'realtime':
        result = await metricsCollector.getRealTimeMetrics();
        break;

      case 'historical':
        const metric = searchParams.get('metric');
        const period = searchParams.get('period');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (!metric || !period || !startDate || !endDate) {
          return NextResponse.json({ error: 'Metric, period, start date, and end date are required' }, { status: 400 });
        }
        
        result = await metricsCollector.getHistoricalMetrics(
          metric,
          period,
          new Date(startDate),
          new Date(endDate)
        );
        break;

      case 'performance':
        const endpoint = searchParams.get('endpoint');
        const hours = parseInt(searchParams.get('hours') || '24');
        
        if (!endpoint) {
          return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
        }
        
        result = await metricsCollector.getPerformanceTrends(endpoint, hours);
        break;

      case 'health':
        result = await metricsCollector.getSystemHealth();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Metrics collection error:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    );
  }
}

// POST endpoint for tracking metrics
export async function POST() {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // 2. Initialize metrics collector
    const metricsCollector = new MetricsCollector(redis, prisma);

    let result;

    switch (action) {
      case 'track_performance':
        if (!data.endpoint || !data.method || !data.responseTime || !data.statusCode) {
          return NextResponse.json({ error: 'Endpoint, method, response time, and status code are required' }, { status: 400 });
        }
        
        await metricsCollector.trackAPIPerformance({
          endpoint: data.endpoint,
          method: data.method,
          responseTime: data.responseTime,
          statusCode: data.statusCode,
          timestamp: new Date(),
          userId: data.userId,
          ipAddress: data.ipAddress || 'unknown'
        });
        
        result = { success: true };
        break;

      case 'track_business':
        if (!data.metric || !data.value || !data.period) {
          return NextResponse.json({ error: 'Metric, value, and period are required' }, { status: 400 });
        }
        
        await metricsCollector.trackBusinessMetric({
          metric: data.metric,
          value: data.value,
          period: data.period,
          timestamp: new Date(),
          breakdown: data.breakdown
        });
        
        result = { success: true };
        break;

      case 'track_error':
        if (!data.message || !data.level) {
          return NextResponse.json({ error: 'Message and level are required' }, { status: 400 });
        }
        
        const errorId = await metricsCollector.trackError({
          message: data.message,
          stack: data.stack || '',
          level: data.level,
          userId: data.userId,
          sessionId: data.sessionId,
          url: data.url || '',
          userAgent: data.userAgent || '',
          resolved: false,
          metadata: data.metadata
        });
        
        result = { success: true, errorId };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Track metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to track metrics' },
      { status: 500 }
    );
  }
}
