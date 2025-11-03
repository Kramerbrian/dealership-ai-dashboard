/**
 * WorkOS Audit Log Actions API
 * List audit log actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogActions } from '@/lib/workos-audit-logs';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/audit-logs/actions
 * Get all audit log actions
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actions = await getAuditLogActions();

    return NextResponse.json({
      success: true,
      data: actions,
    });
  } catch (error: any) {
    console.error('[WorkOS Audit Log Actions API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch audit log actions',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

