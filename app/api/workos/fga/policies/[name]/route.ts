/**
 * WorkOS FGA Individual Policy API
 * Get, update, and delete a specific policy
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPolicy,
  updatePolicy,
  deletePolicy,
} from '@/lib/workos-fga';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/fga/policies/[name]
 * Get a policy by name
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = params;
    const policy = await getPolicy(name);

    return NextResponse.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Policy API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get policy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workos/fga/policies/[name]
 * Update a policy
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = params;
    const body = await req.json();
    const policy = await updatePolicy(name, body);

    return NextResponse.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Policy API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update policy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workos/fga/policies/[name]
 * Delete a policy
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = params;
    await deletePolicy(name);

    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully',
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Policy API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete policy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

