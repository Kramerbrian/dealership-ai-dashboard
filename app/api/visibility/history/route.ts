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

    // TODO: replace with your presence history (store last N presence snapshots)
    // This would query your database:
    // const history = await db.presence_history
    //   .find({ tenant_id: isolation.tenantId, domain })
    //   .orderBy('date', 'desc')
    //   .limit(7);

    const today = new Date();
    const days = [...Array(7)].map((_,i)=> {
      const d = new Date(today.getTime() - (6 - i) * 24 * 3600 * 1000);
      return d.toISOString().slice(0,10);
    });

    // synthetic AIV: 80..92 with gentle wiggle
    const base = 86;
    const series = days.map((_,i)=> base + Math.round(Math.sin(i)*4));

    return NextResponse.json({ 
      domain, 
      days, 
      aiv: series 
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
