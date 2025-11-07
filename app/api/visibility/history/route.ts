import { NextResponse } from "next/server";
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/visibility/history?domain=example.com
 * 
 * Returns last 7 days of AIV composite scores
 */
export async function GET(req: Request) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const domain = url.searchParams.get("domain") || "example.com";
    const days = parseInt(url.searchParams.get("days") || "7");

    // Load from database
    const { getPresenceHistory, getAIVSeries, getEngineSeries } = await import('@/lib/db/presence-history');
    
    const history = await getPresenceHistory(isolation.tenantId, domain, days);
    const aivSeries = await getAIVSeries(isolation.tenantId, domain, days);
    const engineSeries = {
      ChatGPT: await getEngineSeries(isolation.tenantId, domain, 'ChatGPT', days),
      Perplexity: await getEngineSeries(isolation.tenantId, domain, 'Perplexity', days),
      Gemini: await getEngineSeries(isolation.tenantId, domain, 'Gemini', days),
      Copilot: await getEngineSeries(isolation.tenantId, domain, 'Copilot', days)
    };

    return NextResponse.json({ 
      domain, 
      days: history.map(h => h.date),
      aiv: aivSeries,
      engines: engineSeries,
      history: history.map(h => ({
        date: h.date,
        aiv: h.aiv_composite,
        engines: h.engines
      }))
    }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error: any) {
    console.error('Visibility history error:', error);
    return NextResponse.json(
      { error: 'Failed to get history' },
      { status: 500 }
    );
  }
}
