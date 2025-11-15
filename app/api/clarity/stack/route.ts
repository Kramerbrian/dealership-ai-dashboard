import { NextRequest, NextResponse } from 'next/server';
import {
  scoreComposite,
  scoreAIVisibility,
  scoreOverall,
  rarCPC,
  getMetricAlert,
  type MetricBlock,
  type EngineCoverage,
} from '@/lib/scoring';

export const runtime = 'edge';

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
  alert_bands?: {
    seo: 'green' | 'yellow' | 'red';
    aeo: 'green' | 'yellow' | 'red';
    geo: 'green' | 'yellow' | 'red';
    avi: 'green' | 'yellow' | 'red';
  };
};

/**
 * Compute AI Visibility using new scoring formula
 * Formula: 0.25*Perplexity + 0.40*ChatGPT + 0.35*Gemini
 * For now, we'll use a simplified calculation based on SEO/AEO/GEO
 */
function computeAvi(seo: number, aeo: number, geo: number, engineCoverage?: EngineCoverage): number {
  if (engineCoverage) {
    // Use actual engine coverage if available
    return scoreAIVisibility(engineCoverage);
  }
  // Fallback: weighted average of SEO/AEO/GEO (legacy calculation)
  // Note: This is a simplified approximation. In production, use actual engine coverage data.
  const avi = 0.4 * geo + 0.3 * aeo + 0.3 * seo;
  return Math.max(0, Math.min(100, Math.round(avi)));
}

/**
 * Compute Revenue at Risk using CPC proxy method
 */
function computeRevenueAtRisk(scores: Scores): RevenueAtRisk {
  const monthly_opportunities = 450;
  const avg_gross_per_unit = 1200;
  const ai_influence_rate = 0.35;

  const visibilityFraction = scores.avi / 100;
  const missingFraction = Math.max(0, 1 - visibilityFraction);

  // Calculate missed clicks by intent (simplified)
  const missedClicksByIntent = {
    buy: Math.round(missingFraction * monthly_opportunities * 0.4),
    sell: Math.round(missingFraction * monthly_opportunities * 0.3),
    service: Math.round(missingFraction * monthly_opportunities * 0.2),
    trade: Math.round(missingFraction * monthly_opportunities * 0.1),
  };

  // Use CPC proxy method (default CPCs: Buy=$14, Sell=$12, Service=$8, Trade=$10)
  const monthly = rarCPC(missedClicksByIntent);
  const annual = monthly * 12;

  return {
    monthly,
    annual,
    assumptions: { monthly_opportunities, avg_gross_per_unit, ai_influence_rate }
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const domainParam = (url.searchParams.get('domain') || undefined || '').trim().toLowerCase();
  const tenant = url.searchParams.get('tenant') || undefined || undefined;
  const domain = domainParam || 'exampledealer.com';

  // Calculate scores using new scoring functions
  // TODO: Replace with actual data from database/APIs
  const seoMetrics: MetricBlock = {
    mentions: 68,
    citations: 72,
    sentiment: 65,
    shareOfVoice: 60,
  };
  const aeoMetrics: MetricBlock = {
    mentions: 54,
    citations: 58,
    sentiment: 50,
    shareOfVoice: 52,
  };
  const geoMetrics: MetricBlock = {
    mentions: 41,
    citations: 45,
    sentiment: 40,
    shareOfVoice: 38,
  };

  // Calculate composite scores using new formulas
  const seo = scoreComposite(seoMetrics, 'seo');
  const aeo = scoreComposite(aeoMetrics, 'aeo');
  const geo = scoreComposite(geoMetrics, 'geo');

  // AI Visibility (using simplified calculation for now)
  // TODO: Replace with actual engine coverage data
  const engineCoverage: EngineCoverage = {
    perplexity: 65,
    chatgpt: 70,
    gemini: 60,
  };
  const avi = computeAvi(seo, aeo, geo, engineCoverage);
  const scores: Scores = { seo, aeo, geo, avi };

  // Get alert bands
  const alert_bands = {
    seo: getMetricAlert('seo', seo),
    aeo: getMetricAlert('aeo', aeo),
    geo: getMetricAlert('geo', geo),
    avi: getMetricAlert('aiVisibility', avi),
  };

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
    confidence: 'MEDIUM',
    alert_bands,
  };

  return NextResponse.json(data, { status: 200 });
}