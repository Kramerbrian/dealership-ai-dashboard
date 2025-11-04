import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getQueryMetrics } from '@/lib/db-monitor';
import { logger } from '@/lib/logger';

/**
 * Database Metrics API Endpoint
 * 
 * Returns database query performance metrics
 * Requires authentication (admin only in production)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // In production, you might want to check for admin role
    // For now, just require authentication
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const metrics = await getQueryMetrics();
    
    await logger.info('Database metrics retrieved', {
      userId,
      totalQueries: metrics.totalQueries,
      slowQueryCount: metrics.slowQueryCount,
    });
    
    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await logger.error('Failed to fetch database metrics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

