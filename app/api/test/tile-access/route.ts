/**
 * Test Tile Access Control
 * Endpoint to verify tile access control is working correctly
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveTiles, hasTileAccess, type TileKey } from '@/lib/tiles';
import { requireRBAC } from '@/lib/rbac';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/test/tile-access
 * Test tile access control for a given user tier and role
 * 
 * Query params:
 *   ?tier=1|2|3 (user tier)
 *   ?role=viewer|dealer_user|ops|manager|marketing_director|admin|superadmin
 *   ?tile=site|inventory|traffic|agents|apis|mystery (optional, test specific tile)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tierParam = url.searchParams.get('tier');
    const roleParam = url.searchParams.get('role');
    const tileParam = url.searchParams.get('tile') as TileKey | null;

    // Get user from auth (if available)
    let userTier: 1 | 2 | 3 = 1;
    let userRole: string = 'viewer';

    // Try to get from auth
    try {
      const rbac = await requireRBAC(req, []);
      if (rbac instanceof NextResponse) {
        // Auth failed, use query params
        if (tierParam) userTier = parseInt(tierParam) as 1 | 2 | 3;
        if (roleParam) userRole = roleParam;
      } else {
        // Auth succeeded, use user's actual role
        userRole = rbac.role;
        // TODO: Get user tier from database
        if (tierParam) userTier = parseInt(tierParam) as 1 | 2 | 3;
      }
    } catch {
      // Use query params as fallback
      if (tierParam) userTier = parseInt(tierParam) as 1 | 2 | 3;
      if (roleParam) userRole = roleParam;
    }

    // Test specific tile or all tiles
    if (tileParam) {
      const hasAccess = hasTileAccess(tileParam, userTier, userRole);
      return NextResponse.json({
        success: true,
        tile: tileParam,
        userTier,
        userRole,
        hasAccess,
        message: hasAccess
          ? `User (Tier ${userTier}, ${userRole}) has access to ${tileParam}`
          : `User (Tier ${userTier}, ${userRole}) does NOT have access to ${tileParam}`,
      });
    }

    // Get all available tiles for user
    const availableTiles = getActiveTiles(userTier, userRole);

    // Test all tiles
    const tileTests = [
      'intel',
      'site',
      'inventory',
      'traffic',
      'agents',
      'apis',
      'mystery',
      'block',
      'fixed',
      'admin',
      'super',
    ] as TileKey[];

    const results = tileTests.map((tile) => ({
      tile,
      hasAccess: hasTileAccess(tile, userTier, userRole),
    }));

    return NextResponse.json({
      success: true,
      userTier,
      userRole,
      availableTiles: availableTiles.map((t) => ({
        key: t.key,
        title: t.title,
        tier: t.requireTier,
        role: t.requireRole,
        active: t.active,
      })),
      allTiles: results,
      summary: {
        total: results.length,
        accessible: results.filter((r) => r.hasAccess).length,
        blocked: results.filter((r) => !r.hasAccess).length,
      },
    });
  } catch (error: any) {
    console.error('[test/tile-access] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

