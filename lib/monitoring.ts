// @ts-nocheck
import * as Sentry from '@sentry/nextjs';
import { Analytics } from '@vercel/analytics/react';
import React from 'react';

// Initialize Sentry
export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
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
      return event;
    },
    
    // Custom tags
    initialScope: {
      tags: {
        component: 'dealershipai-dashboard',
        version: process.env.npm_package_version || '1.0.0',
      },
    },
  });
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track API response times
  async trackApiCall<T>(
    operation: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    
    return Sentry.withScope((scope) => {
      scope.setTag('operation', operation);
      scope.setContext('performance', {
        startTime,
        tags,
      });
      
      return Sentry.startSpan(
        {
          name: operation,
          op: 'api.call',
          tags,
        },
        async () => {
          try {
            const result = await fn();
            const duration = Date.now() - startTime;
            
            // Track successful API calls
            Sentry.addBreadcrumb({
              message: `API call completed: ${operation}`,
              level: 'info',
              data: {
                duration,
                success: true,
              },
            });
            
            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            
            // Track failed API calls
            Sentry.addBreadcrumb({
              message: `API call failed: ${operation}`,
              level: 'error',
              data: {
                duration,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            });
            
            throw error;
          }
        }
      );
    });
  }

  // Track user interactions
  trackUserInteraction(action: string, properties?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `User interaction: ${action}`,
      level: 'info',
      data: properties,
    });
    
    // Also track with Vercel Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, properties);
    }
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Page view: ${page}`,
      level: 'info',
      data: properties,
    });
    
    // Set user context
    Sentry.setContext('page', {
      name: page,
      ...properties,
    });
  }

  // Track errors with context
  trackError(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('error_context', context);
      }
      Sentry.captureException(error);
    });
  }

  // Track business metrics
  trackBusinessMetric(metric: string, value: number, tags?: Record<string, string>) {
    Sentry.addBreadcrumb({
      message: `Business metric: ${metric}`,
      level: 'info',
      data: {
        metric,
        value,
        tags,
      },
    });
  }
}

// Analytics utilities
export class AnalyticsManager {
  private static instance: AnalyticsManager;
  
  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  // Track modal interactions
  trackModalOpen(modalType: 'seo' | 'aeo' | 'geo', domain?: string) {
    this.trackEvent('modal_open', {
      modal_type: modalType,
      domain: domain || 'unknown',
    });
  }

  // Track modal interactions
  trackModalInteraction(modalType: 'seo' | 'aeo' | 'geo', action: string, domain?: string) {
    this.trackEvent('modal_interaction', {
      modal_type: modalType,
      action,
      domain: domain || 'unknown',
    });
  }

  // Track dashboard usage
  trackDashboardUsage(section: string, action: string) {
    this.trackEvent('dashboard_usage', {
      section,
      action,
    });
  }

  // Track OAuth events
  trackOAuthEvent(provider: string, action: 'signin' | 'signout' | 'error') {
    this.trackEvent('oauth_event', {
      provider,
      action,
    });
  }

  // Track API usage
  trackApiUsage(endpoint: string, method: string, statusCode: number, responseTime: number) {
    this.trackEvent('api_usage', {
      endpoint,
      method,
      status_code: statusCode,
      response_time: responseTime,
    });
  }

  // Generic event tracking
  trackEvent(eventName: string, properties?: Record<string, any>) {
    // Vercel Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    // Sentry breadcrumb
    Sentry.addBreadcrumb({
      message: `Analytics event: ${eventName}`,
      level: 'info',
      data: properties,
    });
  }
}

// Error boundary for React components
export function withErrorBoundary<T extends React.ComponentType<any>>(
  Component: T,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return Sentry.withErrorBoundary(Component, {
    fallback: fallback || (({ error, resetError }: { error: Error; resetError: () => void }) => 
      React.createElement('div', { className: 'p-4 bg-red-50 border border-red-200 rounded-lg' },
        React.createElement('h2', { className: 'text-red-800 font-semibold' }, 'Something went wrong'),
        React.createElement('p', { className: 'text-red-600 text-sm mt-1' }, error.message),
        React.createElement('button', { 
          onClick: resetError,
          className: 'mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700'
        }, 'Try again')
      )
    ),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
    },
  });
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const monitor = PerformanceMonitor.getInstance();
  const analytics = AnalyticsManager.getInstance();
  
  return {
    trackApiCall: monitor.trackApiCall.bind(monitor),
    trackUserInteraction: monitor.trackUserInteraction.bind(monitor),
    trackPageView: monitor.trackPageView.bind(monitor),
    trackError: monitor.trackError.bind(monitor),
    trackBusinessMetric: monitor.trackBusinessMetric.bind(monitor),
    trackModalOpen: analytics.trackModalOpen.bind(analytics),
    trackModalInteraction: analytics.trackModalInteraction.bind(analytics),
    trackDashboardUsage: analytics.trackDashboardUsage.bind(analytics),
    trackOAuthEvent: analytics.trackOAuthEvent.bind(analytics),
    trackApiUsage: analytics.trackApiUsage.bind(analytics),
    trackEvent: analytics.trackEvent.bind(analytics),
  };
}

// Initialize monitoring
export function initMonitoring() {
  initSentry();
  
  // Track app initialization
  const monitor = PerformanceMonitor.getInstance();
  monitor.trackUserInteraction('app_initialized', {
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  });
}
