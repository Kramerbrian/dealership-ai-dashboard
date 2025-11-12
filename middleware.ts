import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes (exclude root path for public landing page)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/dash(.*)',
  '/intelligence(.*)',
  '/orchestrator(.*)',
  '/api/ai(.*)',
  '/api/parity(.*)',
  '/api/intel(.*)',
  '/api/compliance(.*)',
  '/api/audit(.*)'
]);

// Define public routes that should never require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/signin',
  '/signup',
  '/pricing',
  '/privacy',
  '/terms'
]);

export default clerkMiddleware((auth, req) => {
  const url = new URL(req.url);
  const hostname = req.headers.get('host') || '';

  // Check if this is the dashboard subdomain
  const isDashboardDomain = hostname.includes('dash.dealershipai.com') || hostname.includes('dashboard.dealershipai.com');
  const isMarketingDomain = hostname.includes('dealershipai.com') && !isDashboardDomain;

  // DOMAIN SEPARATION LOGIC

  // 1. Marketing domain (dealershipai.com) - Only allow marketing pages
  if (isMarketingDomain) {
    const marketingRoutes = ['/', '/onboarding', '/pricing', '/privacy', '/terms', '/sign-in', '/sign-up', '/instant'];
    const isMarketingRoute = marketingRoutes.some(route => url.pathname === route || url.pathname.startsWith('/api/'));

    // If trying to access dashboard routes on marketing domain, redirect to dash subdomain
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/preview')) {
      const dashUrl = new URL(req.url);
      dashUrl.hostname = 'dash.dealershipai.com';
      return NextResponse.redirect(dashUrl);
    }

    // Allow marketing routes and API routes
    if (isMarketingRoute) {
      return NextResponse.next();
    }
  }

  // 2. Dashboard domain (dash.dealershipai.com) - Only allow dashboard pages
  if (isDashboardDomain) {
    // Rewrite root to dashboard
    if (url.pathname === '/') {
      const rewriteUrl = url.clone();
      rewriteUrl.pathname = '/dashboard';
      return NextResponse.rewrite(rewriteUrl);
    }

    // If trying to access marketing routes on dashboard domain, redirect to main domain
    const marketingOnlyRoutes = ['/onboarding', '/pricing'];
    if (marketingOnlyRoutes.includes(url.pathname)) {
      const marketingUrl = new URL(req.url);
      marketingUrl.hostname = 'dealershipai.com';
      return NextResponse.redirect(marketingUrl);
    }
  }

  // Skip authentication for public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    auth.protect();
  }

  // Example: read tenant from cookie or path; adjust to your auth
  const cookieTenant = req.cookies.get("tenant_id")?.value;
  const headerTenant = req.headers.get("x-tenant-id");
  const tenantId = headerTenant || cookieTenant || url.searchParams.get("tenant");

  if (!tenantId && url.pathname.startsWith("/api/audit")) {
    return new NextResponse(JSON.stringify({ error: "Missing x-tenant-id" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Add tenant header to all audit API requests
  if (tenantId && url.pathname.startsWith("/api/audit")) {
    const response = NextResponse.next();
    response.headers.set("x-tenant-id", tenantId);
    return response;
  }

  // Cognitive Ops Platform: Attach Orchestrator Role header
  // This identifies all API calls as part of the AI CSO system
  const response = NextResponse.next();
  
  // Set orchestrator role for all API routes (except public ones)
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/analyze") && !url.pathname.startsWith("/api/health")) {
    response.headers.set("X-Orchestrator-Role", "AI_CSO");
  }
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};