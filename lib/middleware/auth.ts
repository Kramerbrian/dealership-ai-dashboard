/**
 * Authentication Middleware
 * Standardized authentication checks for all API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export interface AuthResult {
  userId: string;
  sessionId?: string;
  orgId?: string;
}

export interface AuthError {
  status: number;
  message: string;
  code: string;
}

/**
 * Require authentication for an endpoint
 * Returns AuthResult if authenticated, or Response if not authenticated
 */
export async function requireAuth(
  req: NextRequest
): Promise<AuthResult | NextResponse> {
  try {
    // Check if Clerk is configured
    if (!process.env.CLERK_SECRET_KEY) {
      // In development without Clerk, allow requests with a mock user
      if (process.env.NODE_ENV === 'development') {
        console.warn('Clerk not configured - using mock auth in development');
        return {
          userId: 'dev-user-123',
          sessionId: 'dev-session-123',
          orgId: undefined,
        };
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication service not configured',
          code: 'AUTH_NOT_CONFIGURED',
        },
        { status: 401 }
      );
    }
    
    const { userId, sessionId, orgId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }
    
    return {
      userId,
      sessionId: sessionId || undefined,
      orgId: orgId || undefined,
    };
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    // In development, provide more details
    const errorMessage = process.env.NODE_ENV === 'development'
      ? (error instanceof Error ? error.message : 'Unknown error')
      : 'Failed to verify authentication';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        message: errorMessage,
        code: 'AUTH_ERROR',
      },
      { status: 401 }
    );
  }
}

/**
 * Require organization membership
 * Checks if user belongs to the specified organization
 */
export async function requireOrg(
  req: NextRequest,
  orgId: string
): Promise<AuthResult | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  if (authResult.orgId !== orgId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Access denied to this organization',
        code: 'ORG_ACCESS_DENIED',
      },
      { status: 403 }
    );
  }
  
  return authResult;
}

/**
 * Optional authentication - returns userId if authenticated, null otherwise
 */
export async function getOptionalAuth(
  req: NextRequest
): Promise<AuthResult | null> {
  try {
    // Check if Clerk is configured
    if (!process.env.CLERK_SECRET_KEY) {
      // In development without Clerk, return null (no auth)
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      
      return null;
    }
    
    const { userId, sessionId, orgId } = await auth();
    
    if (!userId) {
      return null;
    }
    
    return {
      userId,
      sessionId: sessionId || undefined,
      orgId: orgId || undefined,
    };
    
  } catch (error) {
    // For optional auth, silently fail and return null
    if (process.env.NODE_ENV === 'development') {
      console.debug('Optional auth error (ignored):', error);
    }
    return null;
  }
}

/**
 * Get user information from Clerk
 */
export async function getUserInfo(userId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
}

/**
 * Check if user has specific role/permission
 */
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // Check organization memberships and roles
    const orgMemberships = user.organizationMemberships || [];
    
    for (const membership of orgMemberships) {
      const org = await client.organizations.getOrganization({
        organizationId: membership.organization.id,
      });
      
      // Check if user has permission in any organization
      // This is a simplified check - implement based on your permission system
      if (org.publicMetadata?.permissions?.[permission]) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Require specific permission
 */
export async function requirePermission(
  req: NextRequest,
  permission: string
): Promise<AuthResult | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const hasAccess = await hasPermission(authResult.userId, permission);
  
  if (!hasAccess) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: `Permission required: ${permission}`,
        code: 'PERMISSION_DENIED',
      },
      { status: 403 }
    );
  }
  
  return authResult;
}

