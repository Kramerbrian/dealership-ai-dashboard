import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/audits
 * Get all AI visibility audits for the authenticated user's tenant
 * Query params:
 *   - dealership_id: Filter by dealership ID
 *   - limit: Number of results (default: 50)
 *   - offset: Pagination offset (default: 0)
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

    // Get user context
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, tenant_id, role')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const dealershipId = searchParams.get('dealership_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('ai_visibility_audits')
      .select(`
        id,
        dealership_id,
        dealerships (
          name,
          domain
        ),
        audit_type,
        scan_date,
        ai_visibility_score,
        seo_score,
        search_performance,
        ai_mentions,
        citation_analysis,
        competitor_comparison,
        recommendations_summary,
        status,
        metadata,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply tenant filtering (RLS also enforces this)
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    // Apply dealership filter if provided
    if (dealershipId) {
      query = query.eq('dealership_id', dealershipId);
    }

    // Apply pagination
    query = query
      .order('scan_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: audits, error, count } = await query;

    if (error) {
      console.error('Error fetching audits:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audits' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: audits,
      count: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Audits API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audits
 * Create a new AI visibility audit
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

    // Get user context
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, tenant_id, role')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (!['super_admin', 'enterprise_admin', 'dealership_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create audits' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      dealership_id,
      audit_type = 'full',
      ai_visibility_score,
      seo_score,
      search_performance,
      ai_mentions,
      citation_analysis,
      competitor_comparison,
      recommendations_summary,
      metadata
    } = body;

    if (!dealership_id) {
      return NextResponse.json(
        { error: 'dealership_id is required' },
        { status: 400 }
      );
    }

    // Verify dealership belongs to user's tenant
    const { data: dealership, error: dealershipError } = await supabaseAdmin
      .from('dealerships')
      .select('id, tenant_id')
      .eq('id', dealership_id)
      .single();

    if (dealershipError || !dealership) {
      return NextResponse.json(
        { error: 'Dealership not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'super_admin' && dealership.tenant_id !== user.tenant_id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Create audit
    const { data: audit, error } = await supabaseAdmin
      .from('ai_visibility_audits')
      .insert({
        tenant_id: dealership.tenant_id,
        dealership_id,
        audit_type,
        scan_date: new Date().toISOString(),
        ai_visibility_score,
        seo_score,
        search_performance: search_performance || {},
        ai_mentions: ai_mentions || [],
        citation_analysis: citation_analysis || {},
        competitor_comparison: competitor_comparison || {},
        recommendations_summary: recommendations_summary || {},
        status: 'completed',
        metadata: metadata || {}
      })
      .select(`
        *,
        dealerships (
          name,
          domain
        )
      `)
      .single();

    if (error) {
      console.error('Error creating audit:', error);
      return NextResponse.json(
        { error: 'Failed to create audit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: audit
    }, { status: 201 });

  } catch (error) {
    console.error('Audits API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
