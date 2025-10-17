'use client';

import { useEffect, useCallback, useRef } from 'react';

interface OnboardingEvent {
  event: string;
  stepId?: string;
  method?: 'guided' | 'agent';
  integration?: string;
  success?: boolean;
  errorType?: string;
  timeSpent?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface OnboardingMetrics {
  startTime: number;
  stepTimes: Record<string, number>;
  integrationAttempts: Record<string, { attempts: number; successes: number }>;
  errors: string[];
  completionRate: number;
}

export function useOnboardingAnalytics(method: 'guided' | 'agent' = 'guided') {
  const startTime = useRef<number>(Date.now());
  const stepStartTime = useRef<number>(Date.now());
  const metrics = useRef<OnboardingMetrics>({
    startTime: Date.now(),
    stepTimes: {},
    integrationAttempts: {},
    errors: [],
    completionRate: 0
  });

  // Track page visibility for accurate time measurement
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden, pause timing
        stepStartTime.current = Date.now();
      } else {
        // Page visible, resume timing
        stepStartTime.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const trackEvent = useCallback((eventData: Omit<OnboardingEvent, 'timestamp'>) => {
    const event: OnboardingEvent = {
      ...eventData,
      timestamp: Date.now()
    };

    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, {
        event_category: 'onboarding',
        event_label: event.stepId || event.integration,
        method: event.method,
        success: event.success,
        error_type: event.errorType,
        time_spent: event.timeSpent,
        ...event.metadata
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(error => {
      console.error('Failed to send analytics event:', error);
    });

    // Update local metrics
    updateLocalMetrics(event);
  }, []);

  const updateLocalMetrics = useCallback((event: OnboardingEvent) => {
    switch (event.event) {
      case 'step_start':
        if (event.stepId) {
          stepStartTime.current = Date.now();
        }
        break;
      
      case 'step_complete':
        if (event.stepId) {
          const timeSpent = Date.now() - stepStartTime.current;
          metrics.current.stepTimes[event.stepId] = timeSpent;
          trackEvent({
            event: 'step_time',
            stepId: event.stepId,
            method: event.method,
            timeSpent: Math.round(timeSpent / 1000)
          });
        }
        break;
      
      case 'integration_attempt':
        if (event.integration) {
          if (!metrics.current.integrationAttempts[event.integration]) {
            metrics.current.integrationAttempts[event.integration] = { attempts: 0, successes: 0 };
          }
          metrics.current.integrationAttempts[event.integration].attempts++;
          if (event.success) {
            metrics.current.integrationAttempts[event.integration].successes++;
          }
        }
        break;
      
      case 'error':
        if (event.errorType) {
          metrics.current.errors.push(event.errorType);
        }
        break;
    }
  }, [trackEvent]);

  const trackStepStart = useCallback((stepId: string) => {
    trackEvent({
      event: 'step_start',
      stepId,
      method
    });
  }, [trackEvent, method]);

  const trackStepComplete = useCallback((stepId: string, data?: any) => {
    trackEvent({
      event: 'step_complete',
      stepId,
      method,
      metadata: data
    });
  }, [trackEvent, method]);

  const trackIntegrationAttempt = useCallback((integration: string, success: boolean, errorType?: string) => {
    trackEvent({
      event: 'integration_attempt',
      integration,
      success,
      errorType
    });
  }, [trackEvent]);

  const trackIntegrationSuccess = useCallback((integration: string, data?: any) => {
    trackEvent({
      event: 'integration_success',
      integration,
      success: true,
      metadata: data
    });
  }, [trackEvent]);

  const trackIntegrationError = useCallback((integration: string, errorType: string, errorMessage?: string) => {
    trackEvent({
      event: 'integration_error',
      integration,
      success: false,
      errorType,
      metadata: { errorMessage }
    });
  }, [trackEvent]);

  const trackSkip = useCallback((stepId: string, reason?: string) => {
    trackEvent({
      event: 'step_skip',
      stepId,
      method,
      metadata: { reason }
    });
  }, [trackEvent, method]);

  const trackHelpRequest = useCallback((stepId: string, helpType: string) => {
    trackEvent({
      event: 'help_request',
      stepId,
      method,
      metadata: { helpType }
    });
  }, [trackEvent, method]);

  const trackCompletion = useCallback((integrations: string[], totalTime: number) => {
    const completionRate = integrations.length / 8; // Total possible integrations
    
    trackEvent({
      event: 'onboarding_complete',
      method,
      success: true,
      timeSpent: Math.round(totalTime / 1000),
      metadata: {
        integrations_connected: integrations.length,
        completion_rate: completionRate,
        total_integrations: integrations
      }
    });

    // Update completion rate
    metrics.current.completionRate = completionRate;
  }, [trackEvent, method]);

  const trackAbandonment = useCallback((stepId: string, reason?: string) => {
    const totalTime = Date.now() - startTime.current;
    
    trackEvent({
      event: 'onboarding_abandon',
      stepId,
      method,
      timeSpent: Math.round(totalTime / 1000),
      metadata: { reason }
    });
  }, [trackEvent, method]);

  const getMetrics = useCallback(() => {
    const totalTime = Date.now() - startTime.current;
    const avgStepTime = Object.values(metrics.current.stepTimes).reduce((a, b) => a + b, 0) / Object.keys(metrics.current.stepTimes).length;
    
    return {
      ...metrics.current,
      totalTime: Math.round(totalTime / 1000),
      avgStepTime: Math.round(avgStepTime / 1000),
      totalSteps: Object.keys(metrics.current.stepTimes).length,
      totalIntegrations: Object.keys(metrics.current.integrationAttempts).length,
      successRate: Object.values(metrics.current.integrationAttempts).reduce((acc, curr) => {
        return acc + (curr.successes / curr.attempts);
      }, 0) / Object.keys(metrics.current.integrationAttempts).length
    };
  }, []);

  // Track page unload for abandonment
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentStep = document.querySelector('[data-step-id]')?.getAttribute('data-step-id');
      if (currentStep) {
        trackAbandonment(currentStep, 'page_unload');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackAbandonment]);

  return {
    trackStepStart,
    trackStepComplete,
    trackIntegrationAttempt,
    trackIntegrationSuccess,
    trackIntegrationError,
    trackSkip,
    trackHelpRequest,
    trackCompletion,
    trackAbandonment,
    getMetrics
  };
}
