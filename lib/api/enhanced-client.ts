import { z } from 'zod';

// Enhanced API client with better error handling, retries, and validation

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiError {
  readonly code: string;
  message: string;
  readonly details?: any;
  readonly statusCode?: number;
  readonly timestamp: string;
}

export class EnhancedApiClient {
  private config: Required<ApiConfig>;
  private abortController: AbortController | null = null;

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    // Cancel previous request if still pending
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    const timeoutId = setTimeout(() => this.abortController?.abort(), this.config.timeout);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: this.abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.code || 'HTTP_ERROR',
            errorData.message || response.statusText,
            errorData.details,
            response.status
          );
        }

        const data = await response.json();

        // Validate response with schema if provided
        if (schema) {
          const validatedData = schema.parse(data);
          return validatedData;
        }

        return data;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof ApiError && 
            (error.statusCode === 400 || error.statusCode === 401 || error.statusCode === 403)) {
          throw error;
        }

        // Don't retry on abort
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiError('TIMEOUT', 'Request timed out');
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retries) {
          await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new ApiError('UNKNOWN_ERROR', 'Request failed after all retries');
  }

  async get<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<T> {
    return this.makeRequest(endpoint, { method: 'GET' }, schema);
  }

  async post<T>(endpoint: string, data?: any, schema?: z.ZodSchema<T>): Promise<T> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, schema);
  }

  async put<T>(endpoint: string, data?: any, schema?: z.ZodSchema<T>): Promise<T> {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, schema);
  }

  async delete<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<T> {
    return this.makeRequest(endpoint, { method: 'DELETE' }, schema);
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

// Custom error class
export class ApiError extends Error {
  public readonly code!: string;
  public readonly details?: any;
  public readonly statusCode?: number;
  public readonly timestamp!: string;

  constructor(code: string, message: string, details?: any, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    (this as any).code = code;
    (this as any).details = details;
    (this as any).statusCode = statusCode;
    (this as any).timestamp = new Date().toISOString();
  }
}

// Validation schemas
export const AviReportSchema = z.object({
  aiv: z.number().min(0).max(100),
  breakdown: z.object({
    google_sge: z.number().min(0).max(100),
    perplexity: z.number().min(0).max(100),
    gemini: z.number().min(0).max(100),
  }),
  timestamp: z.string(),
});

export const HrpStatusSchema = z.object({
  findings: z.array(z.object({
    as_of: z.string(),
    topic: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    score: z.number().min(0).max(100),
    verifiable: z.boolean(),
  })),
  quarantine: z.array(z.object({
    topic: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    reason: z.string(),
    active: z.boolean(),
    created_at: z.string(),
  })),
  tenantId: z.string(),
  timestamp: z.string(),
});

// Enhanced API service
export class DealershipApiService {
  private client: EnhancedApiClient;

  constructor(baseUrl: string, private token: string) {
    this.client = new EnhancedApiClient({
      baseUrl,
      timeout: 30000,
      retries: 3,
    });
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }

  async getAviLatest(tenantId: string) {
    return this.client.get(
      `/api/tenants/${tenantId}/avi/latest`,
      AviReportSchema
    );
  }

  async getHrpStatus(tenantId: string) {
    return this.client.get(
      `/api/tenants/${tenantId}/hrp/status`,
      HrpStatusSchema
    );
  }

  async runHrpScan(tenantId: string) {
    return this.client.post(`/api/tenants/${tenantId}/hrp/scan`);
  }

  async resolveHrpQuarantine(tenantId: string, topic: string) {
    return this.client.post(`/api/tenants/${tenantId}/hrp/resolve`, { topic });
  }

  cancelRequests(): void {
    this.client.cancel();
  }
}
