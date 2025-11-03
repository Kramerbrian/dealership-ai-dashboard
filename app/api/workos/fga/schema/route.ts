/**
 * WorkOS FGA Schema API
 * Get and update FGA schema
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFGASchema, updateFGASchema } from '@/lib/workos-fga';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/fga/schema
 * Get FGA schema
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schema = await getFGASchema();

    return NextResponse.json({
      success: true,
      data: schema,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Schema API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get schema',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workos/fga/schema
 * Update FGA schema
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const schema = await updateFGASchema(body);

    return NextResponse.json({
      success: true,
      data: schema,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Schema API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update schema',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

