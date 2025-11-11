/**
 * Sentry Error Tracking Setup
 * Production-ready error monitoring and performance tracking
 */

export function initSentry() {
  if (typeof window === 'undefined') {
    // Server-side Sentry initialization
    const Sentry = require('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });
  } else {
    // Client-side Sentry initialization
    const Sentry = require('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
    });
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    const Sentry = require('@sentry/nextjs');
    Sentry.captureException(error, {
      contexts: {
        custom: context || {},
      },
    });
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window !== 'undefined') {
    const Sentry = require('@sentry/nextjs');
    Sentry.captureMessage(message, level);
  }
}

export function setUser(user: { id: string; email?: string; tier?: string }) {
  if (typeof window !== 'undefined') {
    const Sentry = require('@sentry/nextjs');
    Sentry.setUser(user);
  }
}