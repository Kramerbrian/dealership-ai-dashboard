/**
 * WorkOS Radar Attempts API
 * Create and update fraud detection attempts
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createRadarAttempt,
  updateRadarAttempt,
} from '@/lib/workos-radar';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/radar/attempts
 * Create a radar attempt
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ip_address, user_agent, email, auth_method, action } = body;

    if (!ip_address || !user_agent) {
      return NextResponse.json(
        { error: 'ip_address and user_agent are required' },
        { status: 400 }
      );
    }

    const attempt = await createRadarAttempt({
      ip_address,
      user_agent,
      email,
      auth_method,
      action,
    });

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error: any) {
    console.error('[WorkOS Radar API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create radar attempt',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workos/radar/attempts/[id]
 * Update a radar attempt
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { attempt_status } = body;

    if (!attempt_status || !['success', 'failure'].includes(attempt_status)) {
      return NextResponse.json(
        { error: 'attempt_status must be "success" or "failure"' },
        { status: 400 }
      );
    }

    const attempt = await updateRadarAttempt({
      attemptId: id,
      attempt_status,
    });

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error: any) {
    console.error('[WorkOS Radar API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update radar attempt',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

