export interface TokenData {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
}

export interface AuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export class GoogleAuth {
  private config: AuthConfig;
  private baseURL: string;

  constructor(config?: Partial<AuthConfig>) {
    // Safely handle SSR where window is not available
    const defaultRedirectUri = typeof window !== 'undefined'
      ? `${window.location.origin}/api/oauth/google/callback`
      : 'http://localhost:3000/api/oauth/google/callback';

    this.config = {
      clientId: config?.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: config?.redirectUri || defaultRedirectUri,
      scopes: config?.scopes || [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/business.manage',
        'https://www.googleapis.com/auth/plus.business.manage'
      ],
      ...config
    };
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  initiateAuth(state?: string): void {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.config.scopes.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    
    if (state) {
      authUrl.searchParams.set('state', state);
    }

    window.location.href = authUrl.toString();
  }

  async handleCallback(code: string, state?: string): Promise<TokenData> {
    try {
      const response = await fetch(`${this.baseURL}/oauth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      });

      if (!response.ok) {
        throw new Error(`OAuth callback failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to exchange authorization code');
      }

      // In a real implementation, tokens would be returned from the backend
      // For now, we'll simulate the token data
      const tokenData: TokenData = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expiry_date: Date.now() + (3600 * 1000), // 1 hour from now
        scope: this.config.scopes.join(' '),
        token_type: 'Bearer'
      };

      this.storeTokens(tokenData);
      return tokenData;

    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    let tokenData = this.getStoredTokens();
    
    if (!tokenData) {
      throw new Error('No stored tokens found. Please authenticate first.');
    }

    // Check if token is expired
    if (this.isTokenExpired(tokenData)) {
      tokenData = await this.refreshAccessToken();
    }

    return tokenData.access_token;
  }

  async refreshAccessToken(): Promise<TokenData> {
    const storedTokens = this.getStoredTokens();
    
    if (!storedTokens?.refresh_token) {
      throw new Error('No refresh token available. Please re-authenticate.');
    }

    try {
      const response = await fetch(`${this.baseURL}/oauth/google/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          refresh_token: storedTokens.refresh_token 
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to refresh access token');
      }

      // Update stored tokens
      const newTokenData: TokenData = {
        ...storedTokens,
        access_token: result.access_token || storedTokens.access_token,
        expiry_date: result.expiry_date || (Date.now() + (3600 * 1000))
      };

      this.storeTokens(newTokenData);
      return newTokenData;

    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear invalid tokens
      this.clearTokens();
      throw error;
    }
  }

  isTokenExpired(tokenData?: TokenData): boolean {
    if (!tokenData) {
      const storedTokens = this.getStoredTokens();
      if (!storedTokens) {
        return true;
      }
      tokenData = storedTokens;
    }

    // Add 5 minute buffer before actual expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    return Date.now() >= (tokenData.expiry_date - bufferTime);
  }

  private storeTokens(tokenData: TokenData): void {
    try {
      localStorage.setItem('google_auth_tokens', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  private getStoredTokens(): TokenData | null {
    try {
      const stored = localStorage.getItem('google_auth_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to retrieve stored tokens:', error);
      return null;
    }
  }

  private clearTokens(): void {
    try {
      localStorage.removeItem('google_auth_tokens');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  isAuthenticated(): boolean {
    const tokens = this.getStoredTokens();
    return !!(tokens && !this.isTokenExpired(tokens));
  }

  logout(): void {
    this.clearTokens();
    // Redirect to home page or login page
    window.location.href = '/';
  }

  // Utility method to get authorization header
  async getAuthHeader(): Promise<string> {
    const token = await this.getAccessToken();
    return `Bearer ${token}`;
  }
}
