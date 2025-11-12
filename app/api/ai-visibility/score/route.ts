import { NextRequest, NextResponse } from 'next/server';
import { quickAIVisibilityTest } from '@/lib/services/aiPlatformTester';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Quick AI visibility score endpoint
 * Returns simplified score for dashboard widgets
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dealerName = url.searchParams.get('dealerName') || 'Demo Dealership';
    const city = url.searchParams.get('city') || 'Naples';
    const state = url.searchParams.get('state') || 'FL';

    console.log(`[ai-visibility/score] Quick test for: ${dealerName}, ${city}, ${state}`);

    const result = await quickAIVisibilityTest(dealerName, city, state);

    // Return simplified response for dashboard
    const response = {
      score: result.overall,
      breakdown: result.breakdown,
      mentionRate: result.mentionRate,
      zeroClickRate: result.zeroClickRate,
      sentiment: result.avgSentiment > 0.3 ? 'positive' : result.avgSentiment < -0.3 ? 'negative' : 'neutral',
      status: result.overall >= 80 ? 'excellent' : result.overall >= 60 ? 'good' : result.overall >= 40 ? 'fair' : 'poor',
      testedAt: result.testedAt,
    };

    console.log(`[ai-visibility/score] Score: ${response.score}, Status: ${response.status}`);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error: any) {
    console.error('[ai-visibility/score] Error:', error);
    return NextResponse.json(
      {
        score: 0,
        breakdown: { chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
        mentionRate: 0,
        zeroClickRate: 0,
        sentiment: 'neutral',
        status: 'error',
        testedAt: new Date(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}
