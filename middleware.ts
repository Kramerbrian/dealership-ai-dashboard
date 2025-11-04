import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClientIP, checkRateLimit, apiRateLimit } from '@/lib/rate-limit';

/**
 * Global Middleware for DealershipAI
 * 
 * Handles subdomain routing and applies rate limiting and security headers
 */
export async function middleware(request: NextRequest) {
  // Get hostname to determine subdomain
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname;

  // Handle subdomain routing
  // dash.dealershipai.com → Show DealershipAIDashboardLA at root (/)
  // dealershipai.com (main domain) → Show SimplifiedLandingPage (handled by app/page.tsx)
  if (hostname.startsWith('dash.')) {
    // dash.dealershipai.com - Show DealershipAIDashboardLA at root
    if (pathname === '/') {
      url.pathname = '/dashboard';
      return NextResponse.rewrite(url);
    }
  }
  // Main domain (dealershipai.com) shows SimplifiedLandingPage via app/page.tsx
  // No rewrite needed - let it use the default route

  // Skip middleware for static files, Next.js internals, and health checks
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/web-vitals') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    try {
      const clientIP = getClientIP(request);
      const rateLimitIdentifier = `api:${clientIP}:${pathname}`;
      
      const rateLimitCheck = await checkRateLimit(apiRateLimit, rateLimitIdentifier);

      if (!rateLimitCheck.success && rateLimitCheck.response) {
        return rateLimitCheck.response;
      }
    } catch (error) {
      // If rate limiting fails, log but don't block the request
      // This ensures the app stays available even if Redis is down
      console.error('[Middleware] Rate limit check failed:', error);
    }
  }

  // Create response
  const response = NextResponse.next();

  // Security headers (enhance existing from next.config.js)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CSP (allows Google Analytics and other third-party scripts)
  // Note: 'unsafe-eval' is required for Google Analytics gtag function
  // 'unsafe-inline' is required for inline scripts in Next.js
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.clerk.com https://*.clerk.dev https://*.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://*.sentry.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.supabase.co https://*.sentry.io https://*.logtail.com https://*.googletagmanager.com https://*.google-analytics.com wss://*.clerk.com https://va.vercel-scripts.com",
    "frame-src 'self' https://*.clerk.com https://*.clerk.dev",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health checks)
     * - api/web-vitals (web vitals tracking)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/health|api/web-vitals|_next/static|_next/image|favicon.ico).*)',
  ],
};

