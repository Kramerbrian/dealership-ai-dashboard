// Clerk middleware disabled - no authentication required
// import { authMiddleware } from '@clerk/nextjs';

// export default authMiddleware({
//   publicRoutes: [
//     "/",
//     "/api/health",
//     "/api/debug",
//     "/api/trpc/(.*)",  // Make all tRPC routes public for testing
//     "/sign-in(.*)",
//     "/sign-up(.*)",
//     "/sso-callback(.*)",
//     "/api/webhooks/(.*)"
//   ],
//   ignoredRoutes: ["/_next", "/favicon.ico"],
//   // Enable organizations for multi-tenant support
//   beforeAuth: (req) => {
//     // Add any custom logic before authentication
//   },
//   afterAuth: (auth, req) => {
//     // Add any custom logic after authentication
//     // This is where you can handle tenant isolation
//   }
// });

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
