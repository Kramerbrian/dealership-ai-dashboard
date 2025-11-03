/**
 * WorkOS SSO Callback Handler
 * Handles the redirect from WorkOS after SSO authentication
 * Implements JIT (Just-In-Time) user provisioning
 */

import { NextRequest, NextResponse } from 'next/server';
import { workos, getWorkOSClientId } from '@/lib/workos';
import { provisionUser } from '@/lib/jit-provisioning';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle errors
    if (error) {
      console.error('[WorkOS Callback] Error:', error);
      
      // Handle IdP-initiated SSO disabled error
      if (error === 'idp_initiated_sso_disabled') {
        const connectionId = searchParams.get('connection');
        const organizationId = searchParams.get('organization');
        
        // Redirect to SP-initiated flow
        if (connectionId || organizationId) {
          const ssoUrl = new URL('/api/auth/sso', req.url);
          if (organizationId) ssoUrl.searchParams.set('organization', organizationId);
          if (connectionId) ssoUrl.searchParams.set('connection', connectionId);
          if (state) ssoUrl.searchParams.set('state', state);
          return NextResponse.redirect(ssoUrl);
        }
      }
      
      return NextResponse.redirect(new URL(`/sign-in?error=${error}`, req.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/sign-in?error=no_code', req.url));
    }

    if (!workos) {
      return NextResponse.redirect(new URL('/sign-in?error=workos_not_configured', req.url));
    }

    const clientId = getWorkOSClientId();

    if (!clientId) {
      return NextResponse.redirect(new URL('/sign-in?error=client_id_missing', req.url));
    }

    try {
      // Exchange code for SSO profile
      const { profile } = await workos.sso.getProfileAndToken({
        code,
        clientId,
      });

      // Validate organization if needed (recommended for security)
      // You can check profile.organization_id against your allowed organizations

      // JIT Provisioning: Create or link user account
      const user = await provisionUser(profile);

      // Get redirect URL from state or default to dashboard
      let redirectUrl = '/dashboard';
      if (state) {
        try {
          const decodedState = decodeURIComponent(state);
          // State can contain redirect_uri or just be a path
          if (decodedState.startsWith('http')) {
            redirectUrl = decodedState;
          } else if (decodedState.startsWith('/')) {
            redirectUrl = decodedState;
          }
        } catch {
          // If state parsing fails, use default
        }
      }

      // Create response with redirect
      const response = NextResponse.redirect(new URL(redirectUrl, req.url));

      // Set session cookies
      response.cookies.set('wos-user-id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      response.cookies.set('wos-session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Store organization ID if available
      if (profile.organization_id) {
        response.cookies.set('wos-org-id', profile.organization_id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
      }

      return response;
    } catch (authError: any) {
      console.error('[WorkOS Callback] Auth exchange failed:', authError);
      
      // Handle specific error cases
      if (authError.code === 'idp_initiated_sso_disabled') {
        // Fallback to SP-initiated flow
        return NextResponse.redirect(new URL('/api/auth/sso', req.url));
      }
      
      return NextResponse.redirect(new URL('/sign-in?error=auth_exchange_failed', req.url));
    }
  } catch (error) {
    console.error('[WorkOS Callback] Unexpected error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=unexpected', req.url));
  }
}
