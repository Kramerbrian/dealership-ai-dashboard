import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/api/webhook',
  '/api/health',
  '/api/status',
  '/_vercel',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/((?!api/webhook|api/health|api/status|_vercel|sign-in|sign-up).*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Ignore static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    (pathname.includes('.') && !pathname.startsWith('/api/'))
  ) {
    return NextResponse.next();
  }

  // Public routes - allow through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protected routes - require auth
  if (isProtectedRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      // Not authenticated - redirect to sign-in
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

