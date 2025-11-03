/**
 * WorkOS Audit Log Retention API
 * Get and update audit log retention settings
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAuditLogRetention,
  updateAuditLogRetention,
} from '@/lib/workos-audit-logs';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/audit-logs/retention?organizationId=org_123
 * Get audit log retention for an organization
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId query parameter is required' },
        { status: 400 }
      );
    }

    const retention = await getAuditLogRetention(organizationId);

    return NextResponse.json({
      success: true,
      data: retention,
    });
  } catch (error: any) {
    console.error('[WorkOS Audit Log Retention API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get audit log retention',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workos/audit-logs/retention
 * Update audit log retention for an organization
 */
export async function PUT(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, retentionPeriodInDays } = body;

    if (!organizationId || typeof retentionPeriodInDays !== 'number') {
      return NextResponse.json(
        {
          error:
            'organizationId and retentionPeriodInDays (number) are required',
        },
        { status: 400 }
      );
    }

    const retention = await updateAuditLogRetention(
      organizationId,
      retentionPeriodInDays
    );

    return NextResponse.json({
      success: true,
      data: retention,
    });
  } catch (error: any) {
    console.error('[WorkOS Audit Log Retention API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update audit log retention',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

