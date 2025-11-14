import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

// Public routes that NEVER require auth
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/pricing',
  '/instant',
  '/landing',
  '/api/marketpulse(.*)',
  '/api/health',
  '/api/status',
  '/api/v1(.*)',
  '/api/claude(.*)',
  '/api/schema(.*)',
  '/api/test(.*)',
  '/api/nearby-dealer',
  '/.well-known(.*)',
]);

// Protected routes that REQUIRE auth
const isProtectedRoute = createRouteMatcher([
  '/dash(.*)',
  '/dashboard(.*)',
  '/intelligence(.*)',
  '/cognitive(.*)',
  '/api/user(.*)',
  '/api/pulse(.*)',
  '/api/ai(.*)',
  '/api/parity(.*)',
  '/api/intel(.*)',
  '/api/compliance(.*)',
  '/api/audit(.*)',
  '/api/save-metrics',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Ignore static assets completely
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')  && !pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // PUBLIC ROUTES: Always allow
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // PROTECTED ROUTES: Require auth
  if (isProtectedRoute(req)) {
    // If Clerk not configured, deny access in production
    if (!isClerkConfigured && process.env.NODE_ENV === 'production') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        );
      }
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('error', 'auth_unavailable');
      return NextResponse.redirect(signInUrl);
    }

    // Check authentication
    try {
      const { userId } = await auth();

      if (!userId) {
        // Not authenticated - redirect to sign-in
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error('[Middleware] Auth check failed:', error);
      // Auth check failed - treat as unauthorized
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 500 }
        );
      }
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('error', 'auth_error');
      return NextResponse.redirect(signInUrl);
    }
  }

  // DEFAULT: Allow through (neither explicitly public nor protected)
  return NextResponse.next();
}, {
  // Clerk configuration
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  // Don't set domain - let Clerk handle cookies automatically
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
