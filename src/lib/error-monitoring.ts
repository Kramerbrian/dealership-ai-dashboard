/**
 * Error Monitoring and Alerting System for DealershipAI
 * Comprehensive error tracking, alerting, and performance monitoring
 */

import { VercelDiagnostics } from './vercel-diagnostics';

export interface ErrorAlert {
  id: string;
  timestamp: Date;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  message: string;
  context: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface MonitoringConfig {
  errorThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  performanceThresholds: {
    warning: number; // ms
    critical: number; // ms
  };
  alertChannels: {
    email?: string[];
    slack?: string;
    webhook?: string;
  };
  retentionDays: number;
}

export class ErrorMonitoring {
  private static instance: ErrorMonitoring;
  private alerts: Map<string, ErrorAlert> = new Map();
  private metrics: PerformanceMetric[] = [];
  private config: MonitoringConfig;
  private errorCounts: Map<string, number> = new Map();
  private lastAlertTime: Map<string, Date> = new Map();

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  static getInstance(config?: MonitoringConfig): ErrorMonitoring {
    if (!ErrorMonitoring.instance) {
      if (!config) {
        throw new Error('Monitoring config required for first initialization');
      }
      ErrorMonitoring.instance = new ErrorMonitoring(config);
    }
    return ErrorMonitoring.instance;
  }

