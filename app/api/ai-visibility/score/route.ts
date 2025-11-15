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
    const dealerName = url.searchParams.get('dealerName') || undefined || 'Demo Dealership';
    const city = url.searchParams.get('city') || undefined || 'Naples';
    const state = url.searchParams.get('state') || undefined || 'FL';

    console.log(`[ai-visibility/score] Quick test for: ${dealerName}, ${city}, ${state}`);

    const result = await quickAIVisibilityTest(dealerName, city, state);

    // Return simplified response for dashboard
    const response = {
      score: (result as any).overall,
      breakdown: (result as any).breakdown,
      mentionRate: (result as any).mentionRate,
      zeroClickRate: (result as any).zeroClickRate,
      sentiment: (result as any).avgSentiment > 0.3 ? 'positive' : (result as any).avgSentiment < -0.3 ? 'negative' : 'neutral',
      status: (result as any).overall >= 80 ? 'excellent' : (result as any).overall >= 60 ? 'good' : (result as any).overall >= 40 ? 'fair' : 'poor',
      testedAt: (result as any).testedAt,
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
