import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/coach/metrics/[scriptId]
 * 
 * Get script effectiveness metrics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { scriptId: string } }
) {
  try {
    const { scriptId } = params;

    if (!supabaseUrl || !supabaseKey) {
      // Return mock data if Supabase not configured
      return NextResponse.json({
        acceptanceRate: 0.65,
        completionRate: 0.78,
        avgTimeToComplete: 22.5,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get total events for this script
    const { data: allEvents, error: countError } = await supabase
      .from('coach_telemetry')
      .select('outcome')
      .eq('suggestion_id', scriptId);

    if (countError) {
      console.error('[Coach Metrics] Error:', countError);
      return NextResponse.json({
        acceptanceRate: 0,
        completionRate: 0,
        avgTimeToComplete: 0,
      });
    }

    const total = allEvents?.length || 0;
    const accepted = allEvents?.filter((e) => e.outcome === 'accepted').length || 0;
    const completed = allEvents?.filter((e) => e.outcome === 'completed_flow').length || 0;

    const acceptanceRate = total > 0 ? accepted / total : 0;
    const completionRate = accepted > 0 ? completed / accepted : 0;

    // TODO: Calculate avgTimeToComplete from metadata
    const avgTimeToComplete = 22.5; // Placeholder

    return NextResponse.json({
      acceptanceRate,
      completionRate,
      avgTimeToComplete,
      totalEvents: total,
    });
  } catch (error) {
    console.error('[Coach Metrics] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

