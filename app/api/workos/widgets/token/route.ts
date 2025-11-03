/**
 * WorkOS Widgets Token API
 * Generate tokens for embedded widgets
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWidgetToken } from '@/lib/workos-widgets';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/widgets/token
 * Get a widget token
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, userId, scopes } = body;

    if (!organizationId || !userId || !Array.isArray(scopes)) {
      return NextResponse.json(
        {
          error:
            'organizationId, userId, and scopes (array) are required',
        },
        { status: 400 }
      );
    }

    const result = await getWidgetToken({
      organizationId,
      userId,
      scopes,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[WorkOS Widgets API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get widget token',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

