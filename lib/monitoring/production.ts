// Production monitoring and alerting system
import { NextRequest, NextResponse } from 'next/server';

export interface MonitoringConfig {
  enableMetrics: boolean;
  enableAlerts: boolean;
  enableLogging: boolean;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
  };
}

export const defaultMonitoringConfig: MonitoringConfig = {
  enableMetrics: true,
  enableAlerts: true,
  enableLogging: true,
  alertThresholds: {
    responseTime: 1000, // 1 second
    errorRate: 5, // 5%
    cpuUsage: 80, // 80%
    memoryUsage: 85, // 85%
  }
};

export class ProductionMonitor {
  private config: MonitoringConfig;
  private metrics: Map<string, any> = new Map();

  constructor(config: MonitoringConfig = defaultMonitoringConfig) {
    this.config = config;
  }

  // Track API performance
  trackApiCall(endpoint: string, method: string, duration: number, status: number) {
    if (!this.config.enableMetrics) return;

    const key = `${method}:${endpoint}`;
    const existing = this.metrics.get(key) || {
      count: 0,
      totalDuration: 0,
      errors: 0,
      lastCall: new Date()
    };

    existing.count++;
    existing.totalDuration += duration;
    existing.lastCall = new Date();

    if (status >= 400) {
      existing.errors++;
    }

    this.metrics.set(key, existing);

    // Check for alerts
    if (this.config.enableAlerts) {
      this.checkAlerts(key, existing);
    }
  }

  // Check for performance alerts
  private checkAlerts(key: string, metrics: any) {
    const avgDuration = metrics.totalDuration / metrics.count;
    const errorRate = (metrics.errors / metrics.count) * 100;

    if (avgDuration > this.config.alertThresholds.responseTime) {
      this.sendAlert('PERFORMANCE', `High response time for ${key}: ${avgDuration}ms`);
    }

    if (errorRate > this.config.alertThresholds.errorRate) {
      this.sendAlert('ERROR_RATE', `High error rate for ${key}: ${errorRate}%`);
    }
  }

  // Send alerts (integrate with your alerting system)
  private async sendAlert(type: string, message: string) {
    console.error(`🚨 ALERT [${type}]: ${message}`);
    
    // In production, integrate with:
    // - Slack webhooks
    // - PagerDuty
    // - Email notifications
    // - SMS alerts
    
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackAlert(type, message);
    }
  }

  // Slack integration
  private async sendSlackAlert(type: string, message: string) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 DealershipAI Alert`,
          attachments: [{
            color: type === 'ERROR_RATE' ? 'danger' : 'warning',
            fields: [{
              title: 'Type',
              value: type,
              short: true
            }, {
              title: 'Message',
              value: message,
              short: false
            }, {
              title: 'Time',
              value: new Date().toISOString(),
              short: true
            }]
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  // Get current metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Health check endpoint
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: any;
    timestamp: string;
  }> {
    const metrics = this.getMetrics();
    const totalCalls = Object.values(metrics).reduce((sum: number, m: any) => sum + m.count, 0);
    const totalErrors = Object.values(metrics).reduce((sum: number, m: any) => sum + m.errors, 0);
    const errorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (errorRate > 10) {
      status = 'unhealthy';
    } else if (errorRate > 5) {
      status = 'degraded';
    }

    return {
      status,
      metrics: {
        totalCalls,
        totalErrors,
        errorRate: Math.round(errorRate * 100) / 100,
        endpoints: Object.keys(metrics).length
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Global monitoring instance
export const monitor = new ProductionMonitor();

// Middleware for automatic monitoring
export function withMonitoring(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const endpoint = url.pathname;
    const method = req.method;

    try {
      const response = await handler(req, ...args);
      const duration = Date.now() - startTime;
      
      monitor.trackApiCall(endpoint, method, duration, response.status || 200);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      monitor.trackApiCall(endpoint, method, duration, 500);
      throw error;
    }
  };
}

// System resource monitoring
export class SystemMonitor {
  private static instance: SystemMonitor;
  private metrics: any = {};

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  // Monitor system resources
  async getSystemMetrics() {
    try {
      // In a real implementation, you'd use system monitoring libraries
      // For now, we'll return mock data
      const metrics = {
        cpu: {
          usage: Math.random() * 100,
          cores: 4,
          loadAverage: [0.5, 0.3, 0.2]
        },
        memory: {
          used: Math.random() * 100,
          total: 8192, // 8GB
          free: Math.random() * 100
        },
        disk: {
          used: Math.random() * 100,
          total: 100000, // 100GB
          free: Math.random() * 100
        },
        network: {
          bytesIn: Math.random() * 1000000,
          bytesOut: Math.random() * 1000000,
          connections: Math.floor(Math.random() * 100)
        }
      };

      this.metrics = metrics;
      return metrics;
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      return this.metrics;
    }
  }

  // Check if system is healthy
  isHealthy(): boolean {
    const { cpu, memory, disk } = this.metrics;
    
    return (
      cpu.usage < 90 &&
      memory.used < 90 &&
      disk.used < 90
    );
  }
}

// Database monitoring
export class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private metrics: any = {};

  static getInstance(): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor();
    }
    return DatabaseMonitor.instance;
  }

  // Monitor database performance
  async getDatabaseMetrics() {
    try {
      // In a real implementation, you'd query your database
      // For now, we'll return mock data
      const metrics = {
        connections: {
          active: Math.floor(Math.random() * 20),
          idle: Math.floor(Math.random() * 10),
          total: 30
        },
        queries: {
          total: Math.floor(Math.random() * 1000),
          slow: Math.floor(Math.random() * 10),
          errors: Math.floor(Math.random() * 5)
        },
        performance: {
          avgResponseTime: Math.random() * 100,
          slowestQuery: Math.random() * 1000
        }
      };

      this.metrics = metrics;
      return metrics;
    } catch (error) {
      console.error('Failed to get database metrics:', error);
      return this.metrics;
    }
  }

  // Check if database is healthy
  isHealthy(): boolean {
    const { connections, queries } = this.metrics;
    
    return (
      connections.active < 25 &&
      queries.errors < 10
    );
  }
}
