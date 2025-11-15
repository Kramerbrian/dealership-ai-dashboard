// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDealerSessionContext } from '@/lib/pulse/config';
import { redis } from '@/lib/redis';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * POST /api/pulse-session-init
 * Initialize Pulse session after Clerk login
 * Called by middleware onAuthEvent.login
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from Clerk (would need to fetch from Clerk API in production)
    // For now, use session metadata
    const body = await req.json().catch(() => ({}));
    const { email, dealerId, role } = body;

    // Get session context from config
    const sessionContext = {
      userId,
      email: email || 'unknown',
      dealerId: dealerId || 'default',
      role: role || 'dealer',
      ...getDealerSessionContext({ publicMetadata: { dealer: dealerId, role } }),
    };

    // Store session in Redis (optional, for multi-instance sync)
    const sessionKey = `pulse:session:${userId}`;
    await redis.setex(sessionKey, 3600, JSON.stringify(sessionContext)).catch(() => {
      // Ignore Redis errors - session still works without it
    });

    return NextResponse.json({
      ok: true,
      session: sessionContext,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[pulse-session-init] error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to initialize Pulse session',
      },
      { status: 500 }
    );
  }
}

