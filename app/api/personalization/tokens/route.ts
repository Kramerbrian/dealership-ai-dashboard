import { NextRequest, NextResponse } from 'next/server';
import { TokenGroups, calculateNormalizedMetrics, getDefaultTokenGroups } from '@/lib/personalization/token-system';

export const dynamic = 'force-dynamic';

/**
 * GET /api/personalization/tokens
 * 
 * Returns personalized token groups for the current user/context
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const storeId = searchParams.get('storeId');

    // In production, fetch from database based on userId/storeId
    // For now, return default with calculated normalized metrics
    
    const defaultGroups = getDefaultTokenGroups();

    // If specific data provided, merge it
    const performanceData = searchParams.get('performance');
    if (performanceData) {
      try {
        const perf = JSON.parse(performanceData);
        if (perf.DPI_trend !== undefined) defaultGroups.performance_context.DPI_trend = perf.DPI_trend;
        if (perf.LEE_change !== undefined) defaultGroups.performance_context.LEE_change = perf.LEE_change;
        if (perf.DLOC_reduction !== undefined) defaultGroups.performance_context.DLOC_reduction = perf.DLOC_reduction;
        if (perf.trend_direction) defaultGroups.performance_context.trend_direction = perf.trend_direction;
        
        // Recalculate normalized metrics
        defaultGroups.performance_context = calculateNormalizedMetrics(defaultGroups.performance_context);
      } catch (err) {
        console.warn('Failed to parse performance data:', err);
      }
    }

    const engagementData = searchParams.get('engagement');
    if (engagementData) {
      try {
        const eng = JSON.parse(engagementData);
        defaultGroups.engagement_metrics = {
          alert_ack_rate: eng.alert_ack_rate ?? 0.83,
          action_follow_through_rate: eng.action_follow_through_rate ?? 0.75,
          avg_response_time_hours: eng.avg_response_time_hours ?? 2.5,
        };
      } catch (err) {
        console.warn('Failed to parse engagement data:', err);
      }
    }

    const confidenceData = searchParams.get('confidence');
    if (confidenceData) {
      try {
        const conf = JSON.parse(confidenceData);
        defaultGroups.confidence_metrics = {
          confidence_score: conf.confidence_score ?? 0.91,
          confidence_tier: conf.confidence_tier ?? 'High',
          roi_forecast_confidence_multiplier: conf.roi_forecast_confidence_multiplier ?? 1.12,
          tone_profile: conf.tone_profile ?? 'strategic',
          forecast_variance_reduction: conf.forecast_variance_reduction ?? '-9.2%',
        };
      } catch (err) {
        console.warn('Failed to parse confidence data:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: defaultGroups,
      version: '3.6',
      namespace: 'personalization.tokens',
    });
  } catch (error: any) {
    console.error('Personalization tokens API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch personalization tokens' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/personalization/tokens
 * 
 * Calculate normalized metrics from raw performance data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { performance_context, engagement_metrics, confidence_metrics } = body;

    const result: any = {};

    // Calculate normalized performance metrics
    if (performance_context) {
      result.performance_context = calculateNormalizedMetrics(performance_context);
    }

    // Include engagement metrics if provided
    if (engagement_metrics) {
      result.engagement_metrics = engagement_metrics;
    }

    // Include confidence metrics if provided
    if (confidence_metrics) {
      result.confidence_metrics = confidence_metrics;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Personalization tokens calculation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate normalized metrics' },
      { status: 500 }
    );
  }
}

