import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/zero-click
 * Returns zero-click search inclusion rate and details
 * TODO: Wire to Google Search Console / Pulse analyzer for real data
 */
export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealerId') || undefined || 'demo';

  return NextResponse.json({
    dealerId,
    inclusionRate: 0.62,
    details: [
      {
        intent: 'oil change near me',
        score: 0.7,
        impressions: 1240,
        clicks: 340,
      },
      {
        intent: 'best toyota dealer',
        score: 0.55,
        impressions: 890,
        clicks: 210,
      },
      {
        intent: 'used cars [city]',
        score: 0.48,
        impressions: 2100,
        clicks: 450,
      },
    ],
  });
}
