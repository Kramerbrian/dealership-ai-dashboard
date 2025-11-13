import { NextRequest, NextResponse } from 'next/server';
import type { NextMiddleware } from 'next/server';

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
  '/robots.txt',
  '/sitemap.xml',
  '/sign-in',
  '/sign-up',
  '/auth/signin',
  '/auth/signup',
];

// Protected routes that require authentication (only on dashboard domain)
// This will be initialized lazily when needed (only on dashboard domain)
async function getProtectedRouteMatcher() {
  const { createRouteMatcher: createMatcher } = await getClerkMiddleware();
  return createMatcher([
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
}

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

// Simple pass-through middleware for main domain (no Clerk)
async function publicMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static assets - allow immediately
  if (isIgnoredRoute(pathname)) {
    return NextResponse.next();
  }

  // Redirect dashboard routes to dashboard subdomain
  const dashboardPaths = ['/dash', '/dashboard', '/intelligence', '/cognitive', '/onboarding'];
  if (dashboardPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    const dashboardUrl = new URL(req.url);
    dashboardUrl.hostname = 'dash.dealershipai.com';
    return NextResponse.redirect(dashboardUrl, 308); // Permanent redirect
  }

  // All other routes on main domain are public - allow through
  return NextResponse.next();
}

// Dynamically import Clerk only when needed (dashboard domain)
let clerkMiddleware: any = null;
let createRouteMatcher: any = null;

async function getClerkMiddleware() {
  if (!clerkMiddleware) {
    const clerk = await import('@clerk/nextjs/server');
    clerkMiddleware = clerk.clerkMiddleware;
    createRouteMatcher = clerk.createRouteMatcher;
  }
  return { clerkMiddleware, createRouteMatcher };
}

// Clerk middleware (only for dashboard domain) - lazy loaded
async function dashboardMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // IMPORTANT: Check public routes FIRST, before any auth logic
  // This ensures public endpoints always bypass auth
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If Clerk is not configured, allow all routes (demo mode)
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  // Lazy load Clerk middleware only when needed
  const { clerkMiddleware: clerkMw } = await getClerkMiddleware();
  const protectedRouteMatcher = await getProtectedRouteMatcher();
  
  return clerkMw(async (auth: any, req: NextRequest) => {
    // We're on dashboard domain - apply Clerk authentication to protected routes
    // Only protect routes that are explicitly marked as protected
    if (protectedRouteMatcher(req)) {
      const { userId } = await auth();
      if (!userId) {
        // Redirect to sign-in for protected routes
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Default: allow through (for routes that are neither explicitly public nor protected)
    return NextResponse.next();
  }, {
    // CRITICAL: Tell Clerk these routes should skip auth entirely
    // Use glob patterns (*) not regex (.*)
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
  })(req);
}

// Export conditional middleware: only use Clerk on dashboard domain
export default async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  
  // CRITICAL: If NOT on dashboard domain, use simple pass-through (NO Clerk)
  // This prevents Clerk from being imported or invoked at all on the main domain
  if (!isDashboardDomain(hostname)) {
    return publicMiddleware(req);
  }
  
  // If on dashboard domain, use Clerk middleware (lazy loaded)
  return dashboardMiddleware(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and public directories
    '/((?!_next|claude|exports|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
