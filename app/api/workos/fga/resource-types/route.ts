/**
 * WorkOS FGA (Fine-Grained Authorization) Resource Types API
 * Manage resource types for authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listResourceTypes,
  createResourceType,
  updateResourceTypes,
} from '@/lib/workos-fga';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/fga/resource-types
 * List all resource types
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resourceTypes = await listResourceTypes();

    return NextResponse.json({
      success: true,
      data: resourceTypes,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list resource types',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workos/fga/resource-types
 * Create a resource type
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, relations } = body;

    if (!type || !relations) {
      return NextResponse.json(
        { error: 'type and relations are required' },
        { status: 400 }
      );
    }

    const resourceType = await createResourceType({ type, relations });

    return NextResponse.json({
      success: true,
      data: resourceType,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create resource type',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workos/fga/resource-types
 * Update multiple resource types at once
 */
export async function PUT(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be an array of resource types' },
        { status: 400 }
      );
    }

    const resourceTypes = await updateResourceTypes(body);

    return NextResponse.json({
      success: true,
      data: resourceTypes,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update resource types',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

