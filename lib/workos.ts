/**
 * WorkOS Authentication Utilities
 * Server-side authentication helpers using WorkOS
 */

import { WorkOS } from '@workos-inc/node';

// Initialize WorkOS client
// WORKOS_API_KEY is required for server-side operations
// WORKOS_CLIENT_ID is for OAuth redirects (use NEXT_PUBLIC_WORKOS_CLIENT_ID on client)
const apiKey = process.env.WORKOS_API_KEY;
if (!apiKey) {
  console.warn('[WorkOS] WORKOS_API_KEY is not set. WorkOS features will be limited.');
}
export const workos = apiKey ? new WorkOS(apiKey) : null as any;

/**
 * Get WorkOS Client ID
 * For OAuth redirects - use NEXT_PUBLIC_WORKOS_CLIENT_ID on client-side
 */
export function getWorkOSClientId(): string {
  return process.env.WORKOS_CLIENT_ID || process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || '';
}

/**
 * Get WorkOS API Key
 * Server-side only - never expose to client
 */
export function getWorkOSApiKey(): string {
  return process.env.WORKOS_API_KEY || '';
}

/**
 * Authentication result interface
 */
export interface WorkOSAuthResult {
  userId: string | null;
  user: any | null;
  isAuthenticated: boolean;
  error?: string;
}

/**
 * Get authenticated user from request (server-side)
 * This extracts user info from session cookie or JWT
 */
export async function getWorkOSUser(req: Request): Promise<WorkOSAuthResult> {
  try {
    // Get session from cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('wos-session='));

    if (!sessionCookie) {
      return {
        userId: null,
        user: null,
        isAuthenticated: false,
        error: 'No session found',
      };
    }

    // Extract session token
    const sessionToken = sessionCookie.split('=')[1];

    // Verify session with WorkOS
    if (!workos) {
      return {
        userId: null,
        user: null,
        isAuthenticated: false,
        error: 'WorkOS not configured',
      };
    }

    try {
      const { user } = await workos.userManagement.getUser(sessionToken);
      
      return {
        userId: user.id,
        user: user,
        isAuthenticated: true,
      };
    } catch (error) {
      return {
        userId: null,
        user: null,
        isAuthenticated: false,
        error: 'Invalid session',
      };
    }
  } catch (error) {
    console.error('[WorkOS] Auth error:', error);
    return {
      userId: null,
      user: null,
      isAuthenticated: false,
      error: 'Authentication failed',
    };
  }
}

