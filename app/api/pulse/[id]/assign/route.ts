/**
 * POST /api/pulse/[id]/assign
 * Assign a pulse card to a team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
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
    const dealerId = searchParams.get('dealerId') || undefined || 'demo-tenant';
    const params = await context.params;
    const pulseId = params.id;
    const body = await req.json();
    const { assigneeId, assigneeName, note } = body;

    if (!assigneeId) {
      return NextResponse.json(
        { error: 'assigneeId is required' },
        { status: 400 }
      );
    }

    // Fetch the pulse card
    const { data: card, error: cardError } = await supabase
      .from('pulse_cards')
      .select('*')
      .eq('id', pulseId)
      .eq('dealer_id', dealerId)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Pulse card not found' },
        { status: 404 }
      );
    }

    // Type the card as any to access properties
    const typedCard = card as any;

    // Update card with assignment
    const updateData: any = {
      context: {
        ...typedCard.context,
        assigned_to: assigneeId,
        assigned_to_name: assigneeName || assigneeId,
        assigned_at: new Date().toISOString(),
        assigned_by: userId,
        assignment_note: note || null,
      },
    };
    const { error: updateError } = await (supabase
      .from('pulse_cards')
      .update as any)(updateData)
      .eq('id', pulseId);

    if (updateError) {
      console.error('[pulse/assign] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to assign pulse card' },
        { status: 500 }
      );
    }

    // Create a new pulse card for the assignment event
    await supabase.rpc('ingest_pulse_card', {
      p_dealer_id: dealerId,
      p_card: {
        ts: new Date().toISOString(),
        level: 'info',
        kind: 'incident_opened',
        title: `Assigned to ${assigneeName || assigneeId}: ${typedCard.title}`,
        detail: note || `Pulse card assigned by ${userId}`,
        thread_type: typedCard.thread_type,
        thread_id: typedCard.thread_id,
        actions: ['open'],
        dedupe_key: `assignment:${pulseId}`,
        context: {
          ...typedCard.context,
          original_pulse_id: pulseId,
          assignment_event: true,
        },
      },
    } as any);

    return NextResponse.json({
      success: true,
      cardId: pulseId,
      assignedTo: assigneeId,
      assignedToName: assigneeName,
      assignedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[pulse/assign] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

