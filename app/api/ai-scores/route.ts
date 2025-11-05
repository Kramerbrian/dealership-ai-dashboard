import { NextRequest, NextResponse } from 'next/server';
import { cachedResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-scores
 * 
 * Returns comprehensive AI scores for a dealership domain
 * Expected format: { ai_visibility_overall, ati_index, cvi_score, ori_score, gri_score, dpi_composite }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'germainnissan.com';
    const dealerId = searchParams.get('dealerId');

    await logger.info('AI scores requested', { domain, dealerId });

    // TODO: In production, fetch real scores from database/scoring engine
    // For now, return realistic mock data with some variation based on domain
    
    // Generate consistent scores based on domain hash for stability
    const domainHash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseScore = 70 + (domainHash % 25); // 70-95 range
    
    // Calculate individual scores with realistic relationships
    const ai_visibility_overall = Math.round(baseScore + (Math.random() - 0.5) * 5);
    const ati_index = Math.round(baseScore - 5 + (Math.random() - 0.5) * 5);
    const cvi_score = Math.round(baseScore + 5 + (Math.random() - 0.5) * 5);
    const ori_score = Math.round(baseScore - 10 + (Math.random() - 0.5) * 5);
    const gri_score = Math.round(baseScore + 2 + (Math.random() - 0.5) * 5);
    
    // DPI = (0.25 × AIV) + (0.20 × ATI) + (0.25 × CVI) + (0.20 × ORI) + (0.10 × GRI)
    const dpi_composite = Math.round(
      (0.25 * ai_visibility_overall) +
      (0.20 * ati_index) +
      (0.25 * cvi_score) +
      (0.20 * ori_score) +
      (0.10 * gri_score)
    );

    const scores = {
      ai_visibility_overall: Math.max(0, Math.min(100, ai_visibility_overall)),
      ati_index: Math.max(0, Math.min(100, ati_index)),
      cvi_score: Math.max(0, Math.min(100, cvi_score)),
      ori_score: Math.max(0, Math.min(100, ori_score)),
      gri_score: Math.max(0, Math.min(100, gri_score)),
      dpi_composite: Math.max(0, Math.min(100, dpi_composite)),
      domain,
      dealerId: dealerId || undefined,
      timestamp: new Date().toISOString(),
    };

    await logger.info('AI scores calculated', { domain, scores });

    // Return scores directly (not wrapped) for compatibility with hovercard component
    return NextResponse.json(scores, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    await logger.error('AI scores API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse(
      'Failed to fetch AI scores',
      500,
      { timestamp: new Date().toISOString() }
    );
  }
}

