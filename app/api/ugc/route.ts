import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ugc
 * Returns UGC (User Generated Content) mentions, sentiment, and platform data
 * TODO: Wire to UGC/Reviews aggregator (Google, Yelp, Facebook, DealerRater)
 */
export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealerId') || 'demo';

  return NextResponse.json({
    dealerId,
    mentions: [
      {
        platform: 'Google',
        count: 1240,
        avgRating: 4.3,
        sentiment: 'positive',
        lastUpdated: new Date().toISOString(),
      },
      {
        platform: 'Yelp',
        count: 340,
        avgRating: 4.1,
        sentiment: 'positive',
        lastUpdated: new Date().toISOString(),
      },
      {
        platform: 'Facebook',
        count: 890,
        avgRating: 4.5,
        sentiment: 'positive',
        lastUpdated: new Date().toISOString(),
      },
    ],
    sentiment: {
      positive: 0.7,
      neutral: 0.2,
      negative: 0.1,
    },
    platforms: [
      { name: 'Google', reviews: 1240, avgRating: 4.3 },
      { name: 'Yelp', reviews: 340, avgRating: 4.1 },
      { name: 'Facebook', reviews: 890, avgRating: 4.5 },
    ],
    summary: {
      mentions7d: 38,
      positive: 0.7,
      avgResponseHrs: 16,
    },
  });
}
