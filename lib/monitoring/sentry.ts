import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN

// Initialize Sentry
export function initSentry() {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request?.data) {
          delete event.request.data
        }
        return event
      },
    })
  }
}

// Error tracking utilities
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        component: 'dealership-ai',
        ...context,
      },
    })
  }
}

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, level)
  }
}

export const setUserContext = (user: { id: string; email?: string; tier?: string }) => {
  if (SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      extra: {
        tier: user.tier,
      },
    })
  }
}

export const addBreadcrumb = (message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
    })
}

// Performance monitoring
export const startTransaction = (name: string, op: string) => {
  if (SENTRY_DSN) {
    return Sentry.startTransaction({
      name,
      op,
    })
  }
  return null
}

export const finishTransaction = (transaction: any) => {
  if (transaction && SENTRY_DSN) {
    transaction.finish()
  }
}

// API error tracking
export const trackAPIError = (endpoint: string, error: Error, userId?: string) => {
  captureException(error, {
    endpoint,
    userId,
    type: 'api_error',
  })
}

// Business metrics tracking
export const trackBusinessMetric = (metric: string, value: number, userId?: string) => {
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message: `Business metric: ${metric} = ${value}`,
      category: 'business',
      level: 'info',
      data: {
        metric,
        value,
        userId,
      },
    })
  }
}

// User action tracking
export const trackUserAction = (action: string, userId?: string, metadata?: Record<string, any>) => {
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user_action',
      level: 'info',
      data: {
        action,
        userId,
        ...metadata,
      },
    })
  }
}
}