export type Fetcher = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export interface DealershipAIConfig {
  baseUrl: string;
  token: string;
  fetcher?: Fetcher;
  timeout?: number;
}

export interface AVIReport {
  aiv: number;
  breakdown: {
    google_sge: number;
    perplexity: number;
    gemini: number;
  };
  timestamp: string;
}

export interface AVIHistoryItem {
  date: string;
  aiv: number;
  breakdown: Record<string, number>;
}

export interface AVIHistoryResponse {
  data: AVIHistoryItem[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
  };
}

export interface ASRRecommendation {
  vdpId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  impact: number;
  effort: 'low' | 'medium' | 'high';
}

export interface ASRResponse {
  recommendations: ASRRecommendation[];
  summary: {
    totalRecommendations: number;
    criticalCount: number;
    estimatedImpact: number;
  };
}

export interface HRPFindings {
  as_of: string;
  topic: string;
  severity: 'low' | 'medium' | 'high';
  score: number;
  verifiable: boolean;
}

export interface HRPQuarantine {
  topic: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  active: boolean;
  created_at: string;
}

export interface HRPStatusResponse {
  findings: HRPFindings[];
  quarantine: HRPQuarantine[];
  tenantId: string;
  timestamp: string;
}

export class DealershipAI {
  private baseUrl: string;
  private token: string;
  private fetcher: Fetcher;
  private timeout: number;

  constructor(config: DealershipAIConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = config.token;
    this.fetcher = config.fetcher || (fetch as any);
    this.timeout = config.timeout || 30000;
  }

  private headers(): Record<string, string> {
    return {
      'authorization': `Bearer ${this.token}`,
      'content-type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.fetcher(url, {
        ...options,
        headers: {
          ...this.headers(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  // AVI (AI Visibility Index) methods
  async aviLatest(tenantId: string): Promise<AVIReport> {
    return this.request<AVIReport>(`/api/tenants/${tenantId}/avi/latest`);
  }

  async aviHistory(
    tenantId: string, 
    limit: number = 8, 
    before?: string
  ): Promise<AVIHistoryResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set('before', before);
    
    return this.request<AVIHistoryResponse>(`/api/tenants/${tenantId}/avi/history?${params}`);
  }

  // ASR (Autonomous Strategy Recommendations) methods
  async asrExecute(
    tenantId: string, 
    vdpIds: string[], 
    idempotencyKey: string,
    options?: {
      includeCompetitors?: boolean;
      analysisDepth?: 'quick' | 'standard' | 'deep';
    }
  ): Promise<ASRResponse> {
    return this.request<ASRResponse>(`/api/tenants/${tenantId}/asr/execute`, {
      method: 'POST',
      body: JSON.stringify({
        vdpIds,
        idempotencyKey,
        options: options || {},
      }),
    });
  }

  // HRP (Hallucination Risk Prevention) methods
  async hrpScan(tenantId: string): Promise<{ ok: boolean; message: string; tenantId: string }> {
    return this.request(`/api/tenants/${tenantId}/hrp/scan`, {
      method: 'POST',
    });
  }

  async hrpStatus(tenantId: string): Promise<HRPStatusResponse> {
    return this.request<HRPStatusResponse>(`/api/tenants/${tenantId}/hrp/status`);
  }

  async hrpResolve(tenantId: string, topic: string): Promise<{
    ok: boolean;
    message: string;
    tenantId: string;
    topic: string;
    resolvedAt: string;
  }> {
    return this.request(`/api/tenants/${tenantId}/hrp/resolve`, {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
  }

  // Utility methods
  generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Batch operations
  async batchHrpResolve(tenantId: string, topics: string[]): Promise<Array<{
    topic: string;
    success: boolean;
    error?: string;
  }>> {
    const results = await Promise.allSettled(
      topics.map(topic => this.hrpResolve(tenantId, topic))
    );

    return topics.map((topic, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        return { topic, success: true };
      } else {
        return { 
          topic, 
          success: false, 
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
        };
      }
    });
  }
}

// Export types and class
export default DealershipAI;
export { DealershipAI };
