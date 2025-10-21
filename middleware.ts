import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/intelligence(.*)',
  '/api/ai(.*)',
  '/api/parity(.*)',
  '/api/intel(.*)',
  '/api/compliance(.*)',
  '/api/audit(.*)'
]);

export default clerkMiddleware((auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    auth.protect();
  }

  // Example: read tenant from cookie or path; adjust to your auth
  const url = new URL(req.url);
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