import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Integrations
  integrations: [
    // Console logging integration (stable, no experimental features)
    Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
  ],

  // NOTE: _experiments.enableLogs is incompatible with Edge Runtime
  // and caused a 4-hour production outage on 2025-11-03
  // Do NOT re-enable experimental features without Edge Runtime testing

  // Enhanced error context
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Server Event:', event);
      return null;
    }
    return event;
  },
});
