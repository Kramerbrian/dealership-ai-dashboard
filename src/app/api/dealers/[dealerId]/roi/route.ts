import { NextRequest, NextResponse } from 'next/server';
import { scoringEngine, DealerScores } from '@/core/scoring-engine';

/**
 * GET /api/dealers/[dealerId]/roi
 * Returns revenue impact analysis for a specific dealer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { dealerId: string } }
) {
  try {
    const { dealerId } = params;

    // Simulate dealer scores (in production, this would fetch from the scores API)
    const mockScores: DealerScores = {
      seo_visibility: Math.random() * 30 + 50, // 50-80 range
      aeo_visibility: Math.random() * 25 + 45, // 45-70 range
      geo_visibility: Math.random() * 20 + 60, // 60-80 range
      overall: Math.random() * 25 + 50, // 50-75 range
      confidence: 0.85,
      last_updated: new Date(),
      data_sources: ['GSC API', 'GMB API', 'Bright Data API']
    };

    // Calculate revenue impact using the scoring engine
    const roiMetrics = scoringEngine.calculateRevenueImpact(mockScores);

    return NextResponse.json({
      success: true,
      data: {
        ...roiMetrics,
        monthly_at_risk: Math.round(roiMetrics.monthly_at_risk),
        annual_impact: Math.round(roiMetrics.annual_impact),
        roi_multiple: Math.round(roiMetrics.roi_multiple * 10) / 10,
        confidence: roiMetrics.confidence,
        methodology: roiMetrics.methodology,
        last_updated: new Date(),
        industry_benchmarks: {
          avg_monthly_searches: 8400,
          avg_conversion_rate: 0.024,
          avg_deal_profit: 2800,
          ai_search_share: 0.15
        }
      },
      message: 'ROI analysis completed successfully'
    });
  } catch (error) {
    console.error('Error calculating ROI metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate ROI metrics',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
