/**
 * WorkOS Audit Logs API
 * Create audit log events and manage schemas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuditLogEvent, createAuditLogSchema, getAuditLogSchemas } from '@/lib/workos-audit-logs';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/audit-logs
 * Create an audit log event
 */
export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const authResult = await getAuthenticatedUser(req);
    
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      organizationId,
      action,
      occurredAt,
      version,
      actor,
      targets,
      context,
      metadata,
      idempotencyKey,
    } = body;

    if (!organizationId || !action || !actor) {
      return NextResponse.json(
        { error: 'organizationId, action, and actor are required' },
        { status: 400 }
      );
    }

    await createAuditLogEvent({
      organizationId,
      action,
      occurredAt: occurredAt ? new Date(occurredAt) : undefined,
      version,
      actor,
      targets,
      context,
      metadata,
      idempotencyKey,
    });

    return NextResponse.json({
      success: true,
      message: 'Audit log event created',
    });

  } catch (error: any) {
    console.error('[WorkOS Audit Logs API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create audit log event',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workos/audit-logs/schemas?action=user.viewed_invoice
 * Get audit log schemas for an action
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { error: 'action query parameter is required' },
        { status: 400 }
      );
    }

    const schemas = await getAuditLogSchemas(action);

    return NextResponse.json({
      success: true,
      data: schemas,
    });
  } catch (error: any) {
    console.error('[WorkOS Audit Logs API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch audit log schemas',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

