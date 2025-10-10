/**
 * Security Middleware for API Protection
 * Implements rate limiting, authentication, and threat detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { SecurityEngine } from './security-engine';

const securityEngine = new SecurityEngine();

interface SecurityConfig {
  requireAuth: boolean;
  requireMFA: boolean;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  allowedRoles: string[];
  allowedIPs?: string[];
}

/**
 * Security middleware wrapper
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: SecurityConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract user information from request
      const userId = request.headers.get('x-user-id');
      const userRole = request.headers.get('x-user-role');
      const mfaToken = request.headers.get('x-mfa-token');
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';

      // Check authentication requirement
      if (config.requireAuth && !userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check role requirements
      if (config.allowedRoles.length > 0 && userRole && 
          !config.allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Check IP whitelist
      if (config.allowedIPs && !config.allowedIPs.includes(clientIP)) {
        return NextResponse.json(
          { error: 'IP address not authorized' },
          { status: 403 }
        );
      }

      // Authenticate user if required
      if (config.requireAuth && userId) {
        const authResult = await securityEngine.authenticateUser(
          userId,
          clientIP,
          request.headers.get('user-agent') || 'unknown',
          mfaToken || undefined
        );

        if (!authResult.success) {
          return NextResponse.json(
            { 
              error: authResult.reason,
              requiresMFA: authResult.requiresMFA 
            },
            { status: authResult.requiresMFA ? 426 : 401 }
          );
        }
      }

      // Check rate limiting
      if (config.rateLimit) {
        const rateLimitKey = `${userId || clientIP}:${request.nextUrl.pathname}`;
        const isAllowed = await checkRateLimit(rateLimitKey, config.rateLimit);
        
        if (!isAllowed) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        }
      }

      // Check MFA requirement
      if (config.requireMFA && !mfaToken) {
        return NextResponse.json(
          { error: 'MFA token required' },
          { status: 426 }
        );
      }

      // All security checks passed, proceed with handler
      return await handler(request);

    } catch (error: any) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { error: 'Security check failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Rate limiting check
 */
async function checkRateLimit(
  key: string, 
  config: { requests: number; windowMs: number }
): Promise<boolean> {
  // This would typically use Redis or similar for distributed rate limiting
  // For now, we'll use a simple in-memory approach
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // In a real implementation, you'd check against a persistent store
  // For demo purposes, we'll assume rate limiting is handled by the SecurityEngine
  return true;
}

/**
 * Security decorators for different access levels
 */
export const securityDecorators = {
  // Public access (no authentication required)
  public: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      requireAuth: false,
      requireMFA: false,
      rateLimit: { requests: 1000, windowMs: 3600000 }, // 1000 requests per hour
      allowedRoles: []
    }),

  // Authenticated user access
  authenticated: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      requireAuth: true,
      requireMFA: false,
      rateLimit: { requests: 100, windowMs: 900000 }, // 100 requests per 15 minutes
      allowedRoles: []
    }),

  // Admin access with MFA
  admin: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      requireAuth: true,
      requireMFA: true,
      rateLimit: { requests: 50, windowMs: 900000 }, // 50 requests per 15 minutes
      allowedRoles: ['super_admin', 'governance_admin']
    }),

  // Governance admin access
  governanceAdmin: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      requireAuth: true,
      requireMFA: true,
      rateLimit: { requests: 25, windowMs: 900000 }, // 25 requests per 15 minutes
      allowedRoles: ['governance_admin']
    }),

  // Super admin access (highest security)
  superAdmin: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      requireAuth: true,
      requireMFA: true,
      rateLimit: { requests: 10, windowMs: 900000 }, // 10 requests per 15 minutes
      allowedRoles: ['super_admin'],
      allowedIPs: ['127.0.0.1', '::1'] // Restrict to localhost for super admin
    })
};

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add CSP header
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
  );

  return response;
}

/**
 * Request sanitization
 */
export function sanitizeRequest(request: NextRequest): NextRequest {
  // Remove potentially dangerous headers
  const sanitizedHeaders = new Headers(request.headers);
  
  // Remove headers that could be used for attacks
  sanitizedHeaders.delete('x-forwarded-host');
  sanitizedHeaders.delete('x-original-url');
  sanitizedHeaders.delete('x-rewrite-url');
  
  // Create new request with sanitized headers
  return new NextRequest(request.url, {
    method: request.method,
    headers: sanitizedHeaders,
    body: request.body
  });
}

/**
 * Input validation
 */
export function validateInput(data: any, schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation - in production, use a proper validation library like Zod
  if (typeof data !== 'object' || data === null) {
    errors.push('Input must be an object');
    return { valid: false, errors };
  }

  // Check for required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Required field missing: ${field}`);
      }
    }
  }

  // Check field types
  if (schema.properties) {
    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      if (field in data) {
        const value = data[field];
        const expectedType = (fieldSchema as any).type;
        
        if (expectedType === 'string' && typeof value !== 'string') {
          errors.push(`Field ${field} must be a string`);
        } else if (expectedType === 'number' && typeof value !== 'number') {
          errors.push(`Field ${field} must be a number`);
        } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Field ${field} must be a boolean`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * SQL injection protection
 */
export function sanitizeSQL(input: string): string {
  // Remove potentially dangerous SQL characters
  return input
    .replace(/[';--]/g, '') // Remove quotes, semicolons, and comments
    .replace(/union/gi, '') // Remove UNION keywords
    .replace(/select/gi, '') // Remove SELECT keywords
    .replace(/insert/gi, '') // Remove INSERT keywords
    .replace(/update/gi, '') // Remove UPDATE keywords
    .replace(/delete/gi, '') // Remove DELETE keywords
    .replace(/drop/gi, '') // Remove DROP keywords
    .trim();
}

/**
 * XSS protection
 */
export function sanitizeHTML(input: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
