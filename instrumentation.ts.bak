/**
 * Next.js Instrumentation Hook
 * This file is required for Sentry to work with Next.js App Router
 * It runs once when the server starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry on the server
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Initialize Sentry on the edge
    await import('./sentry.edge.config');
  }
}

