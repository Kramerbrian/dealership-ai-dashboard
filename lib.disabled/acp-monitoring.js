const { supabaseAdmin } = require('./supabase');

/**
 * ACP Monitoring and Analytics
 *
 * Tracks:
 * - Checkout session performance
 * - Conversion rates
 * - Payment success/failure rates
 * - User drop-off points
 * - Error frequencies
 */

class ACPMonitor {
  constructor() {
    this.metrics = new Map();
    this.errors = [];
  }

  /**
   * Log checkout event
   */
  async logEvent(eventType, data) {
    const event = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      data: data,
      session_id: data.session_id || null,
      user_id: data.user_id || null
    };

    try {
      // Store in database
      await supabaseAdmin
        .from('acp_analytics_events')
        .insert(event);

      // Update in-memory metrics
      this.updateMetrics(eventType);

      console.log(`[ACP Event] ${eventType}:`, data);
    } catch (error) {
      console.error('Failed to log ACP event:', error);
    }
  }

  /**
   * Log error
   */
  async logError(error, context = {}) {
    const errorLog = {
      message: error.message || error,
      stack: error.stack || null,
      code: error.code || 'UNKNOWN_ERROR',
      context: context,
      timestamp: new Date().toISOString(),
      session_id: context.session_id || null,
      user_id: context.user_id || null
    };

    try {
      // Store in database
      await supabaseAdmin
        .from('acp_error_logs')
        .insert(errorLog);

      // Keep recent errors in memory for quick access
      this.errors.push(errorLog);
      if (this.errors.length > 100) {
        this.errors.shift();
      }

      console.error(`[ACP Error] ${error.message}:`, context);

      // Alert on critical errors (in production, send to monitoring service)
      if (this.isCriticalError(error)) {
        this.sendAlert(errorLog);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Track checkout funnel step
   */
  async trackFunnelStep(step, sessionId, data = {}) {
    const steps = [
      'session_created',
      'items_added',
      'shipping_entered',
      'payment_initiated',
      'payment_completed',
      'order_confirmed'
    ];

    if (!steps.includes(step)) {
      console.warn(`Unknown funnel step: ${step}`);
      return;
    }

    await this.logEvent('funnel_step', {
      step,
      session_id: sessionId,
      step_index: steps.indexOf(step),
      ...data
    });
  }

  /**
   * Track conversion
   */
  async trackConversion(sessionId, amount, currency = 'USD') {
    await this.logEvent('conversion', {
      session_id: sessionId,
      amount,
      currency,
      conversion_time: new Date().toISOString()
    });
  }

  /**
   * Track payment failure
   */
  async trackPaymentFailure(sessionId, reason, errorCode) {
    await this.logEvent('payment_failure', {
      session_id: sessionId,
      reason,
      error_code: errorCode
    });
  }

  /**
   * Track session abandonment
   */
  async trackAbandonment(sessionId, lastStep) {
    await this.logEvent('session_abandoned', {
      session_id: sessionId,
      last_step: lastStep
    });
  }

  /**
   * Update in-memory metrics
   */
  updateMetrics(eventType) {
    const count = this.metrics.get(eventType) || 0;
    this.metrics.set(eventType, count + 1);
  }

  /**
   * Get metrics summary
   */
  getMetrics() {
    return {
      events: Object.fromEntries(this.metrics),
      recent_errors: this.errors.slice(-10),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate conversion rate
   */
  async getConversionRate(startDate, endDate) {
    try {
      const { data: sessions, error: sessionsError } = await supabaseAdmin
        .from('acp_checkout_sessions')
        .select('status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (sessionsError) throw sessionsError;

      const total = sessions.length;
      const completed = sessions.filter(s => s.status === 'completed').length;

      return {
        total_sessions: total,
        completed_sessions: completed,
        conversion_rate: total > 0 ? (completed / total * 100).toFixed(2) : 0,
        period: { start: startDate, end: endDate }
      };
    } catch (error) {
      console.error('Failed to calculate conversion rate:', error);
      return null;
    }
  }

  /**
   * Get funnel analytics
   */
  async getFunnelAnalytics(startDate, endDate) {
    try {
      const { data: events, error } = await supabaseAdmin
        .from('acp_analytics_events')
        .select('event_type, data')
        .eq('event_type', 'funnel_step')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (error) throw error;

      const stepCounts = {};
      events.forEach(event => {
        const step = event.data?.step;
        if (step) {
          stepCounts[step] = (stepCounts[step] || 0) + 1;
        }
      });

      return {
        funnel: stepCounts,
        drop_off_rates: this.calculateDropOffRates(stepCounts),
        period: { start: startDate, end: endDate }
      };
    } catch (error) {
      console.error('Failed to get funnel analytics:', error);
      return null;
    }
  }

  /**
   * Calculate drop-off rates between funnel steps
   */
  calculateDropOffRates(stepCounts) {
    const steps = [
      'session_created',
      'items_added',
      'shipping_entered',
      'payment_initiated',
      'payment_completed'
    ];

    const dropOff = {};
    for (let i = 0; i < steps.length - 1; i++) {
      const currentStep = steps[i];
      const nextStep = steps[i + 1];
      const currentCount = stepCounts[currentStep] || 0;
      const nextCount = stepCounts[nextStep] || 0;

      if (currentCount > 0) {
        dropOff[`${currentStep}_to_${nextStep}`] = {
          drop_off: currentCount - nextCount,
          rate: ((1 - nextCount / currentCount) * 100).toFixed(2) + '%'
        };
      }
    }

    return dropOff;
  }

  /**
   * Check if error is critical
   */
  isCriticalError(error) {
    const criticalCodes = [
      'PAYMENT_FAILED',
      'DATABASE_ERROR',
      'STRIPE_CONNECTION_ERROR',
      'SECURITY_VIOLATION'
    ];

    return criticalCodes.includes(error.code);
  }

  /**
   * Send alert for critical errors
   */
  async sendAlert(errorLog) {
    // In production, integrate with monitoring services:
    // - Sentry
    // - DataDog
    // - PagerDuty
    // - Email alerts
    // - Slack notifications

    console.error('🚨 CRITICAL ERROR ALERT:', errorLog);

    // Example: Store critical alerts
    try {
      await supabaseAdmin
        .from('critical_alerts')
        .insert({
          type: 'acp_error',
          severity: 'critical',
          message: errorLog.message,
          data: errorLog,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store critical alert:', error);
    }
  }

  /**
   * Get error summary
   */
  async getErrorSummary(startDate, endDate) {
    try {
      const { data: errors, error } = await supabaseAdmin
        .from('acp_error_logs')
        .select('code, message')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (error) throw error;

      const errorCounts = {};
      errors.forEach(err => {
        const code = err.code || 'UNKNOWN';
        errorCounts[code] = (errorCounts[code] || 0) + 1;
      });

      return {
        total_errors: errors.length,
        errors_by_code: errorCounts,
        period: { start: startDate, end: endDate }
      };
    } catch (error) {
      console.error('Failed to get error summary:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);

    try {
      const [conversionRate, errorSummary] = await Promise.all([
        this.getConversionRate(oneHourAgo.toISOString(), now.toISOString()),
        this.getErrorSummary(oneHourAgo.toISOString(), now.toISOString())
      ]);

      const health = {
        status: 'healthy',
        timestamp: now.toISOString(),
        metrics: {
          conversion_rate: conversionRate,
          errors: errorSummary
        },
        warnings: []
      };

      // Check for issues
      if (errorSummary && errorSummary.total_errors > 50) {
        health.warnings.push('High error rate detected');
      }

      if (conversionRate && parseFloat(conversionRate.conversion_rate) < 5) {
        health.warnings.push('Low conversion rate');
      }

      if (health.warnings.length > 0) {
        health.status = 'degraded';
      }

      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: now.toISOString(),
        error: error.message
      };
    }
  }
}

// Singleton instance
const acpMonitor = new ACPMonitor();

module.exports = acpMonitor;
