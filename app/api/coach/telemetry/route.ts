import { NextRequest, NextResponse } from 'next/server';
import type { CoachTelemetry } from '@/packages/core-models/src/coach';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/coach/telemetry
 * 
 * Records coach outcome for learning loop
 */
export async function POST(req: NextRequest) {
  try {
    const telemetry: CoachTelemetry = await req.json();

    // Validate required fields
    if (!telemetry.suggestionId || !telemetry.eventId || !telemetry.userId || !telemetry.dealerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Supabase
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error } = await supabase
        .from('coach_telemetry')
        .insert({
          suggestion_id: telemetry.suggestionId,
          event_id: telemetry.eventId,
          user_id: telemetry.userId,
          dealer_id: telemetry.dealerId,
          outcome: telemetry.outcome,
          occurred_at: telemetry.occurredAt,
          metadata: telemetry.metadata || {},
        });

      if (error) {
        console.error('[Coach Telemetry] Supabase error:', error);
        // Don't fail the request - telemetry is non-critical
      }
    } else {
      // Fallback: log if Supabase not configured
      console.log('[Coach Telemetry]', {
        suggestionId: telemetry.suggestionId,
        eventId: telemetry.eventId,
        outcome: telemetry.outcome,
        userId: telemetry.userId,
        dealerId: telemetry.dealerId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Coach Telemetry] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

