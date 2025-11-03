/**
 * WorkOS MFA (Multi-Factor Authentication) API
 * Manage authentication factors and challenges
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  enrollFactor,
  challengeFactor,
  verifyChallenge,
  getFactor,
  deleteFactor,
} from '@/lib/workos-mfa';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/mfa/enroll
 * Enroll a new MFA factor
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...options } = body;

    switch (action) {
      case 'enroll':
        if (!options.type || !options.issuer || !options.user) {
          return NextResponse.json(
            { error: 'type, issuer, and user are required for enroll' },
            { status: 400 }
          );
        }
        const factor = await enrollFactor(options);
        return NextResponse.json({ success: true, data: factor });

      case 'challenge':
        if (!options.authenticationFactorId) {
          return NextResponse.json(
            { error: 'authenticationFactorId is required for challenge' },
            { status: 400 }
          );
        }
        const challenge = await challengeFactor(options);
        return NextResponse.json({ success: true, data: challenge });

      case 'verify':
        if (!options.authenticationChallengeId || !options.code) {
          return NextResponse.json(
            {
              error:
                'authenticationChallengeId and code are required for verify',
            },
            { status: 400 }
          );
        }
        const result = await verifyChallenge(options);
        return NextResponse.json({ success: true, data: result });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: enroll, challenge, or verify' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[WorkOS MFA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process MFA request',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workos/mfa?id=factor_123
 * Get an MFA factor by ID
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const factorId = searchParams.get('id');

    if (!factorId) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    const factor = await getFactor(factorId);

    return NextResponse.json({
      success: true,
      data: factor,
    });
  } catch (error: any) {
    console.error('[WorkOS MFA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get MFA factor',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workos/mfa?id=factor_123
 * Delete an MFA factor
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const factorId = searchParams.get('id');

    if (!factorId) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    await deleteFactor(factorId);

    return NextResponse.json({
      success: true,
      message: 'Factor deleted successfully',
    });
  } catch (error: any) {
    console.error('[WorkOS MFA API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete MFA factor',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

