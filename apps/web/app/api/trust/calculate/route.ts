import { NextRequest, NextResponse } from 'next/server';
import { 
  TrustEngine, 
  calculateTrust, 
  validateMultiAgentData,
  MultiAgentTrustData,
  AgentTrustMetrics 
} from '@/lib/algorithms/trust-engine';
import { Vertical } from '@/lib/scoring/algorithmicTrust';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/trust/calculate
 * 
 * Calculate comprehensive trust scores from multi-agent metrics
 * 
 * Request body:
 * {
 *   seo: { mentions, citations, sentiment, contentReadiness, shareOfVoice },
 *   aeo: { mentions, citations, sentiment, contentReadiness, shareOfVoice },
 *   geo: { mentions, citations, sentiment, contentReadiness, shareOfVoice },
 *   vertical?: 'acquisition' | 'service' | 'parts'
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.seo || !body.aeo || !body.geo) {
      return NextResponse.json(
        { error: 'Missing required agent data. Provide seo, aeo, and geo metrics.' },
        { status: 400 }
      );
    }

    // Construct multi-agent data
    const agentData: MultiAgentTrustData = {
      seo: {
        mentions: Number(body.seo.mentions) || 0,
        citations: Number(body.seo.citations) || 0,
        sentiment: Number(body.seo.sentiment) || 0,
        contentReadiness: Number(body.seo.contentReadiness) || 0,
        shareOfVoice: Number(body.seo.shareOfVoice) || 0
      },
      aeo: {
        mentions: Number(body.aeo.mentions) || 0,
        citations: Number(body.aeo.citations) || 0,
        sentiment: Number(body.aeo.sentiment) || 0,
        contentReadiness: Number(body.aeo.contentReadiness) || 0,
        shareOfVoice: Number(body.aeo.shareOfVoice) || 0
      },
      geo: {
        mentions: Number(body.geo.mentions) || 0,
        citations: Number(body.geo.citations) || 0,
        sentiment: Number(body.geo.sentiment) || 0,
        contentReadiness: Number(body.geo.contentReadiness) || 0,
        shareOfVoice: Number(body.geo.shareOfVoice) || 0
      }
    };

    // Validate agent metrics
    const validation = validateMultiAgentData(agentData);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid agent metrics', details: validation.errors },
        { status: 400 }
      );
    }

    // Get vertical (default to acquisition)
    const vertical: Vertical = (body.vertical || 'acquisition') as Vertical;

    // Calculate trust
    const result = calculateTrust(agentData, vertical);

    return NextResponse.json({
      success: true,
      data: result
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Trust-Engine-Version': '1.0.0'
      }
    });

  } catch (error: any) {
    console.error('[API] Trust calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate trust scores',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trust/calculate
 * 
 * Calculate trust from query parameters (for testing/demo)
 * 
 * Query params:
 * - seo_mentions, seo_citations, seo_sentiment, seo_content, seo_voice
 * - aeo_mentions, aeo_citations, aeo_sentiment, aeo_content, aeo_voice
 * - geo_mentions, geo_citations, geo_sentiment, geo_content, geo_voice
 * - vertical?: 'acquisition' | 'service' | 'parts'
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract SEO metrics
    const seo: AgentTrustMetrics = {
      mentions: Number(searchParams.get('seo_mentions')) || 67,
      citations: Number(searchParams.get('seo_citations')) || 23,
      sentiment: Number(searchParams.get('seo_sentiment')) || 82,
      contentReadiness: Number(searchParams.get('seo_content')) || 78,
      shareOfVoice: Number(searchParams.get('seo_voice')) || 15.2
    };

    // Extract AEO metrics
    const aeo: AgentTrustMetrics = {
      mentions: Number(searchParams.get('aeo_mentions')) || 99,
      citations: Number(searchParams.get('aeo_citations')) || 76,
      sentiment: Number(searchParams.get('aeo_sentiment')) || 76,
      contentReadiness: Number(searchParams.get('aeo_content')) || 65,
      shareOfVoice: Number(searchParams.get('aeo_voice')) || 8.7
    };

    // Extract GEO metrics
    const geo: AgentTrustMetrics = {
      mentions: Number(searchParams.get('geo_mentions')) || 45,
      citations: Number(searchParams.get('geo_citations')) || 31,
      sentiment: Number(searchParams.get('geo_sentiment')) || 84,
      contentReadiness: Number(searchParams.get('geo_content')) || 72,
      shareOfVoice: Number(searchParams.get('geo_voice')) || 12.4
    };

    const agentData: MultiAgentTrustData = { seo, aeo, geo };
    const vertical = (searchParams.get('vertical') || 'acquisition') as Vertical;

    // Calculate trust
    const result = calculateTrust(agentData, vertical);

    return NextResponse.json({
      success: true,
      data: result
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Trust-Engine-Version': '1.0.0'
      }
    });

  } catch (error: any) {
    console.error('[API] Trust calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate trust scores',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

