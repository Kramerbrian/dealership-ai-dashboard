import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

/**
 * Get Supabase client (lazy initialization to avoid build-time errors)
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

/**
 * GET /api/integrations
 * Get all active integrations for the authenticated user's dealer
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { integrations: [] },
        { status: 200 }
      );
    }

    const url = new URL(req.url);
    const dealerId = url.searchParams.get('dealerId') || 'demo-tenant';

    // Get dealer integrations with provider details
    const { data: integrations, error: integrationsError } = await supabase
      .from('dealer_integrations')
      .select(`
        *,
        integration_providers (
          provider_name,
          provider_slug,
          category,
          description,
          logo_url,
          capabilities,
          documentation_url
        )
      `)
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false });

    if (integrationsError) {
      console.error('[integrations] Error fetching integrations:', integrationsError);
      return NextResponse.json(
        { error: 'Failed to fetch integrations' },
        { status: 500 }
      );
    }

    // Get integration health for each
    const { data: healthData } = await supabase
      .from('integration_health')
      .select('*')
      .eq('dealer_id', dealerId);

    // Merge health data with integrations
    const enrichedIntegrations = (integrations || []).map((integration) => {
      const health = healthData?.find(h => h.integration_id === integration.id);
      return {
        ...integration,
        health: health || null,
      };
    });

    return NextResponse.json(
      { integrations: enrichedIntegrations },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('[integrations] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations
 * Create a new integration for the dealer
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      dealerId,
      providerId,
      config,
      syncEnabled = true,
      syncIntervalMinutes = 60,
    } = body;

    if (!dealerId || !providerId || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: dealerId, providerId, config' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const { data: provider, error: providerError } = await supabase
      .from('integration_providers')
      .select('id, provider_name, is_premium')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Integration provider not found' },
        { status: 404 }
      );
    }

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('dealer_integrations')
      .select('id')
      .eq('dealer_id', dealerId)
      .eq('provider_id', providerId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Integration already exists for this provider' },
        { status: 409 }
      );
    }

    // Create integration
    const { data: integration, error: createError } = await supabase
      .from('dealer_integrations')
      .insert({
        dealer_id: dealerId,
        provider_id: providerId,
        config,
        sync_enabled: syncEnabled,
        sync_interval_minutes: syncIntervalMinutes,
        next_sync_at: new Date(Date.now() + syncIntervalMinutes * 60 * 1000).toISOString(),
        created_by: userId,
      })
      .select()
      .single();

    if (createError) {
      console.error('[integrations] Error creating integration:', createError);
      return NextResponse.json(
        { error: createError.message || 'Failed to create integration' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { integration },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[integrations] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
