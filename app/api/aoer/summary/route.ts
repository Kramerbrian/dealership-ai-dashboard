import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get AOER summary for the tenant
    const { data: summary, error } = await supabase
      .from('aoer_summary')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching AOER summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AOER summary' },
        { status: 500 }
      );
    }

    if (!summary) {
      return NextResponse.json(
        { error: 'No AOER summary found for this tenant' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tenantId,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AOER Summary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
