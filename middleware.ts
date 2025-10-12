/**
 * Multi-tenant Middleware
 * DealershipAI Command Center - Edge-safe tenant detection
 *
 * Tenant Resolution Order:
 * 1. Subdomain (e.g., acme.dealershipai.com)
 * 2. Path segment (e.g., /acme/dashboard)
 * 3. Session header (x-tenant, set after auth)
 * 4. Default: demo-lou-grubbs
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const h = (req.headers.get("host") || "").split(".");
  const sub = h.length > 2 ? h[0] : null;              // e.g., acme.app.com
  const pathTenant = url.pathname.split("/")[1] || null;
  const sessionTenant = req.headers.get("x-tenant") || null; // set after auth
  const tenant = sub || pathTenant || sessionTenant || "demo-lou-grubbs";
  const res = NextResponse.next();
  res.headers.set("x-tenant", tenant);
  // pass-through for server calls that set Postgres var:
  res.headers.set("x-set-app-tenant", tenant);
  return res;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};