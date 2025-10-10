import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client inside request handlers to avoid build-time errors
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Function to enqueue tenant recomputation using Supabase
async function enqueueTenantRecompute(tenantId: string, priority: string = 'medium'): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    console.log(`[AOER] Queued recompute for tenant: ${tenantId} (priority: ${priority})`);

    // Insert into aoer_queue table
    const { error } = await supabase
      .from('aoer_queue')
      .insert({
        tenant_id: tenantId,
        priority: priority,
        scheduled_at: new Date().toISOString(),
        status: 'queued'
      });

    if (error) {
      console.error(`[AOER] Error queuing tenant ${tenantId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[AOER] Error in enqueueTenantRecompute:`, error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId, priority = 'medium' } = await req.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const success = await enqueueTenantRecompute(tenantId, priority);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Queued recompute for tenant: ${tenantId}`,
        tenantId,
        priority,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to queue tenant for recompute' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('AOER Queue API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get queue status from Supabase
    const { data: queueStatus, error: statusError } = await supabase
      .from('aoer_queue')
      .select('status, priority, count(*)')
      .eq('tenant_id', tenantId)
      .group('status, priority');

    if (statusError) {
      console.error('Error fetching queue status:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch queue status' },
        { status: 500 }
      );
    }

    const status = {
      pending: queueStatus?.filter(q => q.status === 'queued').length || 0,
      processing: queueStatus?.filter(q => q.status === 'processing').length || 0,
      completed: queueStatus?.filter(q => q.status === 'completed').length || 0,
      failed: queueStatus?.filter(q => q.status === 'failed').length || 0
    };

    return NextResponse.json({
      tenantId,
      queueStatus: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AOER Queue Status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
