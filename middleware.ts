import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Minimal middleware - temporarily simplified for Edge compatibility
 * TODO: Re-enable Clerk auth when Edge compatibility is confirmed
 */

export function middleware(req: NextRequest) {
  // For now, just pass through all requests
  // Auth will be handled at the route level
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
