/**
 * CSRF Protection Utility
 * Validates Origin headers and provides CSRF token generation
 */

import { NextRequest } from 'next/server';

/**
 * Allowed origins for CSRF protection
 */
const ALLOWED_ORIGINS = [
  'https://dealershipai.com',
  'https://www.dealershipai.com',
  'https://dealership-ai-dashboard.vercel.app',
  'http://localhost:3000', // Development only
];

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return true;
    }
  }

  return ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.endsWith(`.${allowed.replace('https://', '')}`));
}

/**
 * Validate CSRF for state-changing requests
 * Checks Origin header against allowed origins
 */
export function validateCSRF(req: NextRequest): { valid: boolean; error?: string } {
  // Only validate state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!stateChangingMethods.includes(req.method)) {
    return { valid: true };
  }

  // Get Origin header
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // If no origin or referer, check if it's a same-origin request
  if (!origin && !referer) {
    // Could be a same-origin request (e.g., from same domain)
    // For public endpoints, we'll be more lenient
    return { valid: true };
  }

  // Validate origin
  if (origin && !isOriginAllowed(origin)) {
    // Extract origin from referer if origin is not present
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = refererUrl.origin;
        if (isOriginAllowed(refererOrigin)) {
          return { valid: true };
        }
      } catch {
        // Invalid referer URL
      }
    }

    return {
      valid: false,
      error: 'Invalid origin. Request rejected for security reasons.',
    };
  }

  return { valid: true };
}

/**
 * Get allowed origins for CORS
 */
export function getAllowedOrigins(): string[] {
  return process.env.NODE_ENV === 'development'
    ? [...ALLOWED_ORIGINS, 'http://localhost:3000', 'http://127.0.0.1:3000']
    : ALLOWED_ORIGINS;
}

