/**
 * Google OAuth Service
 * Handles OAuth 2.0 authentication flow for Google APIs (Analytics, Search Console, etc.)
 */

import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  scope: string;
}

export class GoogleOAuthService {
  private oauth2Client: OAuth2Client;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

    if (!this.clientId || !this.clientSecret) {
      console.warn('Google OAuth credentials not configured');
    }

    this.oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string, scopes?: string[]): string {
    const defaultScopes = [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/business.manage',
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes || defaultScopes,
      prompt: 'consent', // Force consent to get refresh token
      state: state || undefined,
      include_granted_scopes: true,
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<GoogleOAuthTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      return {
        access_token: tokens.access_token || '',
        refresh_token: tokens.refresh_token || '',
        expiry_date: tokens.expiry_date || Date.now(),
        scope: tokens.scope || '',
        token_type: tokens.token_type || 'Bearer',
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Set credentials for OAuth client
   */
  setCredentials(tokens: StoredTokens): void {
    this.oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiryDate,
    });
  }

  /**
   * Refresh access token if expired
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials.access_token || '';
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get authenticated OAuth client
   */
  getAuthenticatedClient(tokens: StoredTokens): OAuth2Client {
    this.setCredentials(tokens);
    return this.oauth2Client;
  }

  /**
   * Revoke tokens (for disconnection)
   */
  async revokeTokens(accessToken: string): Promise<void> {
    try {
      await this.oauth2Client.revokeToken(accessToken);
    } catch (error) {
      console.error('Error revoking tokens:', error);
      throw new Error('Failed to revoke tokens');
    }
  }
}

