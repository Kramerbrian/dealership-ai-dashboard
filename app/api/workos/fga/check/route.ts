/**
 * WorkOS FGA Check API
 * Check authorization and query FGA
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAuthorization,
  checkBatch,
  queryFGA,
} from '@/lib/workos-fga';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/fga/check
 * Check authorization (single or batch)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { checks, op, query } = body;

    // Query FGA
    if (query) {
      const result = await queryFGA(query);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Batch check
    if (Array.isArray(checks)) {
      const results = await checkBatch(checks);
      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    // Single check
    if (checks && typeof checks === 'object') {
      const result = await checkAuthorization([checks]);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { error: 'checks array or query string is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[WorkOS FGA Check API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check authorization',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

