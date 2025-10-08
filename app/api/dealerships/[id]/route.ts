import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dealerships/[id]
 * Get a specific dealership by ID
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

    // Get dealership by ID
    let query = supabaseAdmin
      .from('dealerships')
      .select('*')
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { data: dealership, error } = await query.single();

    if (error) {
      console.error('Error fetching dealership:', error);
      return NextResponse.json(
        { error: 'Dealership not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealership
    });

  } catch (error) {
    console.error('Dealership API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/dealerships/[id]
 * Update a specific dealership
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
    const { name, domain, location, contact_email, status, settings } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (domain !== undefined) updates.domain = domain;
    if (location !== undefined) updates.location = location;
    if (contact_email !== undefined) updates.contact_email = contact_email;
    if (status !== undefined) updates.status = status;
    if (settings !== undefined) updates.settings = settings;

    let query = supabaseAdmin
      .from('dealerships')
      .update(updates)
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { data: dealership, error } = await query.select().single();

    if (error) {
      console.error('Error updating dealership:', error);
      return NextResponse.json(
        { error: 'Failed to update dealership' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealership
    });

  } catch (error) {
    console.error('Dealership API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dealerships/[id]
 * Delete a specific dealership
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
      .from('dealerships')
      .delete()
      .eq('id', params.id);

    // Apply tenant filtering for non-superadmin users
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { error } = await query;

    if (error) {
      console.error('Error deleting dealership:', error);
      return NextResponse.json(
        { error: 'Failed to delete dealership' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dealership deleted successfully'
    });

  } catch (error) {
    console.error('Dealership API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
