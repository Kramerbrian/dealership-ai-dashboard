/**
 * WorkOS JWT Token Utilities
 * Handles extraction and verification of WorkOS JWT tokens
 */

import { workos } from './workos';

/**
 * Decode JWT token without verification
 * WARNING: Only use for extracting claims, not for security validation
 * WorkOS tokens should be verified using their SDK
 */
export function decodeWorkOSToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode payload (base64url)
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('[WorkOS JWT] Decode failed:', error);
    return null;
  }
}

/**
 * Extract claims from WorkOS JWT token
 * Returns the custom claims from your JWT template
 */
export function extractJWTClaims(token: string): {
  email?: string;
  name?: string;
  organization_id?: string;
  organization_name?: string;
  connection_id?: string;
  connection_type?: string;
  role?: string;
  permissions?: string[];
  dealership_id?: string;
  dealership_name?: string;
  tier?: string;
  [key: string]: any;
} | null {
  const decoded = decodeWorkOSToken(token);
  if (!decoded) {
    return null;
  }

  // Extract custom claims (everything except standard JWT claims)
  const standardClaims = ['iss', 'sub', 'exp', 'iat', 'nbf', 'jti', 'aud'];
  const claims: any = {};

  for (const [key, value] of Object.entries(decoded)) {
    if (!standardClaims.includes(key)) {
      claims[key] = value;
    }
  }

  return Object.keys(claims).length > 0 ? claims : null;
}

/**
 * Get user info from WorkOS using the access token
 * This verifies the token with WorkOS servers
 */
export async function verifyWorkOSToken(token: string): Promise<any | null> {
  if (!workos) {
    console.error('[WorkOS JWT] WorkOS client not configured');
    return null;
  }

  try {
    // WorkOS SDK can verify tokens via user management API
    // For access tokens from SSO, you can verify by using the token
    const user = await workos.userManagement.getUser(token);
    return user;
  } catch (error) {
    console.error('[WorkOS JWT] Token verification failed:', error);
    return null;
  }
}

/**
 * Extract JWT token from request (cookie or Authorization header)
 */
export function getWorkOSTokenFromRequest(req: Request): string | null {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const cookies = req.headers.get('cookie');
  if (cookies) {
    const tokenCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('wos-access-token='));
    
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }

  return null;
}

/**
 * Get JWT claims from request
 * Convenience function that combines token extraction and claim extraction
 */
export function getJWTClaimsFromRequest(req: Request): any | null {
  const token = getWorkOSTokenFromRequest(req);
  if (!token) {
    return null;
  }

  return extractJWTClaims(token);
}

/**
 * Check if user has required role from JWT token
 */
export function hasRole(token: string, requiredRole: string): boolean {
  const claims = extractJWTClaims(token);
  if (!claims) {
    return false;
  }

  const userRole = claims.role || 'viewer';
  
  // Role hierarchy: admin > user > viewer
  const roleHierarchy: Record<string, number> = {
    admin: 3,
    user: 2,
    viewer: 1,
  };

  const userRoleLevel = roleHierarchy[userRole] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Check if user belongs to organization from JWT token
 */
export function belongsToOrganization(token: string, organizationId: string): boolean {
  const claims = extractJWTClaims(token);
  if (!claims) {
    return false;
  }

  return claims.organization_id === organizationId;
}

/**
 * Get organization ID from JWT token
 */
export function getOrganizationId(token: string): string | null {
  const claims = extractJWTClaims(token);
  return claims?.organization_id || null;
}

/**
 * Get user tier from JWT token
 */
export function getUserTier(token: string): string {
  const claims = extractJWTClaims(token);
  return claims?.tier || 'free';
}

