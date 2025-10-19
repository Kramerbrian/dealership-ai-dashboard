// Middleware temporarily disabled due to Clerk configuration issues
// Original middleware backed up to middleware.ts.bak

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pass through all requests for now
  return NextResponse.next();
}

export const config = {
  matcher: [],  // Disable middleware matcher
};
