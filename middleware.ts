import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

// Fallback middleware if Clerk fails
function createFallbackMiddleware() {
  return async (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Ignore static assets
    if (isIgnoredRoute(pathname)) {
      return NextResponse.next();
    }

    // Allow public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // If on dashboard domain and route is protected, redirect to sign-in
    if (isDashboardDomain(hostname) && isProtectedRoute(req)) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  };
}

// Check if we're on the dashboard subdomain (where Clerk should be active)
function isDashboardDomain(hostname: string | null): boolean {
  if (!hostname) return false;
  
  // IMPORTANT: Clerk should ONLY be active on dash.dealershipai.com
  // Explicitly block on main domain (dealershipai.com)
  if (hostname === 'dealershipai.com' || hostname === 'www.dealershipai.com') {
    return false;
  }
  
  // Allow only on dashboard subdomain, localhost for development, and vercel.app for previews
  return (
    hostname === 'dash.dealershipai.com' ||
    hostname === 'localhost' ||
    hostname.startsWith('localhost:') ||
    hostname.includes('vercel.app') // Allow Vercel preview URLs for testing
  );
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/v1/analyze',
  '/api/health',
  '/api/status',
  '/api/v1/health',
  '/api/ai/health',
  '/api/system/status',
  '/api/observability',
  '/api/telemetry',
  '/api/performance-test',
  '/api/claude/stats',
  '/api/claude/manifest',
  '/api/claude/export',
  '/api/claude/download',
  '/api/schema/validate',
  '/api/schema/status',
  '/api/schema',
  '/api/schema-validation',
  '/.well-known/ai-plugin.json',
  '/api/gpt',
  '/robots.txt',
  '/sitemap.xml',
  '/sign-in',
  '/sign-up',
  '/auth/signin',
  '/auth/signup',
];

// Protected routes that require authentication (only on dashboard domain)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/dash(.*)',
  '/intelligence(.*)',
  '/onboarding(.*)',
  '/api/ai(.*)',
  '/api/parity(.*)',
  '/api/intel(.*)',
  '/api/compliance(.*)',
  '/api/audit(.*)',
  '/api/user(.*)',
  '/api/pulse(.*)',
  '/api/save-metrics',
]);

function isPublicRoute(pathname: string): boolean {
  return (
    publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) ||
    pathname.startsWith('/(mkt)') ||
    pathname.startsWith('/(auth)') || // Auth route group
    pathname.startsWith('/api/v1/') ||
    pathname.startsWith('/api/claude/') ||
    pathname === '/api/claude/download' ||
    pathname.startsWith('/api/schema') ||
    pathname.startsWith('/.well-known/') ||
    pathname.startsWith('/api/gpt/') ||
    pathname.startsWith('/api/test') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/instant') ||
    pathname.startsWith('/claude/') || // Claude export bundle
    pathname.startsWith('/exports/')   // Manifest and exports
  );
}

function isIgnoredRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/og-image.png' ||
    pathname.endsWith('.zip') || // Allow zip files (Claude export)
    pathname.endsWith('.json') && pathname.startsWith('/exports/') // Allow manifest.json
  );
}

// Middleware: Only apply on dashboard subdomain (dash.dealershipai.com)
// Skip entirely on landing page (dealershipai.com)
export default isClerkConfigured
  ? clerkMiddleware(async (auth, req: NextRequest) => {
      const hostname = req.headers.get('host') || '';
      const { pathname } = req.nextUrl;

      // CRITICAL: Skip middleware entirely on landing page domain
      // This prevents any Clerk or auth logic from running on dealershipai.com
      if (!isDashboardDomain(hostname)) {
        return NextResponse.next();
      }

      // We're on dashboard domain - now apply middleware logic
      // Ignore static assets - allow immediately
      if (isIgnoredRoute(pathname)) {
        return NextResponse.next();
      }

      // IMPORTANT: Check public routes FIRST, before any auth logic
      // This ensures public endpoints always bypass auth
      if (isPublicRoute(pathname)) {
        return NextResponse.next();
      }

      // We're on dashboard domain - apply Clerk authentication to protected routes
      if (isProtectedRoute(req)) {
        try {
          const { userId } = await auth();
          if (!userId) {
            // Redirect to sign-in for protected routes
            const signInUrl = new URL('/sign-in', req.url);
            signInUrl.searchParams.set('redirect_url', req.url);
            return NextResponse.redirect(signInUrl);
          }
        } catch (authError) {
          // If auth check fails, redirect to sign-in
          console.error('Auth check failed:', authError);
          const signInUrl = new URL('/sign-in', req.url);
          signInUrl.searchParams.set('redirect_url', req.url);
          return NextResponse.redirect(signInUrl);
        }
      }

      // Default: allow through
      return NextResponse.next();
    }, {
      // CRITICAL: Tell Clerk these routes should skip auth entirely
      publicRoutes: [
        '/',
        '/api/v1(/*)',
        '/api/health',
        '/api/status',
        '/api/ai/health',
        '/api/system/status',
        '/api/observability',
        '/api/telemetry',
        '/api/claude(/*)',
        '/api/schema(/*)',
        '/api/test(/*)',
        '/api/gpt(/*)',
        '/.well-known(/*)',
        '/pricing',
        '/instant',
        '/sign-in(/*)',
        '/sign-up(/*)',
        '/auth/signin(/*)',
        '/auth/signup(/*)',
      ]
    })
  : async function middleware(req: NextRequest) {
      const hostname = req.headers.get('host') || '';

      // CRITICAL: Skip middleware entirely on landing page domain
      if (!isDashboardDomain(hostname)) {
        return NextResponse.next();
      }

      // Use fallback middleware for dashboard domain
      return createFallbackMiddleware()(req);
    };

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and public directories
    '/((?!_next|claude|exports|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
