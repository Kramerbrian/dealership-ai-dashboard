/**
 * WorkOS Audit Log Schema API
 * Create and manage audit log schemas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuditLogSchema } from '@/lib/workos-audit-logs';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/audit-logs/schemas
 * Create an audit log schema
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
    const { action, actor, targets, metadata } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    const schema = await createAuditLogSchema({
      action,
      actor,
      targets,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: schema,
    });

  } catch (error: any) {
    console.error('[WorkOS Audit Log Schema API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create audit log schema',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

