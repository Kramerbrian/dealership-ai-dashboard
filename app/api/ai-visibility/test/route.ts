import { NextRequest, NextResponse } from 'next/server';
import { runAIVisibilityTest, quickAIVisibilityTest } from '@/lib/services/aiPlatformTester';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for comprehensive testing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerName, city, state, quick = false } = body;

    if (!dealerName || !city || !state) {
      return NextResponse.json(
        { error: 'Missing required parameters: dealerName, city, state' },
        { status: 400 }
      );
    }

    console.log(`[ai-visibility/test] Starting ${quick ? 'quick' : 'comprehensive'} test for:`, {
      dealerName,
      city,
      state,
    });

    const result = quick
      ? await quickAIVisibilityTest(dealerName, city, state)
      : await runAIVisibilityTest(dealerName, city, state);

    console.log(`[ai-visibility/test] Test complete. Overall score: ${(result as any).overall}`);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error: any) {
    console.error('[ai-visibility/test] Error:', error);
    return NextResponse.json(
      {
        error: error.message,
        overall: 0,
        breakdown: { chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
        mentionRate: 0,
        avgPosition: 0,
        avgSentiment: 0,
        avgAccuracy: 0,
        zeroClickRate: 0,
        testResults: [],
        testedAt: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dealerName = url.searchParams.get('dealerName') || undefined || 'Demo Dealership';
    const city = url.searchParams.get('city') || undefined || 'Naples';
    const state = url.searchParams.get('state') || undefined || 'FL';
    const quick = url.searchParams.get('quick') || undefined === 'true';

    console.log(`[ai-visibility/test GET] Starting ${quick ? 'quick' : 'comprehensive'} test for:`, {
      dealerName,
      city,
      state,
    });

    const result = quick
      ? await quickAIVisibilityTest(dealerName, city, state)
      : await runAIVisibilityTest(dealerName, city, state);

    console.log(`[ai-visibility/test GET] Test complete. Overall score: ${(result as any).overall}`);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error: any) {
    console.error('[ai-visibility/test GET] Error:', error);
    return NextResponse.json(
      {
        error: error.message,
        overall: 0,
        breakdown: { chatgpt: 0, claude: 0, perplexity: 0, gemini: 0 },
        mentionRate: 0,
        avgPosition: 0,
        avgSentiment: 0,
        avgAccuracy: 0,
        zeroClickRate: 0,
        testResults: [],
        testedAt: new Date(),
      },
      { status: 500 }
    );
  }
}
