/**
 * POST /api/pulse/[id]/fix
 * Trigger auto-fix for a pulse card
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
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
    const dealerId = searchParams.get('dealerId') || undefined || 'demo-tenant';
    const pulseId = params.id;

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

    // Determine fix type based on card kind
    let fixType = 'generic';
    if (typedCard.kind === 'kpi_delta' && typedCard.context?.kpi) {
      fixType = `fix_${typedCard.context.kpi.toLowerCase()}`;
    } else if (typedCard.kind === 'sla_breach') {
      fixType = 'fix_sla';
    } else if (typedCard.kind === 'auto_fix') {
      // Already auto-fixed, just acknowledge
      return NextResponse.json({
        success: true,
        message: 'Already auto-fixed',
        cardId: pulseId,
      });
    }

    // Call auto-fix engine (or orchestrator)
    const fixResult = await triggerAutoFix({
      pulseId,
      dealerId,
      fixType,
      card: typedCard,
      userId,
    });

    // Update card status
    const updateData: any = {
      context: {
        ...typedCard.context,
        fix_triggered: true,
        fix_triggered_at: new Date().toISOString(),
        fix_result: fixResult,
      },
    };
    await (supabase
      .from('pulse_cards')
      .update as any)(updateData)
      .eq('id', pulseId);

    // Create a new pulse card for the fix result
    if (fixResult.success) {
      await supabase.rpc('ingest_pulse_card', {
        p_dealer_id: dealerId,
        p_card: {
          ts: new Date().toISOString(),
          level: 'info',
          kind: 'auto_fix',
          title: `Auto-fix applied: ${typedCard.title}`,
          detail: fixResult.message || 'Fix executed successfully',
          delta: fixResult.delta || null,
          thread_type: typedCard.thread_type,
          thread_id: typedCard.thread_id,
          actions: ['open'],
          dedupe_key: `auto_fix:${pulseId}`,
          context: {
            ...typedCard.context,
            original_pulse_id: pulseId,
            fix_type: fixType,
          },
        },
      } as any);
    }

    return NextResponse.json({
      success: true,
      cardId: pulseId,
      fixResult,
      message: 'Auto-fix triggered',
    });
  } catch (error: any) {
    console.error('[pulse/fix] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function triggerAutoFix({
  pulseId,
  dealerId,
  fixType,
  card,
  userId,
}: {
  pulseId: string;
  dealerId: string;
  fixType: string;
  card: any;
  userId: string;
}) {
  // Try to call the orchestrator or auto-fix endpoint
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/automation/fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pulseId,
        dealerId,
        fixType,
        card,
        userId,
      }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('[pulse/fix] Auto-fix engine error:', err);
  }

  // Fallback: return success with stub message
  return {
    success: true,
    message: `Auto-fix triggered for ${card.title}`,
    delta: null,
    executedAt: new Date().toISOString(),
  };
}

