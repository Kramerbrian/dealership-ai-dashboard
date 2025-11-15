import { NextRequest, NextResponse } from 'next/server';
import { buildPulseCardsFromClarity } from '@/lib/pulse/fromClarity';
import type { ClarityStackResponse } from '@/lib/pulse/fromClarity';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET /api/getPulseMetrics
 * 
 * Returns aggregated Pulse metrics for a dealer domain.
 * This endpoint provides high-level metrics derived from clarity stack data.
 * 
 * Query params:
 * - domain: Dealer domain (required)
 * - tenant?: string
 * - role?: string
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') || undefined;
    const tenant = url.searchParams.get('tenant') || undefined || 'default';
    const role = url.searchParams.get('role') || undefined || 'default';

    if (!domain) {
      return NextResponse.json(
        { error: 'domain query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch clarity stack data
    // Use absolute URL for server-side fetch
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const clarityUrl = `${baseUrl}/api/clarity/stack?domain=${encodeURIComponent(domain)}`;
    
    const clarityResponse = await fetch(clarityUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'DealershipAI-Pulse/1.0',
      },
    });

    if (!clarityResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch clarity stack data' },
        { status: clarityResponse.status }
      );
    }

    const clarityData = await clarityResponse.json() as ClarityStackResponse;

    // Generate Pulse cards
    const cards = buildPulseCardsFromClarity(clarityData);

    // Calculate aggregated metrics
    const metrics = {
      // Overall scores
      scores: {
        avi: clarityData.scores.avi,
        seo: clarityData.scores.seo,
        aeo: clarityData.scores.aeo,
        geo: clarityData.scores.geo,
      },
      
      // Revenue metrics
      revenue: {
        atRiskMonthly: clarityData.revenue_at_risk.monthly,
        atRiskAnnual: clarityData.revenue_at_risk.annual,
      },

      // Component scores
      components: {
        schema: clarityData.schema.score,
        gbp: clarityData.gbp.health_score,
        ugc: clarityData.ugc.score,
      },

      // Competitive position
      competitive: {
        rank: clarityData.competitive.rank,
        total: clarityData.competitive.total,
        gapToLeader: clarityData.competitive.gap_to_leader,
        leaderName: clarityData.competitive.leaders?.[0]?.name || 'Unknown',
        leaderAVI: clarityData.competitive.leaders?.[0]?.avi || 0,
      },

      // Pulse card summary
      pulse: {
        totalCards: cards.length,
        criticalCount: cards.filter(c => c.severity === 'critical').length,
        highCount: cards.filter(c => c.severity === 'high').length,
        mediumCount: cards.filter(c => c.severity === 'medium').length,
        lowCount: cards.filter(c => c.severity === 'low').length,
        categories: {
          Visibility: cards.filter(c => c.category === 'Visibility').length,
          Schema: cards.filter(c => c.category === 'Schema').length,
          GBP: cards.filter(c => c.category === 'GBP').length,
          UGC: cards.filter(c => c.category === 'UGC').length,
          Competitive: cards.filter(c => c.category === 'Competitive').length,
          Narrative: cards.filter(c => c.category === 'Narrative').length,
        },
      },

      // Health indicators
      health: {
        overall: clarityData.scores.avi >= 80 ? 'excellent' :
                clarityData.scores.avi >= 60 ? 'good' :
                clarityData.scores.avi >= 40 ? 'fair' : 'poor',
        needsAttention: cards.filter(c => c.severity === 'high' || c.severity === 'critical').length,
        topPriority: cards
          .filter(c => c.severity === 'critical')
          .map(c => ({ key: c.key, title: c.title, action: c.recommendedAction }))
          .slice(0, 3),
      },

      // Trends (stub - would come from historical data)
      trends: {
        aviChange: 0, // Would calculate from historical data
        revenueRiskChange: 0,
        competitiveRankChange: 0,
      },
    };

    return NextResponse.json({
      success: true,
      metrics,
      metadata: {
        domain,
        tenant,
        role,
        timestamp: new Date().toISOString(),
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('[getPulseMetrics] error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get pulse metrics',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/getPulseMetrics
 * 
 * Returns metrics for provided clarity stack data.
 * Useful when you already have clarity data and want metrics without another fetch.
 * 
 * Body:
 * - clarityData: ClarityStackResponse
 * - tenant?: string
 * - role?: string
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clarityData, tenant, role } = body;

    if (!clarityData) {
      return NextResponse.json(
        { error: 'clarityData is required' },
        { status: 400 }
      );
    }

    const cards = buildPulseCardsFromClarity(clarityData as ClarityStackResponse);

    const metrics = {
      scores: {
        avi: clarityData.scores.avi,
        seo: clarityData.scores.seo,
        aeo: clarityData.scores.aeo,
        geo: clarityData.scores.geo,
      },
      revenue: {
        atRiskMonthly: clarityData.revenue_at_risk.monthly,
        atRiskAnnual: clarityData.revenue_at_risk.annual,
      },
      components: {
        schema: clarityData.schema.score,
        gbp: clarityData.gbp.health_score,
        ugc: clarityData.ugc.score,
      },
      competitive: {
        rank: clarityData.competitive.rank,
        total: clarityData.competitive.total,
        gapToLeader: clarityData.competitive.gap_to_leader,
        leaderName: clarityData.competitive.leaders?.[0]?.name || 'Unknown',
        leaderAVI: clarityData.competitive.leaders?.[0]?.avi || 0,
      },
      pulse: {
        totalCards: cards.length,
        criticalCount: cards.filter(c => c.severity === 'critical').length,
        highCount: cards.filter(c => c.severity === 'high').length,
        mediumCount: cards.filter(c => c.severity === 'medium').length,
        lowCount: cards.filter(c => c.severity === 'low').length,
        categories: {
          Visibility: cards.filter(c => c.category === 'Visibility').length,
          Schema: cards.filter(c => c.category === 'Schema').length,
          GBP: cards.filter(c => c.category === 'GBP').length,
          UGC: cards.filter(c => c.category === 'UGC').length,
          Competitive: cards.filter(c => c.category === 'Competitive').length,
          Narrative: cards.filter(c => c.category === 'Narrative').length,
        },
      },
      health: {
        overall: clarityData.scores.avi >= 80 ? 'excellent' :
                clarityData.scores.avi >= 60 ? 'good' :
                clarityData.scores.avi >= 40 ? 'fair' : 'poor',
        needsAttention: cards.filter(c => c.severity === 'high' || c.severity === 'critical').length,
        topPriority: cards
          .filter(c => c.severity === 'critical')
          .map(c => ({ key: c.key, title: c.title, action: c.recommendedAction }))
          .slice(0, 3),
      },
      trends: {
        aviChange: 0,
        revenueRiskChange: 0,
        competitiveRankChange: 0,
      },
    };

    return NextResponse.json({
      success: true,
      metrics,
      metadata: {
        domain: clarityData.domain,
        tenant: tenant || 'default',
        role: role || 'default',
        timestamp: new Date().toISOString(),
      },
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[getPulseMetrics] POST error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get pulse metrics',
        success: false 
      },
      { status: 500 }
    );
  }
}

