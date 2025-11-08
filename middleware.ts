import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/(marketing)(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/v1/analyze',
  '/.well-known/ai-plugin.json',
  '/api/gpt/(.*)',
  '/robots.txt',
  '/sitemap.xml',
  '/api/scan/quick',
  '/api/telemetry',
  '/api/pulse/(.*)',
  '/api/schema/validate',
  '/api/visibility/presence',
  '/api/ai-scores',
  '/api/formulas/weights',
]);

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/user(.*)',
]);

// Onboarding route - authenticated but doesn't require completion
const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
    
    // Check onboarding completion for dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      const user = await currentUser();
      if (user) {
        const onboardingComplete = 
          (user.publicMetadata as any)?.onboarding_complete === true ||
          (user.publicMetadata as any)?.onboarding_complete === 'true';
        
        if (!onboardingComplete) {
          // Redirect to onboarding if not completed
          const onboardingUrl = new URL('/onboarding', req.url);
          return NextResponse.redirect(onboardingUrl);
        }
      }
    }
  }
  
  // Onboarding route - allow authenticated users
  if (isOnboardingRoute(req)) {
    await auth.protect();
  }
  
  // Public routes are accessible without authentication
  // No action needed for public routes
});

export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico|og-image.png).*)'],
};
