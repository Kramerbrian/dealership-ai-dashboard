/**
 * WorkOS FGA Resources API
 * Create, list, update, delete, and batch operations on resources
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listResources,
  createResource,
  updateResource,
  batchWriteResources,
} from '@/lib/workos-fga';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/fga/resources?id=user_123&type=user
 * Get a specific resource or list all resources
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get('id');
    const resourceType = searchParams.get('type');

    // If both ID and type are provided, get specific resource
    if (resourceId && resourceType) {
      const { getResource } = await import('@/lib/workos-fga');
      const resource = await getResource(resourceType, resourceId);
      return NextResponse.json({
        success: true,
        data: resource,
      });
    }

    // Otherwise, list all resources
    const resources = await listResources();

    return NextResponse.json({
      success: true,
      data: resources,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Resources API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get resources',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workos/fga/resources
 * Create a resource or batch create/delete resources
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Check if it's a batch operation
    if (body.op && Array.isArray(body.resources)) {
      const { op, resources } = body;
      if (!['create', 'delete'].includes(op)) {
        return NextResponse.json(
          { error: 'op must be "create" or "delete" for batch operations' },
          { status: 400 }
        );
      }

      const result = await batchWriteResources(
        op as 'create' | 'delete',
        resources
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Single resource creation
    const { resource, meta } = body;

    if (!resource || !resource.resourceType) {
      return NextResponse.json(
        { error: 'resource with resourceType is required' },
        { status: 400 }
      );
    }

    const created = await createResource({ resource, meta });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Resources API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create resource',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workos/fga/resources
 * Update a resource
 */
export async function PUT(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resource, meta } = body;

    if (!resource || !resource.resourceType || !resource.resourceId) {
      return NextResponse.json(
        {
          error: 'resource with resourceType and resourceId is required',
        },
        { status: 400 }
      );
    }

    const updated = await updateResource({ resource, meta });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Resources API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update resource',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workos/fga/resources?type=user&id=user_123
 * Delete a resource
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resourceType = searchParams.get('type');
    const resourceId = searchParams.get('id');

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'type and id query parameters are required' },
        { status: 400 }
      );
    }

    const { deleteResource } = await import('@/lib/workos-fga');
    await deleteResource(resourceType, resourceId);

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Resources API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete resource',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

