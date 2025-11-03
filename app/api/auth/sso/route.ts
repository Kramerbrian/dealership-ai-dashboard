/**
 * WorkOS SSO Authorization Endpoint
 * Initiates SSO authentication flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { workos, getWorkOSClientId } from '@/lib/workos';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!workos) {
      return NextResponse.json(
        { error: 'WorkOS not configured' },
        { status: 500 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organization');
    const connectionId = searchParams.get('connection');
    const provider = searchParams.get('provider') as 
      | 'GoogleOAuth' 
      | 'MicrosoftOAuth' 
      | 'GitHubOAuth' 
      | 'AppleOAuth' 
      | null;
    const redirectUri = searchParams.get('redirect_uri') || 
      `${req.nextUrl.origin}/auth/callback`;
    const state = searchParams.get('state') || undefined;
    const providerScopes = searchParams.get('provider_scopes');

    const clientId = getWorkOSClientId();

    if (!clientId) {
      return NextResponse.json(
        { error: 'WORKOS_CLIENT_ID not configured' },
        { status: 500 }
      );
    }

    let authorizationUrl: string;

    // Use organization ID (preferred for SAML/OIDC)
    if (organizationId) {
      authorizationUrl = workos.sso.getAuthorizationUrl({
        organization: organizationId,
        redirectUri,
        clientId,
        state,
      });
    }
    // Use connection ID
    else if (connectionId) {
      authorizationUrl = workos.sso.getAuthorizationUrl({
        connection: connectionId,
        redirectUri,
        clientId,
        state,
      });
    }
    // Use provider (for OAuth connections)
    else if (provider) {
      const authOptions: any = {
        provider,
        redirectUri,
        clientId,
        state,
      };

      // Add provider scopes if specified (for requesting additional Google OAuth scopes)
      if (providerScopes) {
        // Split by space or comma and filter out empty strings
        const scopes = providerScopes
          .split(/[\s,]+/)
          .filter(s => s.trim().length > 0);
        if (scopes.length > 0) {
          authOptions.providerScopes = scopes;
        }
      }

      authorizationUrl = workos.sso.getAuthorizationUrl(authOptions);
    }
    // Fallback to test organization (for development)
    else {
      authorizationUrl = workos.sso.getAuthorizationUrl({
        organization: 'org_test_idp',
        redirectUri,
        clientId,
        state,
      });
    }

    // Redirect to WorkOS authorization URL
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error('[SSO Authorization] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate SSO' },
      { status: 500 }
    );
  }
}

