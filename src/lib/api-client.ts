/**
 * DealershipAI v2.0 - API Client
 * 
 * Centralized API client for all backend communication
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  tier?: {
    plan: string;
    sessionsUsed: number;
    sessionsLimit: number;
    remaining: number;
  };
}

export interface AnalyzeRequest {
  dealerId: string;
  dealerName: string;
  city: string;
  state: string;
  website?: string;
  phone?: string;
  email?: string;
}

export interface AnalyzeResponse {
  dealership: {
    id: string;
    name: string;
    city: string;
    state: string;
    website?: string;
    phone?: string;
    email?: string;
    lastAnalyzed?: string;
  };
  scores: {
    aiVisibility: number;
    zeroClick: number;
    ugcHealth: number;
    geoTrust: number;
    sgpIntegrity: number;
    overall: number;
  };
  eeat?: {
    expertise: number;
    experience: number;
    authoritativeness: number;
    trustworthiness: number;
    overall: number;
  };
  tier: string;
  sessionsUsed: number;
  sessionsLimit: number;
  sessionsResetAt: string;
  timestamp: string;
}

export interface EEATRequest {
  domain: string;
  dealershipName: string;
  city: string;
  state: string;
  reviews: Array<{
    platform: string;
    rating: number;
    text: string;
    date: string;
    sentiment: number;
    isVerified: boolean;
    reviewerName?: string;
  }>;
  localData: {
    googleMyBusiness: {
      rating: number;
      reviewCount: number;
      photos: number;
      posts: number;
      lastUpdated: string;
    };
    localCitations: number;
    napConsistency: number;
    localKeywords: string[];
  };
  contentData?: {
    blogPosts?: number;
    articles?: number;
    caseStudies?: number;
    testimonials?: number;
    faqs?: number;
    lastContentUpdate?: string;
  };
  expertiseData?: {
    certifications?: string[];
    awards?: string[];
    yearsInBusiness?: number;
    teamSize?: number;
    specialties?: string[];
  };
}

export interface EEATResponse {
  eeat: {
    expertise: number;
    experience: number;
    authoritativeness: number;
    trustworthiness: number;
    overall: number;
  };
  detailedAnalysis: {
    expertise: {
      score: number;
      factors: string[];
      recommendations: string[];
    };
    experience: {
      score: number;
      factors: string[];
      recommendations: string[];
    };
    authoritativeness: {
      score: number;
      factors: string[];
      recommendations: string[];
    };
    trustworthiness: {
      score: number;
      factors: string[];
      recommendations: string[];
    };
  };
  priorityActions: string[];
  benchmarkComparison: {
    industryAverage: number;
    topPerformers: number;
    percentile: number;
  };
}

export interface MysteryShopTest {
  id: string;
  testType: 'PHONE_CALL' | 'EMAIL_INQUIRY' | 'WEBSITE_CHAT' | 'VISIT';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  scheduledFor: string;
  completedAt?: string;
  results?: {
    responseTime: number;
    quality: number;
    personalization: number;
    professionalism: number;
    overallRating: number;
    notes?: string;
  };
}

export interface MysteryShopResponse {
  mysteryShops: MysteryShopTest[];
}

export class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make API request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          tier: data.tier,
        };
      }

      return {
        success: true,
        data,
        tier: data.tier,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Analyze dealership
   */
  async analyzeDealership(request: AnalyzeRequest): Promise<ApiResponse<AnalyzeResponse>> {
    const params = new URLSearchParams({
      dealerId: request.dealerId,
      dealerName: request.dealerName,
      city: request.city,
      state: request.state,
      ...(request.website && { website: request.website }),
      ...(request.phone && { phone: request.phone }),
      ...(request.email && { email: request.email }),
    });

    return this.request<AnalyzeResponse>(`/api/analyze?${params}`);
  }

  /**
   * Get cached analysis results
   */
  async getCachedAnalysis(domain: string): Promise<ApiResponse<AnalyzeResponse>> {
    return this.request<AnalyzeResponse>(`/api/analyze?domain=${encodeURIComponent(domain)}`);
  }

  /**
   * Analyze E-E-A-T scores (Pro+ only)
   */
  async analyzeEEAT(request: EEATRequest): Promise<ApiResponse<EEATResponse>> {
    return this.request<EEATResponse>('/api/eeat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Schedule mystery shop test (Enterprise only)
   */
  async scheduleMysteryShop(
    dealershipId: string,
    testType: string,
    scheduledFor: string,
    testParameters?: any
  ): Promise<ApiResponse<{ mysteryShop: MysteryShopTest }>> {
    return this.request<{ mysteryShop: MysteryShopTest }>('/api/mystery-shop', {
      method: 'POST',
      body: JSON.stringify({
        dealershipId,
        testType,
        scheduledFor,
        testParameters,
      }),
    });
  }

  /**
   * Execute mystery shop test (Enterprise only)
   */
  async executeMysteryShop(
    mysteryShopId: string,
    results: any
  ): Promise<ApiResponse<{ mysteryShop: MysteryShopTest; analysis: any }>> {
    return this.request<{ mysteryShop: MysteryShopTest; analysis: any }>('/api/mystery-shop', {
      method: 'PUT',
      body: JSON.stringify({
        mysteryShopId,
        results,
      }),
    });
  }

  /**
   * Get mystery shop tests for dealership (Enterprise only)
   */
  async getMysteryShopTests(dealershipId: string): Promise<ApiResponse<MysteryShopResponse>> {
    return this.request<MysteryShopResponse>(`/api/mystery-shop?dealershipId=${dealershipId}`);
  }

  /**
   * Batch analyze multiple dealerships
   */
  async batchAnalyze(dealers: AnalyzeRequest[]): Promise<ApiResponse<{
    results: Array<{
      dealerId: string;
      dealerName: string;
      scores: any;
      success: boolean;
      error?: string;
    }>;
    totalProcessed: number;
    successful: number;
    failed: number;
  }>> {
    return this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        type: 'batch',
        dealers,
      }),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    version: string;
  }>> {
    return this.request('/api/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience functions
export const analyzeDealership = (request: AnalyzeRequest) => 
  apiClient.analyzeDealership(request);

export const analyzeEEAT = (request: EEATRequest) => 
  apiClient.analyzeEEAT(request);

export const scheduleMysteryShop = (dealershipId: string, testType: string, scheduledFor: string, testParameters?: any) => 
  apiClient.scheduleMysteryShop(dealershipId, testType, scheduledFor, testParameters);

export const executeMysteryShop = (mysteryShopId: string, results: any) => 
  apiClient.executeMysteryShop(mysteryShopId, results);

export const getMysteryShopTests = (dealershipId: string) => 
  apiClient.getMysteryShopTests(dealershipId);

export const batchAnalyze = (dealers: AnalyzeRequest[]) => 
  apiClient.batchAnalyze(dealers);