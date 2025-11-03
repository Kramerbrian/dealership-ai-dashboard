/**
 * WorkOS FGA Individual Resource Type API
 * Get, update, and delete a specific resource type
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getResourceType,
  updateResourceType,
  deleteResourceType,
} from '@/lib/workos-fga';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/fga/resource-types/[type]
 * Get a resource type by name
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    const resourceType = await getResourceType(type);

    return NextResponse.json({
      success: true,
      data: resourceType,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get resource type',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workos/fga/resource-types/[type]
 * Update a resource type
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    const body = await req.json();
    const { relations } = body;

    if (!relations) {
      return NextResponse.json(
        { error: 'relations are required' },
        { status: 400 }
      );
    }

    const resourceType = await updateResourceType(type, relations);

    return NextResponse.json({
      success: true,
      data: resourceType,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update resource type',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workos/fga/resource-types/[type]
 * Delete a resource type
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    await deleteResourceType(type);

    return NextResponse.json({
      success: true,
      message: 'Resource type deleted successfully',
    });
  } catch (error: any) {
    console.error('[WorkOS FGA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete resource type',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
