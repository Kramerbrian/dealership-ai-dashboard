/**
 * Google OAuth Callback Handler
 * Receives authorization code and stores tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthService } from '@/lib/services/GoogleOAuthService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_code', req.url)
      );
    }

    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.redirect(
        new URL('/sign-in?error=unauthorized', req.url)
      );
    }

    // Decode state to get dealer ID
    let dealerId: string | null = null;
    if (state) {
      try {
        const stateData = JSON.parse(
          Buffer.from(state, 'base64').toString()
        );
        dealerId = stateData.dealerId;
      } catch (e) {
        console.error('Error decoding state:', e);
      }
    }

    // If no dealer ID in state, use user ID
    if (!dealerId) {
      dealerId = session.user.id;
    }

    // Exchange code for tokens
    const oauthService = new GoogleOAuthService();
    const tokens = await oauthService.getTokens(code);

    // Store tokens in database (encrypted)
    // For now, store in dealer settings or user settings
    const tokensData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      scope: tokens.scope,
    };

    // Store in database (implement based on your schema)
    // Example: await prisma.dealerSettings.upsert({...})

    // For now, we'll redirect to success page
    // In production, store tokens securely in database
    
    return NextResponse.redirect(
      new URL('/dashboard?google_connected=true', req.url)
    );

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/dashboard?error=${encodeURIComponent('oauth_callback_failed')}`,
        req.url
      )
    );
  }
}

