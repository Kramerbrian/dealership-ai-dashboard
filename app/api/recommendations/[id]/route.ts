import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/recommendations/[id]
 * Get a specific recommendation by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get recommendation by ID
    let query = supabaseAdmin
      .from('optimization_recommendations')
      .select(`
        *,
        dealerships (
          id,
          name,
          domain,
          location
        )
      `)
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { data: recommendation, error } = await query.single();

    if (error) {
      console.error('Error fetching recommendation:', error);
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recommendation
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/recommendations/[id]
 * Update a recommendation
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    const body = await req.json();
    const updates: any = {};

    // Allow updating various fields
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.status !== undefined) {
      updates.status = body.status;
      // If status is completed, set completed_at timestamp
      if (body.status === 'completed' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString();
      }
    }
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to;
    if (body.due_date !== undefined) updates.due_date = body.due_date;
    if (body.estimated_impact !== undefined) updates.estimated_impact = body.estimated_impact;
    if (body.implementation_steps !== undefined) updates.implementation_steps = body.implementation_steps;
    if (body.resources !== undefined) updates.resources = body.resources;
    if (body.metadata !== undefined) updates.metadata = body.metadata;
    if (body.completed_at !== undefined) updates.completed_at = body.completed_at;

    let query = supabaseAdmin
      .from('optimization_recommendations')
      .update(updates)
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { data: recommendation, error } = await query.select().single();

    if (error) {
      console.error('Error updating recommendation:', error);
      return NextResponse.json(
        { error: 'Failed to update recommendation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recommendation
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recommendations/[id]
 * Delete a recommendation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Check permissions - only admins can delete
    if (!['super_admin', 'enterprise_admin', 'dealership_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    let query = supabaseAdmin
      .from('optimization_recommendations')
      .delete()
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting recommendation:', error);
      return NextResponse.json(
        { error: 'Failed to delete recommendation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recommendation deleted successfully'
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
