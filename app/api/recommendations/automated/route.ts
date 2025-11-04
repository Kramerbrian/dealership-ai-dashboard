import { NextRequest, NextResponse } from 'next/server';
import { automatedRecommendationsEngine } from '@/lib/ai/automated-recommendations';

/**
 * GET /api/recommendations/automated
 * Generate automated recommendations based on dealership metrics
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dealershipId = searchParams.get('dealershipId');
    
    if (!dealershipId) {
      return NextResponse.json(
        { error: 'dealershipId is required' },
        { status: 400 }
      );
    }

    // Fetch current metrics (simplified - in production, fetch from database)
    const metrics = {
      aiVisibility: 65, // Example - fetch from database
      trustScore: 70,
      dataQuality: 75,
      competitorGap: 15,
      revenueAtRisk: 15000,
      recentChanges: []
    };

    // Generate recommendations
    const recommendations = await automatedRecommendationsEngine.generateRecommendations(
      metrics,
      { dealershipId }
    );

    return NextResponse.json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString(),
      metrics
    });

  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations/automated
 * Generate recommendations with custom metrics
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metrics, dealershipId, context } = body;

    if (!metrics) {
      return NextResponse.json(
        { error: 'metrics are required' },
        { status: 400 }
      );
    }

    // Generate recommendations
    const recommendations = await automatedRecommendationsEngine.generateRecommendations(
      metrics,
      { dealershipId, ...context }
    );

    return NextResponse.json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

