/**
 * Enhanced Sentry Error Tracking
 * 
 * Provides advanced error tracking with context and grouping
 */

import * as Sentry from '@sentry/nextjs';

interface ErrorContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  url?: string;
  userAgent?: string;
  [key: string]: any;
}

/**
 * Initialize enhanced Sentry (if enabled)
 */
export function initEnhancedSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return; // Sentry not configured
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Enhanced error context
    beforeSend(event, hint) {
      // Add deployment info
      if (event.tags) {
        event.tags = {
          ...event.tags,
          deployment: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
          branch: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
          environment: process.env.NODE_ENV,
        };
      }

      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Don't track network errors from user's connection
          if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            return null;
          }
        }
      }

      return event;
    },

    // Integrations
    integrations: [
      ...(typeof window !== 'undefined' ? [
        Sentry.replayIntegration(),
        Sentry.browserTracingIntegration({
          tracePropagationTargets: ['dealershipai.com', /^\//],
        }),
      ] : []),
    ],
  });
}

/**
 * Capture error with enhanced context
 */
export function captureError(error: Error, context?: ErrorContext) {
  Sentry.captureException(error, {
    tags: context ? {
      userId: context.userId,
      tenantId: context.tenantId,
    } : undefined,
    extra: context,
    level: 'error',
  });
}

/**
 * Capture message with context
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: ErrorContext) {
  Sentry.captureMessage(message, {
    level,
    tags: context ? {
      userId: context.userId,
      tenantId: context.tenantId,
    } : undefined,
    extra: context,
  });
}

/**
 * Set user context for all future errors
 */
export function setUserContext(userId: string, email?: string, additional?: Record<string, any>) {
  Sentry.setUser({
    id: userId,
    email,
    ...additional,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, level: Sentry.SeverityLevel = 'info', data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Track performance
 */
export function trackPerformance(name: string, duration: number, context?: Record<string, any>) {
  Sentry.metrics.distribution(name, duration, {
    unit: 'millisecond',
    tags: context,
  });
}

