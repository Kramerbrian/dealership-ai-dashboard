import { NextRequest, NextResponse } from 'next/server';

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/v1/analyze',
  '/api/health',
  '/api/v1/health',
  '/.well-known/ai-plugin.json',
  '/api/gpt',
  '/robots.txt',
  '/sitemap.xml',
  '/sign-in',
  '/sign-up',
];

function isPublicRoute(pathname: string): boolean {
  return (
    publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) ||
    pathname.startsWith('/(mkt)') ||
    pathname.startsWith('/api/v1/analyze') ||
    pathname.startsWith('/.well-known/') ||
    pathname.startsWith('/api/gpt/')
  );
}

function isIgnoredRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/og-image.png'
  );
}

// Simple passthrough middleware when Clerk is not configured
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static assets
  if (isIgnoredRoute(pathname)) {
    return NextResponse.next();
  }

  // If Clerk is not configured, allow all routes (demo mode)
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  // For Clerk-configured environments, we'll use a dynamic import
  // This will be handled by the actual clerkMiddleware in production
  // For now, allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Protected routes will need Clerk - for now, allow in demo mode
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
