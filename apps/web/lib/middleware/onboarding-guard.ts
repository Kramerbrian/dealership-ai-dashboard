/**
 * Server-side Onboarding Guard Middleware
 * Provides additional security layer for onboarding checks
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface OnboardingCheckResult {
  requiresOnboarding: boolean;
  redirectTo?: string;
  metadata?: Record<string, any>;
}

/**
 * Check if user has completed onboarding (server-side)
 */
export async function checkOnboardingStatus(
  userId: string | null
): Promise<OnboardingCheckResult> {
  if (!userId) {
    return {
      requiresOnboarding: false, // Will be handled by auth middleware
      redirectTo: '/sign-in',
    };
  }

  try {
    // Import Clerk server-side client
    const { clerkClient } = await import('@clerk/nextjs/server');
    const user = await clerkClient.users.getUser(userId);

    // Check public metadata for onboarding completion
    const metadata = user.publicMetadata || {};
    const onboardingComplete = metadata.onboarding_complete === true;

    if (!onboardingComplete) {
      return {
        requiresOnboarding: true,
        redirectTo: '/onboarding',
        metadata,
      };
    }

    return {
      requiresOnboarding: false,
      metadata,
    };
  } catch (error) {
    console.error('Onboarding check error:', error);
    // On error, allow access (fail open) but log for monitoring
    return {
      requiresOnboarding: false,
    };
  }
}

/**
 * Middleware helper to protect routes requiring completed onboarding
 */
export async function requireOnboarding(
  request: NextRequest
): Promise<NextResponse | null> {
  const { userId } = await auth();

  // Allow access to onboarding and auth pages
  const path = request.nextUrl.pathname;
  if (
    path.startsWith('/onboarding') ||
    path.startsWith('/sign-in') ||
    path.startsWith('/sign-up') ||
    path.startsWith('/api/')
  ) {
    return null; // Allow access
  }

  // Check onboarding status
  const check = await checkOnboardingStatus(userId);

  if (check.requiresOnboarding && check.redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = check.redirectTo;
    return NextResponse.redirect(url);
  }

  return null; // Allow access
}

