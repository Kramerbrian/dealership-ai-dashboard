import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Clerk Middleware for Multi-Domain Authentication
 * 
 * Handles authentication between:
 * - dealershipai.com (marketing/landing)
 * - dash.dealershipai.com (dashboard - requires auth)
 */

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/intelligence(.*)',
  '/admin(.*)',
  '/api/dashboard(.*)',
  '/api/ai(.*)',
  '/api/parity(.*)',
  '/api/intel(.*)',
  '/api/compliance(.*)',
  '/api/audit(.*)',
  '/api/onboarding(.*)',
  '/api/competitors(.*)',
  '/api/focus(.*)',
  '/api/upsell(.*)',
  '/api/win-prob(.*)',
  '/api/graph(.*)',
  '/api/pulse(.*)',
  '/api/mystery(.*)',
  '/api/memory(.*)',
]);

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)', // Allow onboarding without auth initially
  '/api/webhooks(.*)',
  '/api/health(.*)',
  '/api/quick-audit(.*)',
  '/api/zero-click(.*)',
  '/privacy(.*)',
  '/terms(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  
  // Determine if this is the dashboard subdomain
  const isDashboardDomain = hostname.includes('dash.') || hostname.includes('dashboard.');
  const isMainDomain = hostname.includes('dealershipai.com') && !isDashboardDomain;

  // Domain-based routing logic
  if (isDashboardDomain) {
    // Dashboard subdomain: Require auth for all routes except public
    if (!isPublicRoute(req)) {
      const { userId } = await auth();
      
      if (!userId) {
        // Redirect to sign-in on main domain
        const signInUrl = new URL('/sign-in', `https://${isMainDomain ? 'dealershipai.com' : hostname}`);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Check onboarding status for authenticated users
      const onboardingStep = req.cookies.get('dai_step')?.value;
      if (onboardingStep && onboardingStep !== '3' && pathname.startsWith('/dashboard')) {
        // Redirect to onboarding if not completed
        const onboardingUrl = new URL('/onboarding', req.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }
  } else if (isMainDomain) {
    // Main domain: Protect only specific routes
    if (isProtectedRoute(req)) {
      const { userId } = await auth();
      
      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }
  }

  // Handle onboarding flow (works on both domains)
  if (pathname.startsWith('/onboarding')) {
    const onboardingStep = req.cookies.get('dai_step')?.value;
    
    // If user is authenticated and onboarding is complete, redirect to dashboard
    const { userId } = await auth();
    if (userId && onboardingStep === '3') {
      const dashboardUrl = new URL('/dashboard', isDashboardDomain ? req.url : `https://dash.dealershipai.com`);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Handle sign-in/sign-up redirects
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    const { userId } = await auth();
    
    // If already signed in, redirect to dashboard
    if (userId) {
      const redirectUrl = req.nextUrl.searchParams.get('redirect_url');
      if (redirectUrl) {
        return NextResponse.redirect(redirectUrl);
      }
      const dashboardUrl = new URL('/dashboard', isDashboardDomain ? req.url : `https://dash.dealershipai.com`);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Redirect /marketing to root
  if (pathname === '/marketing' || pathname.startsWith('/marketing/')) {
    const rootUrl = new URL('/', req.url);
    return NextResponse.redirect(rootUrl, { status: 301 });
  }

  // Allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
