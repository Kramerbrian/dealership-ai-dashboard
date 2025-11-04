/**
 * Google OAuth Initiation Endpoint
 * Redirects dealer to Google OAuth consent screen
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/GoogleOAuthService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const scopes = searchParams.get('scopes')?.split(',') || [];
    const dealerId = searchParams.get('dealerId') || session.user.id;
    
    // Create state parameter with dealer ID and user ID for callback
    const state = Buffer.from(
      JSON.stringify({
        dealerId,
        userId: session.user.id,
        timestamp: Date.now(),
      })
    ).toString('base64');

    const oauthService = new GoogleOAuthService();
    const authUrl = oauthService.getAuthorizationUrl(state, scopes);

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'Redirect user to authUrl to begin OAuth flow',
    });

  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Google OAuth',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined,
      },
      { status: 500 }
    );
  }
}

