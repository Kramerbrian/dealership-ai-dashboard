import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive data from errors
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    if (event.request?.headers?.['x-api-key']) {
      delete event.request.headers['x-api-key'];
    }
    return event;
  },
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'dealershipai-dashboard',
      version: process.env.npm_package_version || '1.0.0',
    },
  },
  
  // Only initialize if DSN is provided
  enabled: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
});
