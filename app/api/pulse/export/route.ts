/**
 * Pulse Export API
 * GET /api/pulse/export?format=csv|json&filter=all
 * Export pulse cards to CSV or JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';
import type { PulseCard } from '@/lib/types/pulse';


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
    const dealerId = searchParams.get('dealerId') || undefined || 'demo-tenant';
    const filter = searchParams.get('filter') || undefined || 'all';
    const format = searchParams.get('format') || undefined || 'json';
    const limit = parseInt(searchParams.get('limit') || undefined || '1000');

    // Fetch cards
    const { data: cards, error } = await supabase
      .rpc('get_pulse_inbox', {
        p_dealer_id: dealerId,
        p_filter: filter,
        p_limit: limit,
      });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      );
    }

    const pulseCards: PulseCard[] = ((cards as any) || []).map((card: any) => ({
      id: card.id,
      ts: card.ts,
      level: card.level,
      kind: card.kind,
      title: card.title,
      detail: card.detail,
      delta: card.delta,
      thread: card.thread_type && card.thread_id
        ? { type: card.thread_type, id: card.thread_id }
        : undefined,
      actions: card.actions,
      dedupe_key: card.dedupe_key,
      context: card.context,
      receipts: card.receipts,
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Timestamp', 'Level', 'Kind', 'Title', 'Detail', 'Delta', 'Thread Type', 'Thread ID'];
      const rows = pulseCards.map(card => [
        card.id,
        card.ts,
        card.level,
        card.kind,
        card.title,
        card.detail || '',
        card.delta?.toString() || '',
        card.thread?.type || '',
        card.thread?.id || '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="pulse-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // JSON format (default)
    return NextResponse.json({
      exportDate: new Date().toISOString(),
      filter,
      totalCards: pulseCards.length,
      cards: pulseCards,
    }, {
      headers: {
        'Content-Disposition': `attachment; filename="pulse-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error('[pulse/export] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

