import { NextRequest, NextResponse } from 'next/server';
import { getGNNMetrics } from '@/lib/gnn/client';
import { logger } from '@/lib/logger';
import { errorResponse, cachedResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gnn/metrics
 * Get GNN model metrics
 */
export async function GET(req: NextRequest) {
  try {
    await logger.info('GNN metrics requested');

    const metrics = await getGNNMetrics();

    if (!metrics) {
      return errorResponse('GNN engine unavailable', 503);
    }

    // Cache for 1 minute (metrics update frequently)
    return cachedResponse(metrics, 60, 120, [CACHE_TAGS.GNN_METRICS]);
  } catch (error) {
    await logger.error('GNN metrics API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse('Failed to get GNN metrics', 500);
  }
}

