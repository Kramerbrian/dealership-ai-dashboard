import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

// Check if we're on the dashboard subdomain (where Clerk should be active)
function isDashboardDomain(hostname: string | null): boolean {
  if (!hostname) return false;
  
  // Clerk should ONLY be active on dash.dealershipai.com
  // Allow localhost for development and vercel.app for previews
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
    pathname.startsWith('/api/v1/') ||
    pathname.startsWith('/api/claude/') ||
    pathname.startsWith('/api/schema') ||
    pathname.startsWith('/.well-known/') ||
    pathname.startsWith('/api/gpt/') ||
    pathname.startsWith('/api/test') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/instant')
  );
}

function isIgnoredRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/og-image.png'
  );
}

// Middleware: Only apply Clerk on dashboard subdomain
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Ignore static assets
  if (isIgnoredRoute(pathname)) {
    return NextResponse.next();
  }

  // IMPORTANT: Check public routes FIRST, before any auth logic
  // This ensures public endpoints always bypass auth
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If Clerk is not configured, allow all routes (demo mode)
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  // If NOT on dashboard domain (e.g., on main dealershipai.com landing page)
  // Skip Clerk authentication entirely - allow all routes
  if (!isDashboardDomain(hostname)) {
    return NextResponse.next();
  }

  // We're on dashboard domain - apply Clerk authentication to protected routes
  // Only protect routes that are explicitly marked as protected
  if (isProtectedRoute(req)) {
    await auth().protect();
  }

  // Default: allow through (for routes that are neither explicitly public nor protected)
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
