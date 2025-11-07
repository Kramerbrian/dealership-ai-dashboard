import { NextRequest, NextResponse } from 'next/server';
import { enforceTenantIsolation } from '@/lib/api-protection/tenant-isolation';
import { getActiveTiles } from '@/lib/pulse/tile-generator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pulse/tiles
 * 
 * Get active pulse tiles sorted by priority
 */
export async function GET(req: NextRequest) {
  try {
    const isolation = await enforceTenantIsolation(req);
    if (!isolation.allowed || !isolation.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const tiles = await getActiveTiles(isolation.tenantId, limit);

    return NextResponse.json({
      success: true,
      tiles,
      count: tiles.length
    }, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    console.error('Get tiles error:', error);
    return NextResponse.json(
      { error: 'Failed to get tiles' },
      { status: 500 }
    );
  }
}

