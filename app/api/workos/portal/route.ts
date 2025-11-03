/**
 * WorkOS Portal API
 * Generate portal links for SSO, Directory Sync, and Audit Logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePortalLink } from '@/lib/workos-portal';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

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
    const { organization, intent, returnUrl, expiresIn } = body;

    if (!organization || !intent) {
      return NextResponse.json(
        { error: 'organization and intent are required' },
        { status: 400 }
      );
    }

    const validIntents = ['sso', 'dsync', 'audit_logs', 'log_streams', 'user_management'];
    if (!validIntents.includes(intent)) {
      return NextResponse.json(
        { error: `intent must be one of: ${validIntents.join(', ')}` },
        { status: 400 }
      );
    }

    const link = await generatePortalLink({
      organization,
      intent,
      returnUrl,
      expiresIn,
    });

    return NextResponse.json({
      success: true,
      link,
    });

  } catch (error: any) {
    console.error('[WorkOS Portal API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate portal link',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

