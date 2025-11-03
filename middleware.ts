import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { workos, getWorkOSUser } from '@/lib/workos';

// Define protected routes
const isProtectedRoute = (pathname: string): boolean => {
  const protectedPaths = [
    '/dashboard',
    '/intelligence',
    '/api/ai',
    '/api/parity',
    '/api/intel',
    '/api/compliance',
    '/api/audit'
  ];

  return protectedPaths.some(path => pathname.startsWith(path));
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // TODO: Re-enable WorkOS authentication when properly configured for Edge Runtime
  // Protect routes that require authentication
  // if (isProtectedRoute(pathname)) {
  //   // Check for WorkOS session
  //   const cookieHeader = req.headers.get('cookie') || '';
  //   const hasSession = cookieHeader.includes('wos-session=');

  //   if (!hasSession) {
  //     // Redirect to sign-in
  //     const signInUrl = new URL('/sign-in', req.url);
  //     signInUrl.searchParams.set('redirect', pathname);
  //     return NextResponse.redirect(signInUrl);
  //   }

  //   // Verify session is valid
  //   try {
  //     const authResult = await getWorkOSUser(req);
  //     if (!authResult.isAuthenticated) {
  //       const signInUrl = new URL('/sign-in', req.url);
  //       signInUrl.searchParams.set('redirect', pathname);
  //       return NextResponse.redirect(signInUrl);
  //     }
  //   } catch (error) {
  //     console.error('[Middleware] Auth verification failed:', error);
  //     const signInUrl = new URL('/sign-in', req.url);
  //     signInUrl.searchParams.set('redirect', pathname);
  //     return NextResponse.redirect(signInUrl);
  //   }
  // }

  // Handle tenant isolation (read from cookie or path)
  const url = new URL(req.url);
  const cookieTenant = req.cookies.get("tenant_id")?.value;
  const headerTenant = req.headers.get("x-tenant-id");
  const tenantId = headerTenant || cookieTenant || url.searchParams.get("tenant");

  if (!tenantId && pathname.startsWith("/api/audit")) {
    return new NextResponse(JSON.stringify({ error: "Missing x-tenant-id" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Add tenant header to all audit API requests
  if (tenantId && pathname.startsWith("/api/audit")) {
    const response = NextResponse.next();
    response.headers.set("x-tenant-id", tenantId);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
