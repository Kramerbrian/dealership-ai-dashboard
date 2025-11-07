/**
 * API Route Protection Utilities
 * Provides authentication and authorization helpers for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { apiRateLimit, getClientIP, checkRateLimit } from '@/lib/rate-limit';

/**
 * Authentication result
 */
export interface AuthResult {
  userId: string | null;
  isAuthenticated: boolean;
  error?: string;
}

/**
 * Get authenticated user ID using Clerk
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthResult> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        userId: null,
        isAuthenticated: false,
        error: 'Authentication required',
      };
    }

    return {
      userId,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('[API Protection] Auth error:', error);
    return {
      userId: null,
      isAuthenticated: false,
      error: 'Authentication check failed',
    };
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  req: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<Response>
): Promise<Response> {
  const authResult = await getAuthenticatedUser(req);
  
  if (!authResult.isAuthenticated || !authResult.userId) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: authResult.error || 'Authentication required',
      },
      { status: 401 }
    );
  }

  return handler(req, authResult.userId);
}

/**
 * Apply rate limiting to a handler
 */
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<Response>,
  identifier?: string
): Promise<Response> {
  const clientIP = getClientIP(req);
  const rateLimitIdentifier = identifier || `api:${clientIP}`;
  const rateLimitCheck = await checkRateLimit(apiRateLimit, rateLimitIdentifier);

  if (!rateLimitCheck.success && rateLimitCheck.response) {
    return rateLimitCheck.response;
  }

  return handler(req);
}

/**
 * Combined auth + rate limit middleware
 */
export async function protectRoute(
  req: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<Response>,
  options: {
    requireAuth?: boolean;
    rateLimit?: boolean;
    rateLimitIdentifier?: string;
  } = {}
): Promise<Response> {
  const { requireAuth: needsAuth = true, rateLimit = true, rateLimitIdentifier } = options;

  // Apply rate limiting first
  if (rateLimit) {
    const clientIP = getClientIP(req);
    const identifier = rateLimitIdentifier || `protected:${clientIP}`;
    const rateLimitCheck = await checkRateLimit(apiRateLimit, identifier);

    if (!rateLimitCheck.success && rateLimitCheck.response) {
      return rateLimitCheck.response;
    }
  }

  // Then check authentication
  if (needsAuth) {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: authResult.error || 'Authentication required',
        },
        { status: 401 }
      );
    }

    return handler(req, authResult.userId);
  }

  return handler(req, 'anonymous');
}

/**
 * Public route (no auth, but with rate limiting)
 */
export async function publicRoute(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  return withRateLimit(req, handler);
}

