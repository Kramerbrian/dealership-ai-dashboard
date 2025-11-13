import { NextRequest, NextResponse } from 'next/server';

// export const runtime = 'edge';

type Scores = { seo: number; aeo: number; geo: number; avi: number };

type Location = { lat: number; lng: number; city?: string; state?: string };

type RevenueAtRisk = {
  monthly: number;
  annual: number;
  assumptions: {
    monthly_opportunities: number;
    avg_gross_per_unit: number;
    ai_influence_rate: number;
  };
};

type ClarityStackResponse = {
  domain: string;
  tenant?: string;
  scores: Scores;
  location?: Location;
  gbp: {
    health_score: number;
    place_id?: string;
    rating?: number;
    review_count?: number;
  };
  ugc: {
    score: number;
    review_velocity_vs_market: number;
    recent_reviews_90d: number;
    issues: string[];
  };
  schema: {
    score: number;
    coverage: Record<string, number>;
    issues: string[];
  };
  competitive: {
    rank: number;
    total: number;
    leaders: { name: string; avi: number }[];
    gap_to_leader: number;
  };
  revenue_at_risk: RevenueAtRisk;
  ai_intro_current: string;
  ai_intro_improved: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};

function clampScore(x: number) {
  return Math.max(0, Math.min(100, Math.round(x)));
}

function computeAvi(seo: number, aeo: number, geo: number): number {
  const avi = 0.4 * geo + 0.3 * aeo + 0.3 * seo;
  return clampScore(avi);
}

function computeRevenueAtRisk(scores: Scores): RevenueAtRisk {
  const monthly_opportunities = 450;
  const avg_gross_per_unit = 1200;
  const ai_influence_rate = 0.35;

  const visibilityFraction = scores.avi / 100;
  const missingFraction = 1 - visibilityFraction;

  const monthly = Math.round(
    missingFraction * monthly_opportunities * avg_gross_per_unit * ai_influence_rate
  );
  const annual = monthly * 12;

  return {
    monthly,
    annual,
    assumptions: { monthly_opportunities, avg_gross_per_unit, ai_influence_rate }
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const domainParam = (url.searchParams.get('domain') || '').trim().toLowerCase();
  const tenant = url.searchParams.get('tenant') || undefined;
  const domain = domainParam || 'exampledealer.com';

  // Stubbed scores for now. Replace with real analysis later.
  const seo = 68;
  const aeo = 54;
  const geo = 41;
  const avi = computeAvi(seo, aeo, geo);
  const scores: Scores = { seo, aeo, geo, avi };

  const revenue_at_risk = computeRevenueAtRisk(scores);

  const data: ClarityStackResponse = {
    domain,
    tenant,
    scores,
    location: {
      lat: 26.5629,
      lng: -81.9495,
      city: 'Cape Coral',
      state: 'FL'
    },
    gbp: {
      health_score: 78,
      place_id: 'gbp_stub_123',
      rating: 4.3,
      review_count: 487
    },
    ugc: {
      score: 82,
      review_velocity_vs_market: 0.74,
      recent_reviews_90d: 38,
      issues: ['Service reviews under-used on key pages']
    },
    schema: {
      score: 61,
      coverage: {
        AutoDealer: 1.0,
        LocalBusiness: 0.9,
        Vehicle: 0.35,
        FAQPage: 0.2,
        Review: 0.4
      },
      issues: [
        'Vehicle schema missing on many VDPs',
        'FAQ schema missing on Service pages'
      ]
    },
    competitive: {
      rank: 3,
      total: 7,
      leaders: [
        { name: 'Scanlon Hyundai', avi: 87 },
        { name: 'Maxx Motors', avi: 76 }
      ],
      gap_to_leader: 35
    },
    revenue_at_risk,
    ai_intro_current:
      'This dealership has solid reviews, but limited information on service pricing and few guides that help shoppers make decisions.',
    ai_intro_improved:
      'This dealership is seen as a trusted local store with clear pricing, up-to-date service information, and simple guides that help shoppers choose the right vehicle.',
    confidence: 'MEDIUM'
  };

  return NextResponse.json(data, { status: 200 });
}
