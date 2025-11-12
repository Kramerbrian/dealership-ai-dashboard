/**
 * Next.js Instrumentation Hook
 * This file is required for Sentry to work with Next.js App Router
 * It runs once when the server starts
 */

export async function register() {
  // Only initialize Sentry if DSN is configured
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Sentry DSN not configured. Error tracking disabled.');
    }
    return;
  }

  try {
    // Only initialize for Node.js runtime (not edge)
    // Edge runtime uses sentry.edge.config.ts
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Import the server config file
      await import('./sentry.server.config');
    }
  } catch (error) {
    // Gracefully handle Sentry initialization failures
    // Don't block application startup
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Sentry initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

