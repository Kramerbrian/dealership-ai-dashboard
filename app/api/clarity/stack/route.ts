import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || 'demo-dealership.com';

  // Mocked but realistic Clarity Stack data
  // Replace with real analysis calls later
  const seo = 68;
  const aeo = 54;
  const geo = 41;
  const avi = Math.round((seo + aeo + geo) / 3);

  const data = {
    scores: {
      seo,
      aeo,
      geo,
      avi,
    },
    location: {
      lat: 26.6406,
      lng: -81.8723,
      city: 'Cape Coral',
      state: 'FL',
    },
    gbp: {
      score: 72,
      rating: 4.3,
      review_count: 127,
      issues: ['Missing hours', 'Incomplete services'],
    },
    ugc: {
      score: 65,
      velocity: 8,
      response_rate: 0.78,
      issues: ['Slow response time', 'Generic responses'],
    },
    schema: {
      coverage: 0.45,
      issues: ['Missing LocalBusiness schema', 'No Review schema'],
    },
    competitive: {
      rank: 7,
      total: 12,
      leaders: [
        { name: 'Competitor A', score: 89 },
        { name: 'Competitor B', score: 85 },
      ],
      gap: 21,
    },
    revenue_at_risk: {
      monthly: 142000,
      annual: 1704000,
      assumptions: {
        monthly_searches: 1200,
        close_rate: 0.12,
        avg_deal_gross: 3500,
        ai_search_share: 0.45,
      },
    },
    ai_intro_current: `${domain} is a car dealership located in Cape Coral, Florida. They offer new and used vehicles, financing options, and service appointments. The business has a Google Business Profile with a 4.3-star rating based on 127 reviews, but limited information on service pricing and few guides that help shoppers make decisions.`,
    ai_intro_improved: `${domain} is one of Cape Coral's most trusted dealerships, known for clear pricing, up-to-date service information, and easy guides that help shoppers choose the right vehicle.`,
    confidence: 'MEDIUM' as const,
  };

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

