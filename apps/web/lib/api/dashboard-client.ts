/**
 * DealershipAI Dashboard API Client
 *
 * Centralized client for fetching dashboard data from various API endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface DashboardOverviewData {
  timestamp: string;
  dealerId: string;
  timeRange: string;
  aiVisibility: {
    score: number;
    trend: number;
    breakdown: {
      seo: number;
      aeo: number;
      geo: number;
    };
    platforms: {
      chatgpt: number;
      claude: number;
      perplexity: number;
      gemini: number;
    };
  };
  revenue: {
    atRisk: number;
    potential: number;
    trend: number;
    monthly: number;
  };
  performance: {
    loadTime: number;
    uptime: number;
    score: number;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  leads: {
    monthly: number;
    trend: number;
    conversion: number;
    sources: {
      organic: number;
      direct: number;
      social: number;
      referral: number;
    };
  };
  competitive: {
    position: number;
    marketShare: number;
    gap: number;
  };
  recommendations: Array<{
    id: string;
    type: string;
    priority: string;
    title: string;
    description: string;
    impact: string;
    effort: string;
    estimatedLift: string;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  timeSeries: {
    aiVisibility: Array<{ name: string; value: number; timestamp: string }>;
    revenue: Array<{ name: string; value: number; timestamp: string }>;
    leads: Array<{ name: string; value: number; timestamp: string }>;
  };
}

export interface AIVisibilityData {
  domain: string;
  dealerId: string;
  timestamp: string;
  vai: {
    score: number;
    grade: string;
    percentile: number;
    trend: string;
    change: number;
  };
  breakdown: {
    searchPresence: {
      score: number;
      weight: number;
      factors: string[];
    };
    aiPlatforms: {
      score: number;
      weight: number;
      factors: string[];
    };
    contentQuality: {
      score: number;
      weight: number;
      factors: string[];
    };
  };
  recommendations: Array<{
    priority: string;
    category: string;
    action: string;
    impact: string;
  }>;
}

export interface WebsiteData {
  timestamp: string;
  domain: string;
  performance: {
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
    pageSpeed: {
      mobile: number;
      desktop: number;
    };
    accessibility: number;
    seoScore: number;
  };
  issues: Array<{
    priority: string;
    category: string;
    description: string;
    impact: string;
  }>;
  technical: {
    mobileResponsive: boolean;
    httpsSecure: boolean;
    loadSpeed: number;
    imageOptimization: {
      needsWork: number;
    };
  };
}

export interface SchemaData {
  timestamp: string;
  domain: string;
  status: {
    valid: boolean;
    coverage: number;
    errors: number;
  };
  opportunities: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    impact: string;
  }>;
  active: Array<{
    type: string;
    valid: boolean;
  }>;
  errors: Array<{
    severity: string;
    message: string;
    path: string;
  }>;
}

export interface ReviewsData {
  timestamp: string;
  platforms: {
    google: {
      rating: number;
      count: number;
      weeklyChange: number;
    };
    yelp: {
      rating: number;
      count: number;
      weeklyChange: number;
    };
    facebook: {
      rating: number;
      count: number;
      weeklyChange: number;
    };
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    overallRating: number;
    trend: string;
    trendValue: number;
  };
  recent: Array<{
    id: string;
    author: string;
    platform: string;
    rating: number;
    text: string;
    timestamp: string;
  }>;
  competitor: Array<{
    name: string;
    rating: number;
    advantage: number;
    status: string;
  }>;
}

class DashboardAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async getDashboardOverview(params?: {
    dealerId?: string;
    timeRange?: '7d' | '30d' | '90d' | '365d';
  }): Promise<DashboardOverviewData> {
    const searchParams = new URLSearchParams();
    if (params?.dealerId) searchParams.set('dealerId', params.dealerId);
    if (params?.timeRange) searchParams.set('timeRange', params.timeRange);

    return this.fetchJSON<DashboardOverviewData>(
      `/api/dashboard/overview?${searchParams.toString()}`
    );
  }

  async getAIVisibility(params?: {
    domain?: string;
    dealerId?: string;
  }): Promise<AIVisibilityData> {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.set('domain', params.domain);
    if (params?.dealerId) searchParams.set('dealerId', params.dealerId);

    return this.fetchJSON<AIVisibilityData>(
      `/api/ai/visibility-index?${searchParams.toString()}`
    );
  }

  async getWebsiteData(params?: {
    domain?: string;
    dealerId?: string;
  }): Promise<WebsiteData> {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.set('domain', params.domain);
    if (params?.dealerId) searchParams.set('dealerId', params.dealerId);

    return this.fetchJSON<WebsiteData>(
      `/api/dashboard/website?${searchParams.toString()}`
    );
  }

  async getSchemaData(params?: {
    domain?: string;
    dealerId?: string;
  }): Promise<SchemaData> {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.set('domain', params.domain);
    if (params?.dealerId) searchParams.set('dealerId', params.dealerId);

    return this.fetchJSON<SchemaData>(
      `/api/dashboard/schema?${searchParams.toString()}`
    );
  }

  async getReviewsData(params?: {
    domain?: string;
    dealerId?: string;
  }): Promise<ReviewsData> {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.set('domain', params.domain);
    if (params?.dealerId) searchParams.set('dealerId', params.dealerId);

    return this.fetchJSON<ReviewsData>(
      `/api/dashboard/reviews?${searchParams.toString()}`
    );
  }

  async calculateAIVisibility(params: {
    domain?: string;
    dealerId?: string;
  }): Promise<{ success: boolean; jobId?: string; message: string }> {
    return this.fetchJSON('/api/ai/visibility-index', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        action: 'calculate',
      }),
    });
  }

  async refreshDashboard(params: {
    dealerId?: string;
  }): Promise<{ success: boolean; timestamp: string }> {
    return this.fetchJSON('/api/ai/visibility-index', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        action: 'refresh',
      }),
    });
  }
}

// Export singleton instance
export const dashboardAPI = new DashboardAPIClient();

// Export class for custom instances
export default DashboardAPIClient;
