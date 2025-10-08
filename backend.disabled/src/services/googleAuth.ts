import axios from 'axios';
import { config } from '../config/config';

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export class GoogleAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = config.google.clientId;
    this.clientSecret = config.google.clientSecret;
    this.redirectUri = `${config.security.allowedOrigins[0]}/oauth/google/callback`;
  }

  /**
   * Generate Google OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/business.manage',
        'https://www.googleapis.com/auth/webmasters.readonly',
        'openid',
        'email',
        'profile'
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state })
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri
      });

      return response.data;
    } catch (error: any) {
      console.error('Google OAuth token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return response.data;
    } catch (error: any) {
      console.error('Google OAuth token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get user information from Google
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Google user info error:', error.response?.data || error.message);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired(token: string): boolean {
    try {
      // Basic JWT token expiration check
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      // If we can't parse the token, assume it's expired
      return true;
    }
  }

  /**
   * Get Google Analytics properties for the authenticated user
   */
  async getAnalyticsProperties(accessToken: string) {
    try {
      const response = await axios.get(
        'https://analyticsadmin.googleapis.com/v1beta/accounts',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Google Analytics properties error:', error.response?.data || error.message);
      throw new Error('Failed to get Analytics properties');
    }
  }

  /**
   * Get Google Business Profile accounts for the authenticated user
   */
  async getBusinessAccounts(accessToken: string) {
    try {
      const response = await axios.get(
        'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Google Business accounts error:', error.response?.data || error.message);
      throw new Error('Failed to get Business accounts');
    }
  }

  /**
   * Get Google Search Console sites for the authenticated user
   */
  async getSearchConsoleSites(accessToken: string) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/webmasters/v3/sites',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Google Search Console sites error:', error.response?.data || error.message);
      throw new Error('Failed to get Search Console sites');
    }
  }
}

export const googleAuthService = new GoogleAuthService();
