import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/marketpulse/compute
 * Mock KPI endpoint returning AIV, ATI, schemaCoverage, trustScore, CWV, etc.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain') || 'example.com';
  const tenant = url.searchParams.get('tenant') || 'default';

  // Mock KPI data - replace with real computation later
  const data = {
    domain,
    tenant,
    timestamp: new Date().toISOString(),
    kpis: {
      aiv: 87.3, // AI Visibility Index
      ati: 92.1, // AI Trust Index
      schemaCoverage: 78.5, // Schema markup coverage percentage
      trustScore: 85.2, // Overall trust score
      cwv: {
        lcp: 1.8, // Largest Contentful Paint (seconds)
        fid: 12, // First Input Delay (milliseconds)
        cls: 0.05, // Cumulative Layout Shift
        fcp: 1.2, // First Contentful Paint (seconds)
        ttfb: 180 // Time to First Byte (milliseconds)
      },
      seo: {
        score: 68,
        issues: ['Missing meta descriptions on 12 pages', 'Slow page load on VDPs']
      },
      aeo: {
        score: 54,
        issues: ['FAQ schema missing on Service pages', 'Answer blocks not optimized']
      },
      geo: {
        score: 41,
        issues: ['Limited local business schema', 'GBP data incomplete']
      }
    },
    trends: {
      aiv: { change: 2.3, direction: 'up' },
      ati: { change: -0.5, direction: 'down' },
      schemaCoverage: { change: 5.2, direction: 'up' }
    },
    confidence: 'HIGH' as const
  };

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
