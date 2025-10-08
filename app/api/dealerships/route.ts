import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dealerships
 * Get all dealerships for the authenticated user's tenant
 */
export async function GET(req: NextRequest) {
  try {
    // Get user authentication from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user context to determine tenant
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

    // Get dealerships based on user role and tenant
    let query = supabaseAdmin
      .from('dealerships')
      .select(`
        id,
        tenant_id,
        name,
        domain,
        location,
        contact_email,
        status,
        settings,
        created_at,
        updated_at
      `);

    // Apply tenant filtering (RLS will also enforce this)
    if (user.role !== 'super_admin') {
      query = query.eq('tenant_id', user.tenant_id);
    }

    const { data: dealerships, error } = await query.order('name', { ascending: true });

    if (error) {
      console.error('Error fetching dealerships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dealerships' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealerships,
      count: dealerships?.length || 0
    });

  } catch (error) {
    console.error('Dealerships API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dealerships
 * Create a new dealership
 */
export async function POST(req: NextRequest) {
  try {
    // Get user authentication from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user context to determine tenant and permissions
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

    // Check if user has permission to create dealerships
    if (!['super_admin', 'enterprise_admin', 'dealership_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, domain, location, contact_email, settings } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      );
    }

    // Create dealership
    const { data: dealership, error } = await supabaseAdmin
      .from('dealerships')
      .insert({
        tenant_id: user.tenant_id,
        name,
        domain,
        location: location || {},
        contact_email,
        settings: settings || {},
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dealership:', error);
      return NextResponse.json(
        { error: 'Failed to create dealership' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealership
    }, { status: 201 });

  } catch (error) {
    console.error('Dealerships API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
