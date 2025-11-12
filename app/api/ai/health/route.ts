import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ai/health
 * Returns AI platform health and visibility metrics
 * TODO: Wire to real AI visibility testing endpoints (RankEmbed, Perplexity, ChatGPT, Claude APIs)
 */
export async function GET(req: NextRequest) {
  // Extract dealerId from query params if provided
  const dealerId = req.nextUrl.searchParams.get('dealerId') || 'default';

  return NextResponse.json({
    aiHealth: [
      {
        platform: 'ChatGPT',
        visible: true,
        visibility: 91,
        latencyMs: 620,
        last: new Date().toISOString(),
        trend: '+2%',
      },
      {
        platform: 'Claude',
        visible: true,
        visibility: 88,
        latencyMs: 540,
        last: new Date().toISOString(),
        trend: '+1%',
      },
      {
        platform: 'Perplexity',
        visible: true,
        visibility: 85,
        latencyMs: 510,
        last: new Date().toISOString(),
        trend: '+3%',
      },
      {
        platform: 'Gemini',
        visible: true,
        visibility: 79,
        latencyMs: 580,
        last: new Date().toISOString(),
        trend: '+1%',
      },
    ],
    googleAIO: {
      included: true,
      zeroClickVisibility: 64,
      last: new Date().toISOString(),
      notes: 'mock',
    },
    dealerId,
  });
}
