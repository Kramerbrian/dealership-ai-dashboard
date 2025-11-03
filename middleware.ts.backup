import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Minimal middleware - authentication temporarily disabled
 * TODO: Re-enable authentication when WorkOS is properly configured for Edge Runtime
 */
export async function middleware(req: NextRequest) {
  // Simply pass through all requests for now
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
