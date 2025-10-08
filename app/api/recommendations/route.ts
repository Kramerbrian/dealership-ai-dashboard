import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/recommendations
 * Get optimization recommendations for the authenticated user's tenant
 * Query params:
 *   - dealership_id: Filter by dealership ID
 *   - audit_id: Filter by audit ID
 *   - category: Filter by recommendation category
 *   - priority: Filter by priority level
 *   - status: Filter by status (pending, in_progress, completed, dismissed)
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
    const auditId = searchParams.get('audit_id');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('optimization_recommendations')
      .select(`
        id,
        dealership_id,
        audit_id,
        dealerships (
          name,
          domain
        ),
        category,
        title,
        description,
        priority,
        estimated_impact,
        implementation_steps,
        resources,
        status,
        assigned_to,
        due_date,
        completed_at,
        metadata,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply tenant filtering (RLS also enforces this)
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    // Apply filters
    if (dealershipId) {
      query = query.eq('dealership_id', dealershipId);
    }

    if (auditId) {
      query = query.eq('audit_id', auditId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination and ordering
    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: recommendations, error, count } = await query;

    if (error) {
      console.error('Error fetching recommendations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations
 * Create a new recommendation
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
        { error: 'Insufficient permissions to create recommendations' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      dealership_id,
      audit_id,
      category,
      title,
      description,
      priority = 'medium',
      estimated_impact,
      implementation_steps,
      resources,
      assigned_to,
      due_date,
      metadata
    } = body;

    if (!dealership_id || !title || !description) {
      return NextResponse.json(
        { error: 'dealership_id, title, and description are required' },
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

    // Create recommendation
    const { data: recommendation, error } = await supabaseAdmin
      .from('optimization_recommendations')
      .insert({
        tenant_id: dealership.tenant_id,
        dealership_id,
        audit_id,
        category,
        title,
        description,
        priority,
        estimated_impact: estimated_impact || {},
        implementation_steps: implementation_steps || [],
        resources: resources || [],
        status: 'pending',
        assigned_to,
        due_date,
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
      console.error('Error creating recommendation:', error);
      return NextResponse.json(
        { error: 'Failed to create recommendation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recommendation
    }, { status: 201 });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
