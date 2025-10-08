import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/audits/[id]
 * Get a specific audit by ID
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

    // Get audit by ID with full details
    let query = supabaseAdmin
      .from('ai_visibility_audits')
      .select(`
        *,
        dealerships (
          id,
          name,
          domain,
          location,
          contact_email
        )
      `)
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { data: audit, error } = await query.single();

    if (error) {
      console.error('Error fetching audit:', error);
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: audit
    });

  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/audits/[id]
 * Update an audit (e.g., status, metadata)
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

    // Check permissions
    if (!['super_admin', 'enterprise_admin', 'dealership_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updates: any = {};

    // Only allow updating certain fields
    if (body.status !== undefined) updates.status = body.status;
    if (body.metadata !== undefined) updates.metadata = body.metadata;
    if (body.recommendations_summary !== undefined) {
      updates.recommendations_summary = body.recommendations_summary;
    }

    let query = supabaseAdmin
      .from('ai_visibility_audits')
      .update(updates)
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { data: audit, error } = await query.select().single();

    if (error) {
      console.error('Error updating audit:', error);
      return NextResponse.json(
        { error: 'Failed to update audit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: audit
    });

  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audits/[id]
 * Delete an audit
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
    if (!['super_admin', 'enterprise_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    let query = supabaseAdmin
      .from('ai_visibility_audits')
      .delete()
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting audit:', error);
      return NextResponse.json(
        { error: 'Failed to delete audit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Audit deleted successfully'
    });

  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
