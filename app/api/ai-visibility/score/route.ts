import { NextRequest, NextResponse } from 'next/server';
import { quickAIVisibilityTest } from '@/lib/services/aiPlatformTester';
import { scoreAIVisibility, type EngineCoverage } from '@/lib/scoring';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Quick AI visibility score endpoint
 * Returns simplified score for dashboard widgets
 * 
 * NOTE: This endpoint uses quickAIVisibilityTest (live testing service)
 * which tests actual AI platforms in real-time. For calculated scores
 * from existing data, use scoreAIVisibility() from lib/scoring.ts.
 * 
 * - quickAIVisibilityTest: Live testing of AI platforms
 * - scoreAIVisibility(): Calculation from engine coverage data
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dealerName = url.searchParams.get('dealerName') || undefined || 'Demo Dealership';
    const city = url.searchParams.get('city') || undefined || 'Naples';
    const state = url.searchParams.get('state') || undefined || 'FL';

    console.log(`[ai-visibility/score] Quick test for: ${dealerName}, ${city}, ${state}`);

    let result: any;
    let calculatedScore: number | null = null;
    
    try {
      // Try live testing first
      result = await quickAIVisibilityTest(dealerName, city, state);
      
      // If we have breakdown data, also calculate using new scoring function for comparison
      if (result.breakdown) {
        const engineCoverage: EngineCoverage = {
          perplexity: result.breakdown.perplexity || 0,
          chatgpt: result.breakdown.chatgpt || 0,
          gemini: result.breakdown.gemini || 0,
        };
        calculatedScore = scoreAIVisibility(engineCoverage);
      }
    } catch (error) {
      console.warn('[ai-visibility/score] Live test failed:', error);
      // Return error response - could add fallback to calculated score if cached data available
      return NextResponse.json(
        {
          score: 0,
          calculatedScore: null,
          breakdown: { chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
          mentionRate: 0,
          zeroClickRate: 0,
          sentiment: 'neutral',
          status: 'error',
          testedAt: new Date(),
          error: error instanceof Error ? error.message : 'Live test failed',
          note: 'Consider using /api/clarity/stack for calculated scores from cached data',
        },
        { status: 500 }
      );
    }

    // Return simplified response for dashboard
    const response = {
      score: (result as any).overall,
      calculatedScore, // Include calculated score using new formula (for comparison)
      breakdown: (result as any).breakdown,
      mentionRate: (result as any).mentionRate,
      zeroClickRate: (result as any).zeroClickRate,
      sentiment: (result as any).avgSentiment > 0.3 ? 'positive' : (result as any).avgSentiment < -0.3 ? 'negative' : 'neutral',
      status: (result as any).overall >= 80 ? 'excellent' : (result as any).overall >= 60 ? 'good' : (result as any).overall >= 40 ? 'fair' : 'poor',
      testedAt: (result as any).testedAt,
      source: 'live_test', // Indicate this is from live testing
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
