import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  predictMetric,
  predictCompetitorMovement,
  generateActionableInsights,
} from '@/lib/analytics/predictive-engine';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/analytics/predict
 * Get predictive analytics for schema coverage, E-E-A-T, and AI visibility
 */
export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const dealerId = url.searchParams.get('dealerId') || 'demo-tenant';
    const daysAhead = parseInt(url.searchParams.get('days') || '7', 10);

    // Run predictions in parallel
    const [
      schemaPrediction,
      eeatPrediction,
      aiVisibilityPrediction,
      competitorPredictions,
      insights,
    ] = await Promise.all([
      predictMetric(dealerId, 'schema_coverage', daysAhead),
      predictMetric(dealerId, 'eeat_score', daysAhead),
      predictMetric(dealerId, 'ai_visibility', daysAhead),
      predictCompetitorMovement(dealerId, daysAhead),
      generateActionableInsights(dealerId),
    ]);

    return NextResponse.json(
      {
        predictions: {
          schema_coverage: schemaPrediction,
          eeat_score: eeatPrediction,
          ai_visibility: aiVisibilityPrediction,
        },
        competitor_forecast: competitorPredictions,
        recommended_actions: insights,
        forecast_days: daysAhead,
        generated_at: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error: any) {
    console.error('[analytics/predict] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
