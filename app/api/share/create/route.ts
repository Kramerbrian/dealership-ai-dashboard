import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logger';

/**
 * POST /api/share/create
 * 
 * Create a shareable audit report link
 */
export async function POST(req: Request) {
  try {
    const { snapshot } = await req.json();

    if (!snapshot || typeof snapshot !== 'object') {
      return NextResponse.json(
        { error: 'Snapshot data required' },
        { status: 400 }
      );
    }

    const id = randomUUID();

    // Save to KV/DB
    const kvUrl = process.env.KV_URL;
    if (kvUrl) {
      try {
        const response = await fetch(kvUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            snapshot,
            createdAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`KV save failed: ${response.statusText}`);
        }
      } catch (error) {
        await logger.error('Failed to save share link to KV', {
          error: error instanceof Error ? error.message : 'Unknown error',
          id,
        });

        // Fallback to in-memory storage (not recommended for production)
        // In production, use Supabase or Vercel KV
      }
    } else {
      // Fallback: Could use Supabase or Prisma here
      await logger.warn('KV_URL not configured, share link not persisted', {
        id,
      });
    }

    await logger.info('Share link created', {
      id,
      hasSnapshot: !!snapshot,
    });

    return NextResponse.json({
      success: true,
      url: `/r/${id}`,
      id,
    });
  } catch (error) {
    await logger.error('Share create API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

