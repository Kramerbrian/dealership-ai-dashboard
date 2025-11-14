import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Landing page middleware - all routes are public
 * No authentication required for marketing site
 */
export function middleware(request: NextRequest) {
  // Allow all routes on landing page
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

