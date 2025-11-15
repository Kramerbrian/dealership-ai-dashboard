/**
 * Sentry Error Tracking Integration
 * Configured for production error monitoring
 */

let Sentry: any = null;

// Lazy load Sentry to avoid build-time errors
export function initSentry() {
  if (typeof window === 'undefined') {
    // Server-side: no Sentry for now
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.warn('[Sentry] DSN not configured. Error tracking disabled.');
    return;
  }

  try {
    // Dynamic import to avoid build errors if Sentry not installed
    import('@sentry/nextjs').then((sentryModule) => {
      Sentry = sentryModule;
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'production',
        tracesSampleRate: 0.1, // 10% of transactions
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend(event: any) {
          // Filter out noisy errors
          if (event.exception) {
            const error = event.exception.values?.[0];
            if (error?.value?.includes('ResizeObserver')) {
              return null; // Ignore ResizeObserver errors
            }
          }
          return event;
        },
      });
      console.log('[Sentry] Error tracking initialized');
    }).catch(() => {
      console.warn('[Sentry] Package not installed. Run: npm install @sentry/nextjs');
    });
  } catch (error) {
    console.warn('[Sentry] Failed to initialize:', error);
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!Sentry) {
    console.error('[Error]', error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!Sentry) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }
  Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string; username?: string }) {
  if (!Sentry) return;
  Sentry.setUser(user);
}
