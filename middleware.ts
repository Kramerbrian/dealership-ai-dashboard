import {authMiddleware} from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    "/",
    "/(mkt)(.*)",
    "/api/v1/analyze",
    "/.well-known/ai-plugin.json",
    "/api/gpt/(.*)",
    "/robots.txt",
    "/sitemap.xml"
  ],
  ignoredRoutes: [
    "/_next(.*)",
    "/favicon.ico",
    "/og-image.png"
  ]
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
}
