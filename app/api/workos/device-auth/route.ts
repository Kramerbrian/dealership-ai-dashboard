/**
 * WorkOS Device Authorization API
 * OAuth 2.0 Device Authorization Grant (RFC 8628)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requestDeviceAuthorization,
  pollDeviceToken,
} from '@/lib/workos-device-auth';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/device-auth
 * Request device authorization or poll for token
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, clientId, deviceCode, scope } = body;

    switch (action) {
      case 'request':
        if (!clientId) {
          return NextResponse.json(
            { error: 'clientId is required for request' },
            { status: 400 }
          );
        }
        const authResponse = await requestDeviceAuthorization({
          clientId,
          scope,
        });
        return NextResponse.json({
          success: true,
          data: authResponse,
        });

      case 'poll':
        if (!deviceCode || !clientId) {
          return NextResponse.json(
            { error: 'deviceCode and clientId are required for poll' },
            { status: 400 }
          );
        }
        const tokenResponse = await pollDeviceToken({
          deviceCode,
          clientId,
        });
        return NextResponse.json({
          success: true,
          data: tokenResponse,
        });

      default:
        return NextResponse.json(
          { error: 'action must be: request or poll' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[WorkOS Device Auth API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process device auth request',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

