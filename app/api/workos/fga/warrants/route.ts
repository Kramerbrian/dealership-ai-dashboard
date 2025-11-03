/**
 * WorkOS FGA Warrants API
 * List, create, and delete warrants (permissions)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listWarrants,
  writeWarrant,
  batchWriteWarrants,
} from '@/lib/workos-fga';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/fga/warrants
 * List all warrants
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const warrants = await listWarrants();

    return NextResponse.json({
      success: true,
      data: warrants,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Warrants API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list warrants',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workos/fga/warrants
 * Create or delete a warrant (single or batch)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Check if it's a batch operation
    if (Array.isArray(body)) {
      const result = await batchWriteWarrants(body);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Single warrant operation
    const {
      op,
      resource,
      relation,
      subject,
    }: {
      op: 'create' | 'delete';
      resource: { resourceType: string; resourceId: string };
      relation: string;
      subject: { resourceType: string; resourceId: string };
    } = body;

    if (!op || !resource || !relation || !subject) {
      return NextResponse.json(
        {
          error:
            'op, resource, relation, and subject are required for single warrant',
        },
        { status: 400 }
      );
    }

    const result = await writeWarrant({
      op: op as 'create' | 'delete',
      resource,
      relation,
      subject,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Warrants API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to write warrant',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

