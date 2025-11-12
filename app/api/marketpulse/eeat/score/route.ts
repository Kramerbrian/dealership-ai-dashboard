import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * /api/marketpulse/eeat/score
 * --------------------------------------------------------------------------
 * Returns E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * and schema health metrics for the Schema Health Dashboard Tile.
 *
 * This endpoint powers the real-time Schema Health card component.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dealer = url.searchParams.get('dealer') || 'dealershipai-main';

    // In production, this would fetch from your schema audit system
    // For now, we'll return realistic mock data based on deterministic calculation
    const hash = simpleHash(dealer);

    // Base scores with slight variation based on dealer
    const baseC overage = 85 + (hash % 15);
    const baseEEAT = 82 + (hash % 18);

    // Determine status based on coverage
    let status: 'healthy' | 'warning' | 'critical';
    if (baseCoverage >= 90) status = 'healthy';
    else if (baseCoverage >= 75) status = 'warning';
    else status = 'critical';

    // Determine trends (simplified - in production would compare to historical data)
    const trendFactor = (hash % 3) - 1; // -1, 0, or 1
    const trends = {
      coverage: trendFactor > 0 ? 'up' : trendFactor < 0 ? 'down' : 'stable',
      eeat: trendFactor > 0 ? 'up' : trendFactor < 0 ? 'down' : 'stable',
    } as { coverage: 'up' | 'down' | 'stable'; eeat: 'up' | 'down' | 'stable' };

    // Generate recommendations based on scores
    const recommendations: string[] = [];
    if (baseCoverage < 90) {
      recommendations.push('Add AutoDealer schema to homepage');
    }
    if (baseCoverage < 85) {
      recommendations.push('Implement FAQ schema on service pages');
    }
    if (baseEEAT < 85) {
      recommendations.push('Increase review response rate');
    }
    if (baseEEAT < 80) {
      recommendations.push('Add LocalBusiness schema with full NAP');
    }

    const response = {
      dealer,
      schemaCoverage: baseCoverage,
      eeatScore: baseEEAT,
      lastAudit: new Date().toISOString(),
      status,
      trends,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      details: {
        pagesWithSchema: Math.round((baseCoverage / 100) * 45),
        totalPages: 45,
        schemaTypes: [
          'LocalBusiness',
          'AutoDealer',
          'Product',
          'Review',
          'FAQPage',
          'BreadcrumbList',
        ],
        missingSchemaTypes: baseCoverage < 90 ? ['HowTo', 'VideoObject'] : [],
        eeatSignals: {
          experience: baseEEAT + 2,
          expertise: baseEEAT - 1,
          authoritativeness: baseEEAT + 1,
          trustworthiness: baseEEAT,
        },
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('[marketpulse/eeat/score] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        dealer: 'unknown',
        schemaCoverage: 0,
        eeatScore: 0,
        lastAudit: new Date().toISOString(),
        status: 'critical',
        trends: { coverage: 'stable', eeat: 'stable' },
      },
      { status: 500 }
    );
  }
}

// Simple hash function for deterministic variation
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
