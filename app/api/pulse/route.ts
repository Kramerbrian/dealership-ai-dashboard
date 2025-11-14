/**
 * Pulse API - Decision Inbox with Database Persistence
 * POST /api/pulse - Ingest pulse cards with auto-promotion
 * GET /api/pulse - Fetch pulse inbox with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';;
import type { PulseCard } from '@/lib/types/pulse';


export const dynamic = 'force-dynamic';

/**
 * POST /api/pulse - Ingest pulse cards with deduplication and auto-promotion
 */
export async function POST(req: NextRequest) {
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
      // Auth failed (likely called from dealershipai.com instead of dash.dealershipai.com)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const cards: PulseCard[] = Array.isArray(body) ? body : [body];
    const dealerId = req.nextUrl.searchParams.get('dealerId') || 'demo-tenant';

    if (cards.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: expected array of PulseCard' }, { status: 400 });
    }

    // Validate cards
    for (const card of cards) {
      if (!card.level || !card.kind || !card.title) {
        return NextResponse.json(
          { error: `Invalid card: missing required fields (level, kind, title)` },
          { status: 400 }
        );
      }
    }

    // Ingest each card using stored function (handles deduplication + auto-promotion)
    const ingestedIds: (string | null)[] = [];
    for (const card of cards) {
      const cardJson = {
        ts: card.ts || new Date().toISOString(),
        level: card.level,
        kind: card.kind,
        title: card.title,
        detail: card.detail,
        delta: card.delta,
        thread_type: card.thread?.type,
        thread_id: card.thread?.id,
        actions: card.actions || [],
        dedupe_key: card.dedupe_key,
        ttl_sec: card.ttl_sec,
        context: card.context || {},
        receipts: card.receipts || [],
      };

      const { data, error } = await supabase
        .rpc('ingest_pulse_card', {
          p_dealer_id: dealerId,
          p_card: cardJson,
        });

      if (error) {
        console.error('[pulse] Ingest error:', error);
      } else {
        ingestedIds.push(data);
      }
    }

    // Get auto-promoted incidents
    const { data: incidents } = await supabase
      .from('pulse_incidents')
      .select('*')
      .in('pulse_card_id', ingestedIds.filter(Boolean))
      .eq('dealer_id', dealerId);

    return NextResponse.json({
      success: true,
      cardsReceived: cards.length,
      cardsIngested: ingestedIds.filter(Boolean).length,
      promotedIncidents: incidents?.length || 0,
      incidents: incidents || [],
    });
  } catch (error: any) {
    console.error('[pulse] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pulse - Fetch pulse inbox with filtering
 */
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
      // Auth failed (likely called from dealershipai.com instead of dash.dealershipai.com)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || 'demo-tenant';
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch cards using stored function
    const { data: cards, error } = await supabase
      .rpc('get_pulse_inbox', {
        p_dealer_id: dealerId,
        p_filter: filter,
        p_limit: limit,
      });

    if (error) {
      console.error('[pulse] GET error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pulse cards' },
        { status: 500 }
      );
    }

    // Transform to PulseCard format
    const pulseCards: PulseCard[] = (cards || []).map((card: any) => ({
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

    // Get digest summary
    const { data: digest } = await supabase
      .from('pulse_digest')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('digest_date', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      cards: pulseCards,
      filter,
      limit,
      digest: digest || null,
    });
  } catch (error: any) {
    console.error('[pulse] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

