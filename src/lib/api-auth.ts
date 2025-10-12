/**
 * API Authentication and Rate Limiting
 * Handles API key validation, rate limiting, and usage tracking
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface ApiKeyValidation {
  isValid: boolean;
  apiKeyId?: string;
  tenantId?: string;
  tier?: string;
  rateLimitExceeded?: boolean;
  requestsRemaining?: number;
  error?: string;
}

export interface UsageLogParams {
  apiKeyId: string;
  tenantId: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTimeMs?: number;
  responseSizeBytes?: number;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Hash API key for secure storage and comparison
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(req: NextRequest): string | null {
  // Try Authorization header (Bearer token)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try X-API-Key header
  const apiKeyHeader = req.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Try query parameter (not recommended for production)
  const apiKeyParam = req.nextUrl.searchParams.get('api_key');
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return null;
}

/**
 * Validate API key and check rate limits
 */
export async function validateApiKey(
  apiKey: string,
  endpoint: string
): Promise<ApiKeyValidation> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const keyHash = hashApiKey(apiKey);

    // Call validation function with rate limit check
    const { data, error } = await supabase.rpc('validate_api_key_and_check_limits', {
      key_hash_input: keyHash,
      endpoint_input: endpoint,
    });

    if (error) {
      console.error('API key validation error:', error);
      return {
        isValid: false,
        error: 'Internal server error',
      };
    }

    if (!data || data.length === 0) {
      return {
        isValid: false,
        error: 'Invalid API key',
      };
    }

    const result = data[0];

    if (!result.is_valid) {
      return {
        isValid: false,
        error: 'Invalid or expired API key',
      };
    }

    if (result.rate_limit_exceeded) {
      return {
        isValid: true,
        apiKeyId: result.api_key_id,
        tenantId: result.tenant_id,
        tier: result.tier,
        rateLimitExceeded: true,
        requestsRemaining: result.requests_remaining,
        error: 'Rate limit exceeded',
      };
    }

    return {
      isValid: true,
      apiKeyId: result.api_key_id,
      tenantId: result.tenant_id,
      tier: result.tier,
      rateLimitExceeded: false,
      requestsRemaining: result.requests_remaining,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return {
      isValid: false,
      error: 'Failed to validate API key',
    };
  }
}

/**
 * Log API usage
 */
export async function logApiUsage(params: UsageLogParams): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.rpc('log_api_usage', {
      p_api_key_id: params.apiKeyId,
      p_tenant_id: params.tenantId,
      p_method: params.method,
      p_endpoint: params.endpoint,
      p_status_code: params.statusCode,
      p_response_time_ms: params.responseTimeMs,
      p_response_size_bytes: params.responseSizeBytes,
      p_user_agent: params.userAgent,
      p_ip_address: params.ipAddress,
    });
  } catch (error) {
    // Log but don't throw - usage tracking shouldn't break the API
    console.error('Error logging API usage:', error);
  }
}

/**
 * Middleware to protect API routes
 */
export async function withApiAuth(
  req: NextRequest,
  handler: (req: NextRequest, auth: ApiKeyValidation) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const endpoint = req.nextUrl.pathname;
  const method = req.method;

  // Extract API key
  const apiKey = extractApiKey(req);

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Missing API key',
        message: 'Provide API key via Authorization header, X-API-Key header, or api_key query parameter',
      },
      { status: 401 }
    );
  }

  // Validate API key
  const auth = await validateApiKey(apiKey, endpoint);

  if (!auth.isValid) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: auth.error || 'Invalid API key',
      },
      { status: 401 }
    );
  }

  if (auth.rateLimitExceeded) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `You have exceeded your rate limit. ${auth.requestsRemaining} requests remaining.`,
        tier: auth.tier,
        requestsRemaining: auth.requestsRemaining,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': auth.requestsRemaining?.toString() || '0',
          'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString(),
        },
      }
    );
  }

  // Execute handler
  const response = await handler(req, auth);

  // Log usage
  const responseTime = Date.now() - startTime;
  const responseSize = response.headers.get('content-length');

  if (auth.apiKeyId && auth.tenantId) {
    // Fire and forget
    logApiUsage({
      apiKeyId: auth.apiKeyId,
      tenantId: auth.tenantId,
      method,
      endpoint,
      statusCode: response.status,
      responseTimeMs: responseTime,
      responseSizeBytes: responseSize ? parseInt(responseSize) : undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
    }).catch(console.error);
  }

  // Add rate limit headers
  response.headers.set('X-RateLimit-Remaining', auth.requestsRemaining?.toString() || '0');
  response.headers.set('X-RateLimit-Tier', auth.tier || 'unknown');

  return response;
}

/**
 * Check if request needs authentication
 * Internal routes bypass auth, external v1 routes require auth
 */
export function requiresAuth(pathname: string): boolean {
  // Internal routes don't need API key
  if (pathname.startsWith('/api/internal/')) {
    return false;
  }

  // v1 routes require API key
  if (pathname.startsWith('/api/v1/')) {
    return true;
  }

  // Default: no auth required (for backward compatibility)
  return false;
}

/**
 * Generate new API key
 */
export async function generateApiKey(
  tenantId: string,
  name: string,
  tier: string = 'free',
  options?: {
    description?: string;
    expiresInDays?: number;
    scopes?: string[];
  }
): Promise<{ apiKey: string; keyPrefix: string } | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate API key
    const { data: keyData } = await supabase.rpc('generate_api_key');
    const apiKey = keyData as string;

    if (!apiKey) {
      throw new Error('Failed to generate API key');
    }

    const keyPrefix = apiKey.substring(0, 12); // e.g., "sk_live_abc1"
    const keyHash = hashApiKey(apiKey);

    // Calculate expiration
    const expiresAt = options?.expiresInDays
      ? new Date(Date.now() + options.expiresInDays * 86400000).toISOString()
      : null;

    // Insert API key
    const { error } = await supabase.from('api_keys').insert({
      tenant_id: tenantId,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      name,
      description: options?.description,
      tier,
      scopes: options?.scopes || ['read'],
      expires_at: expiresAt,
    });

    if (error) {
      console.error('Error creating API key:', error);
      return null;
    }

    return { apiKey, keyPrefix };
  } catch (error) {
    console.error('Error generating API key:', error);
    return null;
  }
}

/**
 * Revoke API key
 */
export async function revokeApiKey(
  apiKeyId: string,
  revokedBy: string,
  reason?: string
): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: revokedBy,
        revoked_reason: reason,
      })
      .eq('id', apiKeyId);

    if (error) {
      console.error('Error revoking API key:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error revoking API key:', error);
    return false;
  }
}
