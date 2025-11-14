/**
 * Universal Auth Wrapper - Works with or without Clerk
 * Provides a consistent auth interface regardless of auth provider
 */

import { NextRequest } from 'next/server';

export interface AuthUser {
  userId: string | null;
  isAuthenticated: boolean;
  email?: string;
  name?: string;
}

/**
 * Get authentication - tries Clerk first, falls back to demo mode
 */
export async function getAuthUser(req?: NextRequest): Promise<AuthUser> {
  // Try Clerk first if configured
  const isClerkConfigured = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  );

  if (isClerkConfigured) {
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const clerkAuth = await auth();
      
      if (clerkAuth?.userId) {
        return {
          userId: clerkAuth.userId,
          isAuthenticated: true,
          email: clerkAuth.sessionClaims?.email as string | undefined,
          name: clerkAuth.sessionClaims?.name as string | undefined,
        };
      }
    } catch (error) {
      // Clerk failed, fall through to demo mode
      console.debug('[Auth] Clerk auth failed, using demo mode:', error);
    }
  }

  // Demo mode - allow access in development or if explicitly enabled
  const allowDemoMode = 
    process.env.NODE_ENV === 'development' ||
    process.env.ALLOW_DEMO_MODE === 'true';

  if (allowDemoMode) {
    return {
      userId: 'demo-user',
      isAuthenticated: true,
      email: 'demo@dealershipai.com',
      name: 'Demo User',
    };
  }

  // No auth available
  return {
    userId: null,
    isAuthenticated: false,
  };
}

/**
 * Require authentication - throws or redirects if not authenticated
 */
export async function requireAuth(req?: NextRequest): Promise<AuthUser> {
  const auth = await getAuthUser(req);
  
  if (!auth.isAuthenticated || !auth.userId) {
    throw new Error('Authentication required');
  }
  
  return auth;
}

