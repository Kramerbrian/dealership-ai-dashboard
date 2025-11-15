// @ts-nocheck
/**
 * Pulse Stream API - Server-Sent Events
 * GET /api/pulse/stream?filter=all&dealerId=demo-tenant
 * Real-time updates for Pulse Decision Inbox
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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
      return new Response('Unauthorized', { status: 401 });
    }

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || undefined || 'demo-tenant';
    const filter = searchParams.get('filter') || undefined || 'all';

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        send({ type: 'connected', timestamp: new Date().toISOString() });

        // Poll for updates every 5 seconds
        const interval = setInterval(async () => {
          try {
            const { data: cards, error } = await supabase
              .rpc('get_pulse_inbox', {
                p_dealer_id: dealerId,
                p_filter: filter,
                p_limit: 50,
              });

            if (error) {
              console.error('[pulse/stream] Error:', error);
              return;
            }

            // Transform to PulseCard format
            const pulseCards = ((cards as any) || []).map((card: any) => ({
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

            send({
              type: 'update',
              cards: pulseCards,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error('[pulse/stream] Poll error:', error);
          }
        }, 5000);

        // Send heartbeat every 30 seconds
        const heartbeat = setInterval(() => {
          send({ type: 'heartbeat', timestamp: new Date().toISOString() });
        }, 30000);

        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          clearInterval(heartbeat);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[pulse/stream] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

