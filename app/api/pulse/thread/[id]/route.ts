/**
 * Pulse Thread API
 * GET /api/pulse/thread/[id]?dealerId=xxx
 * Get detailed thread information including events and comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';
import type { PulseCard } from '@/lib/types/pulse';


export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || 'demo-tenant';
    const threadId = params.id;

    // Fetch thread events
    const { data: cards, error } = await supabase
      .from('pulse_cards')
      .select('*')
      .or(`thread_id.eq.${threadId},thread_id.is.null`)
      .eq('dealer_id', dealerId)
      .order('ts', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[pulse/thread] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch thread' },
        { status: 500 }
      );
    }

    // Transform to PulseCard format
    const threadEvents: PulseCard[] = (cards || []).map((card: any) => ({
      id: card.id,
      ts: card.ts,
      level: card.level,
      kind: card.kind,
      title: card.title,
      detail: card.detail,
      delta: card.delta,
      thread: card.thread_type && card.thread_id ? {
        type: card.thread_type,
        id: card.thread_id,
      } : undefined,
      actions: card.actions,
      dedupe_key: card.dedupe_key,
      context: card.context,
      receipts: card.receipts,
    }));

    return NextResponse.json({
      thread: {
        id: threadId,
        events: threadEvents,
        createdAt: threadEvents[threadEvents.length - 1]?.ts,
        updatedAt: threadEvents[0]?.ts,
      },
    });
  } catch (error: any) {
    console.error('[pulse/thread] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

