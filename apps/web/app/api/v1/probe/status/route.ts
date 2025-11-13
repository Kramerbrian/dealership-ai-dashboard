import { NextResponse } from 'next/server';
import { cacheJSON } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/v1/probe/status
 * 
 * Production probe status endpoint for monitoring
 * Returns system metrics and operational status
 */
export async function GET() {
  try {
    // Get probe counts from cache (if available)
    const counts = await cacheJSON('probe:counts', 60, async () => ({
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
    }));

    // Calculate costs (placeholder - implement actual cost tracking)
    const cost = {
      daily: 0,
      monthly: 0,
      total: 0,
    };

    // Dead letter queue status
    const dlq = {
      count: 0,
      last_processed: null,
    };

    return NextResponse.json(
      {
        counts,
        cost,
        dlq,
        timestamp: new Date().toISOString(),
        status: 'operational',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Probe status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch probe status',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

