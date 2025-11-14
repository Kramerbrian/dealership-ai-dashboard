/**
 * Pulse Comments API
 * GET /api/pulse/comments?cardId=xxx - Get comments for a card
 * POST /api/pulse/comments - Add a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';;


export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Wrap auth() in try-catch to handle calls from non-Clerk domains
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'cardId required' }, { status: 400 });
    }

    // Fetch comments from database (if table exists)
    // For now, return empty array
    return NextResponse.json({ comments: [] });
  } catch (error: any) {
    console.error('[pulse/comments] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Wrap auth() in try-catch to handle calls from non-Clerk domains
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cardId, content, mentions, replyTo } = body;

    if (!cardId || !content) {
      return NextResponse.json(
        { error: 'cardId and content required' },
        { status: 400 }
      );
    }

    // Store comment in database (if table exists)
    // For now, return success
    return NextResponse.json({
      success: true,
      comment: {
        id: `comment-${Date.now()}`,
        userId,
        content,
        mentions: mentions || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[pulse/comments] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

