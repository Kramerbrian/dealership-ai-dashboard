import { NextRequest, NextResponse } from 'next/server';
import type { NextMiddleware } from 'next/server';

// Edge runtime for optimal performance
export const runtime = 'edge';

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

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
  '/api/marketpulse', // Allow marketpulse API for landing page analysis
  '/robots.txt',
  '/sitemap.xml',
  '/sign-in',
  '/sign-up',
  '/auth/signin',
  '/auth/signup',
];

// Note: getProtectedRouteMatcher is now inlined in dashboardMiddleware
// to avoid duplicate imports and improve error handling

function isPublicRoute(pathname: string): boolean {
  return (
    publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) ||
    pathname.startsWith('/onboarding') || // Explicitly allow onboarding (needed for Clerk handshake)
    pathname.startsWith('/(mkt)') ||
    pathname.startsWith('/(auth)') || // Auth route group
    pathname.startsWith('/api/v1/') ||
    pathname.startsWith('/api/claude/') ||
    pathname === '/api/claude/download' ||
    pathname.startsWith('/api/schema') ||
    pathname.startsWith('/.well-known/') ||
    pathname.startsWith('/api/gpt/') ||
    pathname.startsWith('/api/test') ||
    pathname.startsWith('/api/marketpulse') || // Explicitly allow marketpulse API
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

// Simple pass-through middleware for main domain (no Clerk)
async function publicMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static assets - allow immediately
  if (isIgnoredRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow /onboarding on main domain for initial flow (before auth)
  // This allows users to enter dealership URL and get redirected to onboarding
  if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) {
    return NextResponse.next();
  }

  // Redirect dashboard routes to dashboard subdomain
  const dashboardPaths = ['/dash', '/dashboard', '/intelligence', '/cognitive'];
  if (dashboardPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    try {
      const dashboardUrl = new URL(req.url);
      dashboardUrl.hostname = 'dash.dealershipai.com';
      return NextResponse.redirect(dashboardUrl, 308); // Permanent redirect
    } catch (error: unknown) {
      // If URL construction fails, log and handle appropriately
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Middleware] Failed to construct redirect URL:', errorMessage);
      console.error('[Middleware] Original URL:', req.url);
      
      // For API routes, return error response
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Redirect failed', message: errorMessage },
          { status: 500 }
        );
      }
      // For pages, allow through to prevent complete failure
      return NextResponse.next();
    }
  }

  // All other routes on main domain are public - allow through
  return NextResponse.next();
}

// Dynamically import Clerk only when needed (dashboard domain)
// Clerk middleware is a function that returns a NextMiddleware
type ClerkMiddlewareFn = typeof import('@clerk/nextjs/server').clerkMiddleware;
type RouteMatcher = ReturnType<typeof import('@clerk/nextjs/server').createRouteMatcher>;

let clerkMiddlewareFn: ClerkMiddlewareFn | null = null;
let createRouteMatcher: typeof import('@clerk/nextjs/server').createRouteMatcher | null = null;

async function getClerkMiddleware(): Promise<{
  clerkMiddlewareFn: ClerkMiddlewareFn;
  createRouteMatcher: typeof import('@clerk/nextjs/server').createRouteMatcher;
}> {
  if (!clerkMiddlewareFn || !createRouteMatcher) {
    const clerk = await import('@clerk/nextjs/server');
    clerkMiddlewareFn = clerk.clerkMiddleware;
    createRouteMatcher = clerk.createRouteMatcher;
  }
  return { 
    clerkMiddlewareFn: clerkMiddlewareFn!, 
    createRouteMatcher: createRouteMatcher! 
  };
}

