// Session Role Extraction
// DealershipAI - Edge-Safe Role Extraction from Request Headers

import { Role, isValidRole } from "../rbac";

/**
 * Extract role from request headers (edge-safe)
 * Expects x-role header to be set after auth callback
 */
export function getRole(req: Request): Role {
  const roleHeader = req.headers.get("x-role") || "viewer";
  
  if (isValidRole(roleHeader)) {
    return roleHeader;
  }
  
  // Fallback to viewer for invalid roles
  console.warn(`Invalid role in x-role header: ${roleHeader}, defaulting to viewer`);
  return "viewer";
}

/**
 * Extract user ID from request headers
 * Expects x-user-id header to be set after auth callback
 */
export function getUserId(req: Request): string | null {
  return req.headers.get("x-user-id");
}

/**
 * Extract tenant ID from request headers
 * Expects x-tenant-id header to be set after auth callback
 */
export function getTenantId(req: Request): string | null {
  return req.headers.get("x-tenant-id");
}

/**
 * Extract session data from request headers
 * Combines role, user ID, and tenant ID
 */
export function getSessionData(req: Request): {
  role: Role;
  userId: string | null;
  tenantId: string | null;
} {
  return {
    role: getRole(req),
    userId: getUserId(req),
    tenantId: getTenantId(req)
  };
}

/**
 * Check if request has valid session headers
 */
export function hasValidSession(req: Request): boolean {
  const userId = getUserId(req);
  const tenantId = getTenantId(req);
  const role = getRole(req);
  
  return !!(userId && tenantId && isValidRole(role));
}

/**
 * Create session headers for API requests
 * Use this when making internal API calls
 */
export function createSessionHeaders(session: {
  role: Role;
  userId: string;
  tenantId: string;
}): Record<string, string> {
  return {
    "x-role": session.role,
    "x-user-id": session.userId,
    "x-tenant-id": session.tenantId
  };
}

/**
 * Middleware helper to validate session and extract data
 * Returns null if session is invalid
 */
export function validateAndExtractSession(req: Request): {
  role: Role;
  userId: string;
  tenantId: string;
} | null {
  if (!hasValidSession(req)) {
    return null;
  }
  
  const session = getSessionData(req);
  
  if (!session.userId || !session.tenantId) {
    return null;
  }
  
  return {
    role: session.role,
    userId: session.userId,
    tenantId: session.tenantId
  };
}

/**
 * Extract role from JWT token (if using JWT auth)
 * This is a placeholder - implement based on your JWT structure
 */
export function getRoleFromJWT(token: string): Role {
  try {
    // This is a placeholder implementation
    // In a real app, you would decode the JWT and extract the role
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // return decoded.role || "viewer";
    
    console.warn("JWT role extraction not implemented, defaulting to viewer");
    return "viewer";
  } catch (error) {
    console.error("Failed to extract role from JWT:", error);
    return "viewer";
  }
}

/**
 * Extract role from session cookie (if using cookie-based auth)
 * This is a placeholder - implement based on your session structure
 */
export function getRoleFromCookie(req: Request): Role {
  try {
    // This is a placeholder implementation
    // In a real app, you would parse the session cookie and extract the role
    // const sessionCookie = req.headers.get("cookie");
    // const session = parseSessionCookie(sessionCookie);
    // return session.role || "viewer";
    
    console.warn("Cookie role extraction not implemented, defaulting to viewer");
    return "viewer";
  } catch (error) {
    console.error("Failed to extract role from cookie:", error);
    return "viewer";
  }
}

/**
 * Multi-source role extraction with fallback chain
 * Tries header first, then JWT, then cookie, then defaults to viewer
 */
export function getRoleWithFallback(req: Request): Role {
  // Try header first (most common for API routes)
  const headerRole = req.headers.get("x-role");
  if (headerRole && isValidRole(headerRole)) {
    return headerRole;
  }
  
  // Try JWT token
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const jwtRole = getRoleFromJWT(token);
    if (jwtRole !== "viewer") {
      return jwtRole;
    }
  }
  
  // Try cookie
  const cookieRole = getRoleFromCookie(req);
  if (cookieRole !== "viewer") {
    return cookieRole;
  }
  
  // Default fallback
  return "viewer";
}
