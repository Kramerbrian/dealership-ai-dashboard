/**
 * API Client for DealershipAI Dashboard
 * Handles all external API integrations through our secure backend
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface GoogleAnalyticsData {
  rows: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  rowCount: number;
  totals: Array<{
    metricValues: Array<{ value: string }>;
  }>;
}

export interface PageSpeedData {
  lighthouseResult: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
    };
    audits: Record<string, any>;
  };
}

export interface SEMrushData {
  data: Array<{
    Rk: string; // Rank
    Or: string; // Organic traffic
    Ot: string; // Organic traffic cost
    Oc: string; // Organic traffic cost
    Ad: string; // Ad traffic
  }>;
}

export interface YelpData {
  businesses: Array<{
    id: string;
    name: string;
    rating: number;
    review_count: number;
    url: string;
    location: {
      address1: string;
      city: string;
      state: string;
      zip_code: string;
    };
  }>;
}

export interface AIAnalysisData {
  analysis: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.loadStoredToken();
  }

  /**
   * Set Google OAuth access token
   */
  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('google_access_token', token);
  }

  /**
   * Load stored access token
   */
  private loadStoredToken() {
    const token = localStorage.getItem('google_access_token');
    if (token) {
      this.accessToken = token;
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Google OAuth token if available
    if (this.accessToken) {
      (headers as any)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          details: data.details,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        details: error,
      };
    }
  }

  /**
   * Google Analytics API
   */
  async getAnalyticsData(
    propertyId: string,
    startDate: string = '7daysAgo',
    endDate: string = 'today',
    metrics?: string[],
    dimensions?: string[]
  ): Promise<ApiResponse<GoogleAnalyticsData>> {
    return this.request<GoogleAnalyticsData>('/external-apis/analytics', {
      method: 'POST',
      body: JSON.stringify({
        propertyId,
        startDate,
        endDate,
        metrics: metrics?.map(name => ({ name })),
        dimensions: dimensions?.map(name => ({ name })),
      }),
    });
  }

  /**
   * Google PageSpeed Insights API
   */
  async getPageSpeedData(
    url: string,
    strategy: 'mobile' | 'desktop' = 'mobile'
  ): Promise<ApiResponse<PageSpeedData>> {
    const params = new URLSearchParams({
      url,
      strategy,
    });

    return this.request<PageSpeedData>(`/external-apis/pagespeed?${params}`);
  }

  /**
   * Google Business Profile API
   */
  async getBusinessProfileData(
    accountId: string,
    locationId: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      accountId,
      locationId,
    });

    return this.request(`/external-apis/business-profile?${params}`);
  }

  /**
   * SEMrush API
   */
  async getSEMrushData(
    domain: string,
    type: string = 'domain_ranks'
  ): Promise<ApiResponse<SEMrushData>> {
    const params = new URLSearchParams({
      domain,
      type,
    });

    return this.request<SEMrushData>(`/external-apis/semrush?${params}`);
  }

  /**
   * Yelp API
   */
  async getYelpData(
    businessId?: string,
    term?: string,
    location?: string
  ): Promise<ApiResponse<YelpData>> {
    const params = new URLSearchParams();
    
    if (businessId) {
      params.set('businessId', businessId);
    } else if (term && location) {
      params.set('term', term);
      params.set('location', location);
    } else {
      return {
        success: false,
        error: 'Either businessId or term+location are required',
      };
    }

    return this.request<YelpData>(`/external-apis/yelp?${params}`);
  }

  /**
   * AI Citation Analysis
   */
  async getAICitationAnalysis(
    businessName: string,
    location: string,
    analysisType: 'citations' | 'reputation' = 'citations'
  ): Promise<ApiResponse<AIAnalysisData>> {
    return this.request<AIAnalysisData>('/external-apis/ai-citations', {
      method: 'POST',
      body: JSON.stringify({
        businessName,
        location,
        analysisType,
      }),
    });
  }

  /**
   * Google Search Console API (Free alternative to SEMrush)
   */
  async getSearchConsoleData(
    siteUrl: string,
    startDate: string = '2024-01-01',
    endDate: string = new Date().toISOString().split('T')[0]
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      siteUrl,
      startDate,
      endDate,
    });

    return this.request(`/external-apis/search-console?${params}`);
  }

  /**
   * Batch Analysis - Get data from multiple sources at once
   */
  async getBatchAnalysis(
    dealershipUrl: string,
    businessName: string,
    location: string
  ): Promise<ApiResponse<any>> {
    return this.request('/external-apis/batch-analysis', {
      method: 'POST',
      body: JSON.stringify({
        dealershipUrl,
        businessName,
        location,
      }),
    });
  }

  /**
   * OAuth Methods
   */

  /**
   * Get Google OAuth authorization URL
   */
  async getGoogleAuthUrl(): Promise<ApiResponse<{ authUrl: string }>> {
    return this.request<{ authUrl: string }>('/oauth/google/auth');
  }

  /**
   * Refresh Google access token
   */
  async refreshGoogleToken(refreshToken: string): Promise<ApiResponse<any>> {
    return this.request('/oauth/google/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  /**
   * Validate Google access token
   */
  async validateGoogleToken(): Promise<ApiResponse<any>> {
    return this.request('/oauth/google/validate');
  }

  /**
   * Get Google Analytics properties
   */
  async getGoogleAnalyticsProperties(): Promise<ApiResponse<any>> {
    return this.request('/oauth/google/analytics-properties');
  }

  /**
   * Get Google Business Profile accounts
   */
  async getGoogleBusinessAccounts(): Promise<ApiResponse<any>> {
    return this.request('/oauth/google/business-accounts');
  }

  /**
   * Get Google Search Console sites
   */
  async getGoogleSearchConsoleSites(): Promise<ApiResponse<any>> {
    return this.request('/oauth/google/search-console-sites');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for use in components
export default apiClient;