  /**
   * Track an error with context
   */
  async trackError(
    error: Error,
    context: {
      userId?: string;
      tenantId?: string;
      operation?: string;
      requestId?: string;
      severity?: 'Low' | 'Medium' | 'High' | 'Critical';
      category?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const errorKey = `${error.name}:${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    const severity = context.severity || this.determineSeverity(error, count);
    const category = context.category || this.categorizeError(error);

    const alert: ErrorAlert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      severity,
      category,
      message: error.message,
      context: {
        ...context,
        errorName: error.name,
        stack: error.stack,
        count: count + 1
      },
      resolved: false
    };

    this.alerts.set(alert.id, alert);

    // Log the error
    VercelDiagnostics.logError(error, context);

    // Check if we should send an alert
    await this.checkAndSendAlert(alert, count + 1);

    // Store in persistent storage (in production, this would be a database)
    await this.persistAlert(alert);
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(
    operation: string,
    duration: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      success,
      error,
      metadata
    };

    this.metrics.push(metric);

    // Check for performance issues
    if (duration > this.config.performanceThresholds.critical) {
      await this.trackError(
        new Error(`Critical performance issue: ${operation} took ${duration}ms`),
        {
          operation,
          severity: 'Critical',
          category: 'Performance',
          metadata: { ...metadata, duration }
        }
      );
    } else if (duration > this.config.performanceThresholds.warning) {
      await this.trackError(
        new Error(`Performance warning: ${operation} took ${duration}ms`),
        {
          operation,
          severity: 'Medium',
          category: 'Performance',
          metadata: { ...metadata, duration }
        }
      );
    }

    // Clean up old metrics
    this.cleanupMetrics();
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeframe: 'hour' | 'day' | 'week' = 'day'): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    topErrors: Array<{ error: string; count: number }>;
  } {
    const cutoff = this.getTimeframeCutoff(timeframe);
    const recentAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.timestamp >= cutoff);

    const bySeverity = recentAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = recentAlerts.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrors = Array.from(this.errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: recentAlerts.length,
      bySeverity,
      byCategory,
      topErrors
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(timeframe: 'hour' | 'day' | 'week' = 'day'): {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    slowOperations: Array<{ operation: string; avgDuration: number; count: number }>;
  } {
    const cutoff = this.getTimeframeCutoff(timeframe);
    const recentMetrics = this.metrics.filter(metric => metric.timestamp >= cutoff);

    const totalOperations = recentMetrics.length;
    const averageDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
    const successRate = recentMetrics.filter(m => m.success).length / totalOperations;

    const operationStats = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = { totalDuration: 0, count: 0 };
      }
      acc[metric.operation].totalDuration += metric.duration;
      acc[metric.operation].count += 1;
      return acc;
    }, {} as Record<string, { totalDuration: number; count: number }>);

    const slowOperations = Object.entries(operationStats)
      .map(([operation, stats]) => ({
        operation,
        avgDuration: stats.totalDuration / stats.count,
        count: stats.count
      }))
      .filter(op => op.avgDuration > this.config.performanceThresholds.warning)
      .sort((a, b) => b.avgDuration - a.avgDuration);

    return {
      totalOperations,
      averageDuration,
      successRate,
      slowOperations
    };
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolution?: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();
    if (resolution) {
      alert.context.resolution = resolution;
    }

    await this.persistAlert(alert);
    return true;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): ErrorAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate monitoring dashboard data
   */
  async getDashboardData(): Promise<{
    health: any;
    errorStats: any;
    performanceStats: any;
    activeAlerts: ErrorAlert[];
    recentErrors: ErrorAlert[];
  }> {
    const [health, errorStats, performanceStats] = await Promise.all([
      VercelDiagnostics.performHealthCheck(),
      this.getErrorStats(),
      this.getPerformanceStats()
    ]);

    const activeAlerts = this.getActiveAlerts();
    const recentErrors = Array.from(this.alerts.values())
      .filter(alert => alert.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    return {
      health,
      errorStats,
      performanceStats,
      activeAlerts,
      recentErrors
    };
  }

  /**
   * Private helper methods
   */
  private determineSeverity(error: Error, count: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (count >= this.config.errorThresholds.critical) return 'Critical';
    if (count >= this.config.errorThresholds.high) return 'High';
    if (count >= this.config.errorThresholds.medium) return 'Medium';
    return 'Low';
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) return 'Timeout';
    if (message.includes('connection')) return 'Connection';
    if (message.includes('permission') || message.includes('unauthorized')) return 'Authorization';
    if (message.includes('not found')) return 'NotFound';
    if (message.includes('validation')) return 'Validation';
    if (message.includes('database') || message.includes('sql')) return 'Database';
    if (message.includes('cache')) return 'Cache';
    if (message.includes('api') || message.includes('http')) return 'API';
    
    return 'General';
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async checkAndSendAlert(alert: ErrorAlert, count: number): Promise<void> {
    const alertKey = `${alert.category}:${alert.message}`;
    const lastAlert = this.lastAlertTime.get(alertKey);
    const now = new Date();

    // Don't spam alerts - respect cooldown periods
    const cooldownMinutes = {
      'Critical': 5,
      'High': 15,
      'Medium': 60,
      'Low': 240
    };

    if (lastAlert && (now.getTime() - lastAlert.getTime()) < cooldownMinutes[alert.severity] * 60 * 1000) {
      return;
    }

    // Only send alerts for significant error counts
    const shouldAlert = count >= this.config.errorThresholds[alert.severity.toLowerCase() as keyof typeof this.config.errorThresholds];
    
    if (shouldAlert) {
      await this.sendAlert(alert, count);
      this.lastAlertTime.set(alertKey, now);
    }
  }

  private async sendAlert(alert: ErrorAlert, count: number): Promise<void> {
    const alertMessage = {
      title: `DealershipAI ${alert.severity} Alert`,
      message: `${alert.category}: ${alert.message}`,
      count,
      timestamp: alert.timestamp.toISOString(),
      context: alert.context
    };

    // Send to configured channels
    if (this.config.alertChannels.email) {
      await this.sendEmailAlert(alertMessage);
    }

    if (this.config.alertChannels.slack) {
      await this.sendSlackAlert(alertMessage);
    }

    if (this.config.alertChannels.webhook) {
      await this.sendWebhookAlert(alertMessage);
    }

    console.error('ALERT SENT:', alertMessage);
  }

  private async sendEmailAlert(alert: any): Promise<void> {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Email alert would be sent:', alert);
  }

  private async sendSlackAlert(alert: any): Promise<void> {
    // In production, integrate with Slack webhook
    console.log('Slack alert would be sent:', alert);
  }

  private async sendWebhookAlert(alert: any): Promise<void> {
    try {
      await fetch(this.config.alertChannels.webhook!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private async persistAlert(alert: ErrorAlert): Promise<void> {
    // In production, store in database
    // For now, we'll just log it
    console.log('Alert persisted:', alert.id);
  }

  private getTimeframeCutoff(timeframe: 'hour' | 'day' | 'week'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private cleanupMetrics(): void {
    const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoff);
  }
}

/**
 * Performance monitoring decorator
 */
export function monitorPerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const monitoring = ErrorMonitoring.getInstance();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        
        await monitoring.trackPerformance(operation, duration, true);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        await monitoring.trackPerformance(operation, duration, false, error.message);
        throw error;
      }
    };
  };
}

/**
 * Error tracking decorator
 */
export function trackErrors(category: string, severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitoring = ErrorMonitoring.getInstance();
      
      try {
        return await method.apply(this, args);
      } catch (error) {
        await monitoring.trackError(error, {
          operation: propertyName,
          category,
          severity
        });
        throw error;
      }
    };
  };
}
