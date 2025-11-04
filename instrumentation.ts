/**
 * Next.js Instrumentation Hook
 * 
 * This file runs once when the server starts.
 * Used for initializing monitoring, tracing, and other server-side setup.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize enhanced Sentry for server-side
    const { initEnhancedSentry } = await import('@/lib/enhanced-sentry');
    initEnhancedSentry();

    console.log('[Instrumentation] Enhanced Sentry initialized');

    // Initialize background job worker if Redis is configured
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { initializeJobWorker } = await import('@/lib/jobs/worker');
        initializeJobWorker();
        console.log('[Instrumentation] Background job worker initialized');
      } catch (error) {
        console.error('[Instrumentation] Failed to initialize job worker:', error);
      }
    } else {
      console.log('[Instrumentation] Background job worker skipped (Redis not configured)');
    }
  }
}
