/**
 * Next.js Instrumentation (Node.js Runtime Only)
 *
 * IMPORTANT: This file runs in Node.js runtime ONLY
 * Do NOT use Edge Runtime features or Sentry Edge config
 *
 * Safe for production - conditionally loads based on environment
 */

export async function register() {
  // Only load instrumentation in Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Load Sentry for Node.js (server-side only)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production') {
      try {
        await import('./sentry.server.config');
        console.log('[Instrumentation] Sentry server config loaded');
      } catch (error) {
        console.warn('[Instrumentation] Failed to load Sentry:', error);
      }
    }

    // Load OpenTelemetry if configured
    if (process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
      try {
        await import('./lib/otel-config');
        console.log('[Instrumentation] OpenTelemetry config loaded');
      } catch (error) {
        console.warn('[Instrumentation] Failed to load OpenTelemetry:', error);
      }
    }
  }

  // NEVER load Edge Runtime instrumentationin this file
  // Edge Runtime is incompatible with many Node.js APIs
}
