import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain') || 'exampledealer.com';

  // Mock Clarity Stack data
  const data = {
    domain,
    scores: {
      seo: 87.3,
      aeo: 73.8,
      geo: 65.2,
      avi: 82.1,
    },
    revenue_at_risk: {
      monthly: 24800,
      annual: 297600,
    },
    location: {
      lat: 26.1420,
      lng: -81.7948,
      city: 'Naples',
      state: 'FL',
    },
    gbp: {
      health_score: 78,
      review_count: 247,
      average_rating: 4.6,
    },
    ugc: {
      score: 72,
      recent_reviews_90d: 34,
    },
    schema: {
      score: 68,
    },
    competitive: {
      rank: 3,
      total: 12,
    },
    ai_intro_current: 'This dealership is a well-known store in its area with solid reviews, but AI still struggles to see clear service information and buyer guides.',
    ai_intro_improved: 'This dealership is seen as a trusted local store with clear pricing, current service information, and simple guides that help shoppers choose the right vehicle.',
  };

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

