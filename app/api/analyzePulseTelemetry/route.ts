import { NextRequest, NextResponse } from 'next/server';
import { buildPulseCardsFromClarity } from '@/lib/pulse/fromClarity';
import type { ClarityStackResponse } from '@/lib/pulse/fromClarity';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * POST /api/analyzePulseTelemetry
 * 
 * Analyzes telemetry data and generates Pulse cards from clarity stack.
 * This endpoint takes clarity stack data and transforms it into actionable Pulse cards.
 * 
 * Body:
 * - clarityData: ClarityStackResponse (from /api/clarity/stack)
 * - tenant?: string (optional tenant ID)
 * - role?: string (optional role for filtering)
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

    // Validate clarity data structure
    const requiredFields = ['domain', 'scores', 'revenue_at_risk', 'schema', 'ugc', 'gbp', 'competitive', 'ai_intro_current', 'ai_intro_improved'];
    const missingFields = requiredFields.filter(field => !(field in clarityData));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Transform clarity stack into Pulse cards
    const cards = buildPulseCardsFromClarity(clarityData as ClarityStackResponse);

    // Calculate summary metrics
    const summary = {
      totalCards: cards.length,
      bySeverity: {
        critical: cards.filter(c => c.severity === 'critical').length,
        high: cards.filter(c => c.severity === 'high').length,
        medium: cards.filter(c => c.severity === 'medium').length,
        low: cards.filter(c => c.severity === 'low').length,
      },
      byCategory: {
        Visibility: cards.filter(c => c.category === 'Visibility').length,
        Schema: cards.filter(c => c.category === 'Schema').length,
        GBP: cards.filter(c => c.category === 'GBP').length,
        UGC: cards.filter(c => c.category === 'UGC').length,
        Competitive: cards.filter(c => c.category === 'Competitive').length,
        Narrative: cards.filter(c => c.category === 'Narrative').length,
      },
      revenueAtRisk: clarityData.revenue_at_risk?.monthly || 0,
      overallAVI: clarityData.scores?.avi || 0,
    };

    return NextResponse.json({
      success: true,
      cards,
      summary,
      metadata: {
        tenant: tenant || 'default',
        role: role || 'default',
        timestamp: new Date().toISOString(),
        domain: clarityData.domain,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[analyzePulseTelemetry] error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze pulse telemetry',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyzePulseTelemetry
 * 
 * Fetches clarity stack data and analyzes it into Pulse cards.
 * This is a convenience endpoint that fetches clarity data and transforms it.
 * 
 * Query params:
 * - domain: Dealer domain (required)
 * - tenant?: string
 * - role?: string
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain');
    const tenant = url.searchParams.get('tenant') || 'default';
    const role = url.searchParams.get('role') || 'default';

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

    const clarityData = await clarityResponse.json();

    // Transform to Pulse cards
    const cards = buildPulseCardsFromClarity(clarityData as ClarityStackResponse);

    // Calculate summary
    const summary = {
      totalCards: cards.length,
      bySeverity: {
        critical: cards.filter(c => c.severity === 'critical').length,
        high: cards.filter(c => c.severity === 'high').length,
        medium: cards.filter(c => c.severity === 'medium').length,
        low: cards.filter(c => c.severity === 'low').length,
      },
      byCategory: {
        Visibility: cards.filter(c => c.category === 'Visibility').length,
        Schema: cards.filter(c => c.category === 'Schema').length,
        GBP: cards.filter(c => c.category === 'GBP').length,
        UGC: cards.filter(c => c.category === 'UGC').length,
        Competitive: cards.filter(c => c.category === 'Competitive').length,
        Narrative: cards.filter(c => c.category === 'Narrative').length,
      },
      revenueAtRisk: clarityData.revenue_at_risk?.monthly || 0,
      overallAVI: clarityData.scores?.avi || 0,
    };

    return NextResponse.json({
      success: true,
      cards,
      summary,
      metadata: {
        tenant,
        role,
        timestamp: new Date().toISOString(),
        domain,
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('[analyzePulseTelemetry] GET error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze pulse telemetry',
        success: false 
      },
      { status: 500 }
    );
  }
}

