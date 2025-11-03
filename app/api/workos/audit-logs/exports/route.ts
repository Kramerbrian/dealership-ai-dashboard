/**
 * WorkOS Audit Log Exports API
 * Create and retrieve audit log exports
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createAuditLogExport,
  getAuditLogExport,
} from '@/lib/workos-audit-logs';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/audit-logs/exports
 * Create an audit log export
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      organizationId,
      rangeStart,
      rangeEnd,
      actions,
      actors,
      targets,
    } = body;

    if (!organizationId || !rangeStart || !rangeEnd) {
      return NextResponse.json(
        { error: 'organizationId, rangeStart, and rangeEnd are required' },
        { status: 400 }
      );
    }

    const export_ = await createAuditLogExport({
      organizationId,
      rangeStart: new Date(rangeStart),
      rangeEnd: new Date(rangeEnd),
      actions,
      actors,
      targets,
    });

    return NextResponse.json({
      success: true,
      data: export_,
    });
  } catch (error: any) {
    console.error('[WorkOS Audit Log Exports API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create audit log export',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workos/audit-logs/exports?id=export_123
 * Get an audit log export by ID
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exportId = searchParams.get('id');

    if (!exportId) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    const export_ = await getAuditLogExport(exportId);

    return NextResponse.json({
      success: true,
      data: export_,
    });
  } catch (error: any) {
    console.error('[WorkOS Audit Log Exports API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get audit log export',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

