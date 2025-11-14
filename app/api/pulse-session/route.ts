import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { redis } from '@/lib/redis';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/pulse-session
 * Clear Pulse session on Clerk logout
 * Called by middleware onAuthEvent.logout
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Clear session from Redis
    const sessionKey = `pulse:session:${userId}`;
    await redis.del(sessionKey).catch(() => {
      // Ignore Redis errors
    });

    return NextResponse.json({
      ok: true,
      message: 'Pulse session cleared',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[pulse-session] error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to clear Pulse session',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pulse-session
 * Get current Pulse session
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get from Redis
    const sessionKey = `pulse:session:${userId}`;
    const sessionData = await redis.get(sessionKey).catch(() => null);

    if (sessionData) {
      try {
        const session = JSON.parse(sessionData as string);
        return NextResponse.json({
          ok: true,
          session,
        });
      } catch {
        // Invalid JSON, continue to return minimal session
      }
    }

    // Return minimal session if Redis unavailable
    return NextResponse.json({
      ok: true,
      session: {
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[pulse-session] error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to get Pulse session',
      },
      { status: 500 }
    );
  }
}

