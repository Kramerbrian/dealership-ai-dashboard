import { NextRequest, NextResponse } from 'next/server';
import { getGNNPredictions } from '@/lib/gnn/client';
import { logger } from '@/lib/logger';
import { errorResponse, cachedResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gnn/predict
 * Get GNN predictions for fixes
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || undefined;
    const threshold = parseFloat(searchParams.get('threshold') || '0.85');

    await logger.info('GNN predictions requested', {
      dealerId,
      threshold,
    });

    const predictions = await getGNNPredictions(dealerId, threshold);

    // Cache for 5 minutes
    return cachedResponse(
      { predictions, count: predictions.length },
      300,
      600,
      [CACHE_TAGS.GNN_PREDICTIONS, ...(dealerId ? [CACHE_TAGS.TENANT(dealerId)] : [])]
    );
  } catch (error) {
    await logger.error('GNN predictions API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse('Failed to get GNN predictions', 500);
  }
}

