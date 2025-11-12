import { NextRequest, NextResponse } from 'next/server';
import { sbAdmin } from '@/lib/supabase';
import { allow, rl_telemetry } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'anon';
  const rl = await allow(rl_telemetry, `telemetry:${ip}`);
  
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, rateLimited: true },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));

  try {
    if (!process.env.SUPABASE_URL || !sbAdmin) {
      // In development, allow telemetry to succeed even without Supabase
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ ok: true, warn: 'no supabase (dev)' });
      }
      // In production, log but don't fail
      console.warn('[Telemetry] Supabase not configured');
      return NextResponse.json({ ok: true, warn: 'telemetry disabled' });
    }

    const { error } = await sbAdmin.from('telemetry_events').insert({
      type: body.type || 'unknown',
      payload: body.payload ?? null,
      ts: body.ts ?? Date.now(),
      ip
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // Log error but don't fail the request - telemetry should be non-blocking
    console.error('[Telemetry] Failed to insert event:', e);
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!process.env.SUPABASE_URL || !sbAdmin) {
      return NextResponse.json({ events: [], warn: 'no supabase' });
    }

    const { data, error } = await sbAdmin
      .from('telemetry_events')
      .select('*')
      .order('ts', { ascending: false })
      .limit(200);

    if (error) throw error;

    return NextResponse.json({ events: data || [] });
  } catch (e: any) {
    console.error('[Telemetry] Failed to fetch events:', e);
    return NextResponse.json(
      { events: [], error: e.message },
      { status: 500 }
    );
  }
}