// Clerk middleware (only for dashboard domain) - lazy loaded
async function dashboardMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CRITICAL: On dashboard domain, root path (/) should redirect to /dash (the dashboard)
  // This prevents the landing page from showing on the dashboard domain
  if (pathname === '/') {
    const dashUrl = new URL(req.url);
    dashUrl.pathname = '/dash';
    // Preserve query parameters (e.g., ?dealer=germainhonda.com)
    dashUrl.search = req.nextUrl.search;
    return NextResponse.redirect(dashUrl, 308);
  }

  // IMPORTANT: Check public routes FIRST, before any auth logic
  // This ensures public endpoints always bypass auth
  // BUT: Root path (/) is NOT public on dashboard domain - it redirects to /dash above
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If Clerk is not configured, handle based on environment
  if (!isClerkConfigured) {
    // Only allow demo mode in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Middleware] Clerk not configured - running in demo mode (development only)');
      return NextResponse.next();
    }
    // In production, fail securely
    console.error('[Middleware] Clerk not configured in production!');
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      );
    }
    // For pages, redirect to sign-in with error
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('error', 'auth_unavailable');
    return NextResponse.redirect(signInUrl);
  }

  // Lazy load Clerk middleware only when needed
  let protectedRouteMatcher: RouteMatcher;
  
  try {
    const { clerkMiddlewareFn, createRouteMatcher } = await getClerkMiddleware();
    
    // Create protected route matcher
    // NOTE: /onboarding is NOT in protected routes - it's public to allow Clerk handshake
    protectedRouteMatcher = createRouteMatcher([
      '/dashboard(.*)',
      '/dash(.*)',
      '/intelligence(.*)',
      // '/onboarding(.*)', // REMOVED - onboarding must be public for Clerk handshake
      '/api/ai(.*)',
      '/api/parity(.*)',
      '/api/intel(.*)',
      '/api/compliance(.*)',
      '/api/audit(.*)',
      '/api/user(.*)',
      '/api/pulse(.*)',
      '/api/save-metrics',
    ]);
  } catch (error: unknown) {
    console.error('[Middleware] Failed to load Clerk middleware:', error);
    // If Clerk fails to load, allow public routes, block protected routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    signInUrl.searchParams.set('error', 'clerk_load_error');
    return NextResponse.redirect(signInUrl);
  }
  
  // Determine if we should set domain for cookies (only for production dashboard domain)
  const hostname = req.headers.get('host') || '';
  const isProductionDashboard = hostname === 'dash.dealershipai.com';

  // Clerk middleware options
  const clerkOptions: {
    publicRoutes?: string[];
    domain?: string;
  } = {
    // CRITICAL: Tell Clerk these routes should skip auth entirely
    // IMPORTANT: /onboarding must be public to allow Clerk handshake to complete
    publicRoutes: [
      '/',
      '/onboarding(/*)', // Allow onboarding during Clerk handshake
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
      '/api/marketpulse(/*)', // Allow marketpulse API for landing page
      '/.well-known(/*)',
      '/pricing',
      '/instant',
      '/sign-in(/*)',
      '/sign-up(/*)',
      '/auth/signin(/*)',
      '/auth/signup(/*)',
    ]
  };

  // IMPORTANT: Only set domain in production to avoid cookie issues in dev/preview
  if (isProductionDashboard) {
    clerkOptions.domain = 'dash.dealershipai.com';
  }

  // Call Clerk middleware with proper error handling
  try {
    // Create Clerk middleware instance with options
    // The handler receives auth object directly (not a function)
    // clerkMiddlewareFn is guaranteed to be non-null from getClerkMiddleware() above
    if (!clerkMiddlewareFn) {
      throw new Error('Clerk middleware function not available');
    }
    
    const clerkMw = clerkMiddlewareFn(async (auth) => {
      // We're on dashboard domain - apply Clerk authentication to protected routes
      // Only protect routes that are explicitly marked as protected
      if (protectedRouteMatcher(req)) {
        try {
          // auth() is called directly to get the auth object
          const authResult = await auth();
          const userId = authResult.userId;
          if (!userId) {
            // Redirect to sign-in for protected routes
            const signInUrl = new URL('/sign-in', req.url);
            signInUrl.searchParams.set('redirect_url', req.url);
            return NextResponse.redirect(signInUrl);
          }
        } catch (authError: unknown) {
          console.error('[Middleware] Auth check failed:', authError);
          // If auth check fails, allow through for public routes
          if (isPublicRoute(pathname)) {
            return NextResponse.next();
          }
          // For protected routes, redirect to sign-in
          const signInUrl = new URL('/sign-in', req.url);
          signInUrl.searchParams.set('redirect_url', req.url);
          signInUrl.searchParams.set('error', 'auth_check_failed');
          return NextResponse.redirect(signInUrl);
        }
      }

      // Default: allow through (for routes that are neither explicitly public nor protected)
      return NextResponse.next();
    }, clerkOptions);
    
    // Invoke the middleware with request
    // NextFetchEvent is required by the type signature but not used in edge runtime
    // Create a minimal event object to satisfy the type system
    const event = {
      waitUntil: async () => {},
      passThroughOnException: () => {},
    } as any;
    const result = await clerkMw(req, event);
    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorCode = (error as { code?: string })?.code;
    
    console.error('[Middleware] Clerk middleware invocation error:', error);
    console.error('[Middleware] Error details:', {
      message: errorMessage,
      stack: errorStack,
      pathname,
      hostname,
      isClerkConfigured,
      errorName,
      errorCode,
    });
    
    // If Clerk middleware fails, allow through for public routes (including onboarding)
    if (isPublicRoute(pathname) || pathname.startsWith('/onboarding')) {
      console.warn('[Middleware] Allowing public route despite middleware error:', pathname);
      return NextResponse.next();
    }
    
    // For protected routes, redirect to sign-in with error info
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    signInUrl.searchParams.set('error', 'middleware_error');
    return NextResponse.redirect(signInUrl);
  }
}

// Export conditional middleware: only use Clerk on dashboard domain
export default async function middleware(req: NextRequest) {
  try {
    const hostname = req.headers.get('host') || '';
    
    // CRITICAL: If NOT on dashboard domain, use simple pass-through (NO Clerk)
    // This prevents Clerk from being imported or invoked at all on the main domain
    if (!isDashboardDomain(hostname)) {
      return await publicMiddleware(req);
    }
    
    // If on dashboard domain, use Clerk middleware (lazy loaded)
    return await dashboardMiddleware(req);
  } catch (error: unknown) {
    // Catch any unexpected errors in middleware to prevent 500s
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[Middleware] Unexpected error:', {
      message: errorMessage,
      stack: errorStack,
      pathname: req.nextUrl.pathname,
      hostname: req.headers.get('host'),
    });
    
    // For API routes, return error response instead of crashing
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Middleware error', message: errorMessage },
        { status: 500 }
      );
    }
    
    // For other routes, allow through to prevent complete failure
    // This ensures the site remains functional even if middleware has issues
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and public directories
    '/((?!_next|claude|exports|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
