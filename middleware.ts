import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes (exclude root path for public landing page)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/dash(.*)',
  '/intelligence(.*)',
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

  // Domain-based routing: route dash.dealershipai.com to /dash
  if (hostname.includes('dash.dealershipai.com') && url.pathname === '/') {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = '/dash';
    return NextResponse.rewrite(rewriteUrl);
  }

  // Domain-based routing: route dashboard.dealershipai.com to /dashboard
  if (hostname.includes('dashboard.dealershipai.com') && url.pathname === '/') {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = '/dashboard';
    return NextResponse.rewrite(rewriteUrl);
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