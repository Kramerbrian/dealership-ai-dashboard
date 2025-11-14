import { NextRequest, NextResponse } from 'next/server';
import { pushInboxTile, pushInboxTiles } from '@/lib/pulse/inbox';
import { z } from 'zod';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const TileSchema = z.object({
  key: z.string().optional(),
  title: z.string(),
  kpi: z.string().optional(),
  delta: z.string().optional(),
  actions: z.array(z.string()).optional(),
  ts: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
});

const PushRequestSchema = z.object({
  tenant: z.string(),
  tile: TileSchema.optional(),
  tiles: z.array(TileSchema).optional(),
});

/**
 * POST /api/pulse/inbox/push
 * Push agent tiles into the pulse inbox
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PushRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid request body',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { tenant, tile, tiles } = parsed.data;

    if (tiles && tiles.length > 0) {
      // Batch push
      const count = await pushInboxTiles(tenant, tiles);
      return NextResponse.json({
        ok: true,
        pushed: count,
        total: tiles.length,
      });
    } else if (tile) {
      // Single push
      const success = await pushInboxTile(tenant, tile);
      return NextResponse.json({
        ok: success,
        pushed: success ? 1 : 0,
      });
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: 'Either "tile" or "tiles" must be provided',
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[pulse/inbox/push] error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to push inbox tile',
      },
      { status: 500 }
    );
  }
}

