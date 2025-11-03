/**
 * WorkOS OAuth Callback Handler
 * Handles the redirect from WorkOS after authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle errors
    if (error) {
      console.error('[WorkOS Callback] Error:', error);
      return NextResponse.redirect(new URL('/sign-in?error=auth_failed', req.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/sign-in?error=no_code', req.url));
    }

    // Exchange code for session
    const clientId = process.env.WORKOS_CLIENT_ID || process.env.WORKOS_API_KEY || '';
    
    try {
      const { user, accessToken } = await workos.userManagement.authenticateWithEmailAndPassword({
        clientId,
        code,
      });

      // Get redirect URL from state or default to dashboard
      const redirectUrl = searchParams.get('state') || '/dashboard';
      
      // Create response with redirect
      const response = NextResponse.redirect(new URL(redirectUrl, req.url));
      
      // Set session cookie (WorkOS handles this, but we can add our own)
      response.cookies.set('wos-session', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Also store user ID in cookie for quick access
      response.cookies.set('wos-user-id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } catch (authError) {
      console.error('[WorkOS Callback] Auth exchange failed:', authError);
      return NextResponse.redirect(new URL('/sign-in?error=auth_exchange_failed', req.url));
    }
  } catch (error) {
    console.error('[WorkOS Callback] Unexpected error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=unexpected', req.url));
  }
}

