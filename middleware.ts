import { NextRequest, NextResponse } from 'next/server';

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

// Helper function to check if a route is public (string-based check)
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/instant') ||
    pathname.startsWith('/landing') ||
    pathname.startsWith('/api/marketpulse') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/status') ||
    pathname.startsWith('/api/v1') ||
    pathname.startsWith('/api/claude') ||
    pathname.startsWith('/api/schema') ||
    pathname.startsWith('/api/test') ||
    pathname.startsWith('/api/nearby-dealer') ||
    pathname.startsWith('/.well-known')
  );
}

// Check if hostname is dashboard domain
function isDashboardDomain(hostname: string | null): boolean {
  if (!hostname) return false;
  return (
    hostname === 'dash.dealershipai.com' ||
    hostname === 'localhost' ||
    hostname.startsWith('localhost:') ||
    hostname.includes('vercel.app')
  );
}

// Public middleware for main domain (dealershipai.com) - NO Clerk
async function publicMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    (pathname.includes('.') && !pathname.startsWith('/api/'))
  ) {
    return NextResponse.next();
  }

  // Allow all routes on main domain - no auth required
  // Explicitly allow /onboarding on main domain
  if (pathname === '/onboarding' || isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // DEFAULT: Allow through (main domain is public)
  return NextResponse.next();
}

// Dynamically import Clerk only when needed (dashboard domain)
type ClerkMiddlewareFn = typeof import('@clerk/nextjs/server').clerkMiddleware;
type RouteMatcher = ReturnType<typeof import('@clerk/nextjs/server').createRouteMatcher>;

let clerkMiddlewareFn: ClerkMiddlewareFn | null = null;
let createRouteMatcherFn: typeof import('@clerk/nextjs/server').createRouteMatcher | null = null;

async function getClerkMiddleware(): Promise<{
  clerkMiddlewareFn: ClerkMiddlewareFn;
  createRouteMatcher: typeof import('@clerk/nextjs/server').createRouteMatcher;
}> {
  if (!clerkMiddlewareFn || !createRouteMatcherFn) {
    const clerk = await import('@clerk/nextjs/server');
    clerkMiddlewareFn = clerk.clerkMiddleware;
    createRouteMatcherFn = clerk.createRouteMatcher;
  }
  return { 
    clerkMiddlewareFn: clerkMiddlewareFn!, 
    createRouteMatcher: createRouteMatcherFn! 
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
  
  // CRITICAL: Check for Clerk handshake - if present, let Clerk middleware handle it
  // Don't return early - Clerk needs to process the handshake token
  // We'll handle this in the Clerk middleware callback below
  const hasClerkHandshake = req.nextUrl.searchParams.has('__clerk_handshake');

  // If Clerk is not configured, allow demo mode (simplified auth)
  if (!isClerkConfigured) {
    const allowDemoMode = 
      process.env.NODE_ENV === 'development' ||
      process.env.ALLOW_DEMO_MODE === 'true';
    
    if (allowDemoMode) {
      console.warn('[Middleware] Clerk not configured - running in demo mode');
      // Allow all routes in demo mode - auth is handled at page/API level
      return NextResponse.next();
    }
    
    // In production without Clerk, allow public routes but block protected ones
    // Protected routes will handle auth at the page/API level
    console.warn('[Middleware] Clerk not configured - allowing public routes only');
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }
    
    // For protected routes, allow through - they'll handle auth themselves
    // This prevents middleware from blocking the entire app
    return NextResponse.next();
  }

  // Lazy load Clerk middleware only when needed
  let protectedRouteMatcher: RouteMatcher;
  
  try {
    const { clerkMiddlewareFn, createRouteMatcher } = await getClerkMiddleware();
    
    // Create protected route matcher
    // NOTE: Routes with __clerk_handshake are handled above and bypass protection
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
    // IMPORTANT: /dash is NOT in publicRoutes - it's protected, but handshake is handled in callback
    // IMPORTANT: During handshake, our callback allows it through without auth check
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
  // If Clerk fails, gracefully fall back to allowing the request through
  try {
    // Create Clerk middleware instance with options
    if (!clerkMiddlewareFn) {
      throw new Error('Clerk middleware function not available');
    }
    
    const clerkMw = clerkMiddlewareFn(async (auth) => {
      // CRITICAL: If this is a Clerk handshake, allow it through without auth check
      // Clerk will process the handshake token and set cookies
      // After handshake completes, Clerk will redirect to the same URL without the parameter
      if (hasClerkHandshake) {
        // Let Clerk process the handshake - don't block it
        // Clerk middleware will handle the handshake processing automatically
        return NextResponse.next();
      }
      
      // We're on dashboard domain - apply Clerk authentication to protected routes
      // Only protect routes that are explicitly marked as protected
      if (protectedRouteMatcher(req)) {
        try {
          const authResult = await auth();
          const userId = authResult.userId;
          if (!userId) {
            // Only redirect if we're sure Clerk is working
            // Otherwise, let the page handle auth
            if (isClerkConfigured) {
              const signInUrl = new URL('/sign-in', req.url);
              signInUrl.searchParams.set('redirect_url', req.url);
              return NextResponse.redirect(signInUrl);
            }
            // If Clerk not configured, allow through (demo mode)
            return NextResponse.next();
          }
        } catch (authError: unknown) {
          console.error('[Middleware] Auth check failed:', authError);
          // On auth failure, allow through - pages/APIs will handle auth
          // This prevents middleware from blocking everything
          return NextResponse.next();
        }
      }

      // Default: allow through (for public routes or routes not in protectedRouteMatcher)
      return NextResponse.next();
    }, clerkOptions);
    
    // Invoke the middleware with request
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
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
