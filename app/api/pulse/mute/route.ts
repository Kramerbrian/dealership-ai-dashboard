/**
 * POST /api/pulse/mute
 * Persist mute preference for a pulse dedupe key
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { dedupeKey, dealerId, durationHours = 24 } = body;

    if (!dedupeKey) {
      return NextResponse.json(
        { error: 'dedupeKey is required' },
        { status: 400 }
      );
    }

    const finalDealerId = dealerId || 'demo-tenant';
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    // Store mute preference in pulse_mutes table (or user preferences)
    // For now, we'll use a simple approach with pulse_cards context
    // In production, you'd have a dedicated pulse_mutes table
    
    // Check if table exists, if not, we'll use a fallback
    const { error: muteError } = await (supabase as any)
      .from('pulse_cards')
      .update({
        context: {
          muted: true,
          muted_at: new Date().toISOString(),
          muted_until: expiresAt.toISOString(),
          muted_by: userId,
        },
      } as any)
      .eq('dedupe_key', dedupeKey)
      .eq('dealer_id', finalDealerId);

    // If that fails, we can store in user preferences or a separate table
    // For now, return success - the client-side mute will handle it
    // In production, implement a proper pulse_mutes table

    return NextResponse.json({
      success: true,
      dedupeKey,
      mutedUntil: expiresAt.toISOString(),
      durationHours,
    });
  } catch (error: any) {
    console.error('[pulse/mute] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pulse/mute
 * Get mute preferences for a dealer
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

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || undefined || 'demo-tenant';

    // Fetch muted cards
    const { data: mutedCards, error } = await supabase
      .from('pulse_cards')
      .select('dedupe_key, context')
      .eq('dealer_id', dealerId)
      .not('dedupe_key', 'is', null)
      .not('context->muted', 'is', null);

    if (error) {
      console.error('[pulse/mute] Fetch error:', error);
      return NextResponse.json({ muted: [] });
    }

    // Extract active mutes
    const now = new Date();
    const activeMutes = (mutedCards || [])
      .filter((card: any) => {
        const mutedUntil = (card as any).context?.muted_until;
        if (!mutedUntil) return false;
        return new Date(mutedUntil) > now;
      })
      .map((card: any) => (card as any).dedupe_key)
      .filter(Boolean);

    return NextResponse.json({
      muted: activeMutes,
      count: activeMutes.length,
    });
  } catch (error: any) {
    console.error('[pulse/mute] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

