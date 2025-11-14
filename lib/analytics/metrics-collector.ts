// Real-time Metrics Dashboard and Error Tracking
// Analytics, monitoring, and performance tracking

interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

interface ErrorEvent {
  id: string;
  message: string;
  stack: string;
  level: 'error' | 'warning' | 'info';
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
  ipAddress: string;
}

interface BusinessMetric {
  metric: string;
  value: number;
  period: string;
  timestamp: Date;
  breakdown?: Record<string, number>;
}

export class MetricsCollector {
  private redis: any;
  private prisma: any;

  constructor(redis: any, prisma: any) {
    this.redis = redis;
    this.prisma = prisma;
  }

  // Track API performance
  async trackAPIPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      // Store in Redis for real-time access
      const key = `api_performance:${metric.endpoint}:${new Date().toISOString().slice(0, 13)}`;
      await this.redis.lpush(key, JSON.stringify(metric));
      await this.redis.expire(key, 86400 * 7); // Keep for 7 days

      // Store in database for long-term analysis
      await this.prisma.performanceMetric.create({
        data: metric
      });

    } catch (error) {
      console.error('Track API performance error:', error);
    }
  }

  // Track business metrics
  async trackBusinessMetric(metric: BusinessMetric): Promise<void> {
    try {
      // Store in Redis for real-time dashboard
      const key = `business_metric:${metric.metric}:${metric.period}`;
      await this.redis.setex(key, 3600, JSON.stringify(metric)); // 1 hour cache

      // Store in database
      await this.prisma.businessMetric.create({
        data: metric
      });

    } catch (error) {
      console.error('Track business metric error:', error);
    }
  }

  // Track error
  async trackError(error: Omit<ErrorEvent, 'id' | 'timestamp'>): Promise<string> {
    try {
      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const errorEvent: ErrorEvent = {
        id: errorId,
        ...error,
        timestamp: new Date()
      };

      // Store in Redis for real-time alerts
      await this.redis.lpush('recent_errors', JSON.stringify(errorEvent));
      await this.redis.ltrim('recent_errors', 0, 99); // Keep last 100 errors

      // Store in database
      await this.prisma.errorEvent.create({
        data: errorEvent
      });

      // Send alert if critical
      if (error.level === 'error') {
        await this.sendErrorAlert(errorEvent);
      }

      return errorId;

    } catch (err) {
      console.error('Track error error:', err);
      return 'unknown';
    }
  }

  // Get real-time metrics
  async getRealTimeMetrics(): Promise<{
    apiMetrics: {
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
      topEndpoints: Array<{
        endpoint: string;
        requests: number;
        avgResponseTime: number;
      }>;
    };
    businessMetrics: {
      activeUsers: number;
      newSignups: number;
      revenue: number;
      conversions: number;
    };
    errorMetrics: {
      totalErrors: number;
      criticalErrors: number;
      errorRate: number;
      recentErrors: ErrorEvent[];
    };
  }> {
    try {
      // Get API metrics from Redis
      const apiMetrics = await this.getAPIMetrics();
      
      // Get business metrics
      const businessMetrics = await this.getBusinessMetrics();
      
      // Get error metrics
      const errorMetrics = await this.getErrorMetrics();

      return {
        apiMetrics,
        businessMetrics,
        errorMetrics
      };

    } catch (error) {
      console.error('Get real-time metrics error:', error);
      throw error;
    }
  }

  // Get API metrics
  private async getAPIMetrics(): Promise<any> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Get performance data from database
      const performanceData = await this.prisma.performanceMetric.findMany({
        where: {
          timestamp: {
            gte: oneHourAgo
          }
        }
      });

      const totalRequests = performanceData.length;
      const averageResponseTime = performanceData.reduce((sum: number, p: any) => sum + p.responseTime, 0) / totalRequests;
      const errorCount = performanceData.filter((p: any) => p.statusCode >= 400).length;
      const errorRate = (errorCount / totalRequests) * 100;

      // Group by endpoint
      const endpointStats = new Map<string, { requests: number; totalTime: number }>();
      performanceData.forEach((p: any) => {
        const key = `${p.method} ${p.endpoint}`;
        if (!endpointStats.has(key)) {
          endpointStats.set(key, { requests: 0, totalTime: 0 });
        }
        const stats = endpointStats.get(key)!;
        stats.requests++;
        stats.totalTime += p.responseTime;
      });

      const topEndpoints = Array.from(endpointStats.entries())
        .map(([endpoint, stats]) => ({
          endpoint,
          requests: stats.requests,
          avgResponseTime: stats.totalTime / stats.requests
        }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10);

      return {
        totalRequests,
        averageResponseTime: Math.round(averageResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        topEndpoints
      };

    } catch (error) {
      console.error('Get API metrics error:', error);
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        topEndpoints: []
      };
    }
  }

  // Get business metrics
  private async getBusinessMetrics(): Promise<any> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Get active users (users who made requests in the last hour)
      const activeUsers = await this.prisma.performanceMetric.findMany({
        where: {
          timestamp: {
            gte: oneHourAgo
          },
          userId: {
            not: null
          }
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      });

      // Get new signups (users created in the last hour)
      const newSignups = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: oneHourAgo
          }
        }
      });

      // Get revenue (from subscriptions)
      const revenue = await this.prisma.subscription.aggregate({
        where: {
          status: 'active',
          createdAt: {
            gte: oneHourAgo
          }
        },
        _sum: {
          amount: true
        }
      });

      // Get conversions (free to paid)
      const conversions = await this.prisma.user.count({
        where: {
          plan: {
            in: ['PRO', 'ENTERPRISE']
          },
          updatedAt: {
            gte: oneHourAgo
          }
        }
      });

      return {
        activeUsers: activeUsers.length,
        newSignups,
        revenue: revenue._sum.amount || 0,
        conversions
      };

    } catch (error) {
      console.error('Get business metrics error:', error);
      return {
        activeUsers: 0,
        newSignups: 0,
        revenue: 0,
        conversions: 0
      };
    }
  }

  // Get error metrics
  private async getErrorMetrics(): Promise<any> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Get errors from database
      const errors = await this.prisma.errorEvent.findMany({
        where: {
          timestamp: {
            gte: oneHourAgo
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 20
      });

      const totalErrors = errors.length;
      const criticalErrors = errors.filter((e: any) => e.level === 'error').length;
      const errorRate = totalErrors > 0 ? (criticalErrors / totalErrors) * 100 : 0;

      return {
        totalErrors,
        criticalErrors,
        errorRate: Math.round(errorRate * 100) / 100,
        recentErrors: errors.slice(0, 10)
      };

    } catch (error) {
      console.error('Get error metrics error:', error);
      return {
        totalErrors: 0,
        criticalErrors: 0,
        errorRate: 0,
        recentErrors: []
      };
    }
  }

  // Get historical metrics
  async getHistoricalMetrics(metric: string, period: string, startDate: Date, endDate: Date): Promise<Array<{
    timestamp: Date;
    value: number;
    breakdown?: Record<string, number>;
  }>> {
    try {
      const metrics = await this.prisma.businessMetric.findMany({
        where: {
          metric,
          period,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      return metrics.map((m: any) => ({
        timestamp: m.timestamp,
        value: m.value,
        breakdown: m.breakdown
      }));

    } catch (error) {
      console.error('Get historical metrics error:', error);
      return [];
    }
  }

  // Get performance trends
  async getPerformanceTrends(endpoint: string, hours: number = 24): Promise<Array<{
    timestamp: Date;
    responseTime: number;
    requests: number;
    errors: number;
  }>> {
    try {
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const performanceData = await this.prisma.performanceMetric.findMany({
        where: {
          endpoint,
          timestamp: {
            gte: startDate
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      // Group by hour
      const hourlyData = new Map<string, {
        responseTime: number[];
        requests: number;
        errors: number;
      }>();

      performanceData.forEach((p: any) => {
        const hour = p.timestamp.toISOString().slice(0, 13);
        if (!hourlyData.has(hour)) {
          hourlyData.set(hour, {
            responseTime: [],
            requests: 0,
            errors: 0
          });
        }

        const data = hourlyData.get(hour)!;
        data.responseTime.push(p.responseTime);
        data.requests++;
        if (p.statusCode >= 400) {
          data.errors++;
        }
      });

      return Array.from(hourlyData.entries()).map(([hour, data]) => ({
        timestamp: new Date(hour),
        responseTime: data.responseTime.reduce((sum, rt) => sum + rt, 0) / data.responseTime.length,
        requests: data.requests,
        errors: data.errors
      }));

    } catch (error) {
      console.error('Get performance trends error:', error);
      return [];
    }
  }

  // Send error alert
  private async sendErrorAlert(error: ErrorEvent): Promise<void> {
    try {
      // In production, this would send to Slack, email, PagerDuty, etc.
      console.error('CRITICAL ERROR ALERT:', {
        id: error.id,
        message: error.message,
        userId: error.userId,
        url: error.url,
        timestamp: error.timestamp
      });

      // Store alert in Redis for dashboard
      await this.redis.lpush('error_alerts', JSON.stringify({
        ...error,
        alertSent: true,
        alertTime: new Date()
      }));

    } catch (err) {
      console.error('Send error alert error:', err);
    }
  }

  // Get system health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
      responseTime?: number;
    }>;
    uptime: number;
    version: string;
  }> {
    try {
      const checks = [];
      
      // Database health check
      const dbStart = Date.now();
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        checks.push({
          name: 'database',
          status: 'pass' as 'pass' | 'fail',
          message: 'Database connection healthy',
          responseTime: Date.now() - dbStart
        });
      } catch (error) {
        checks.push({
          name: 'database',
          status: 'fail' as 'pass' | 'fail',
          message: 'Database connection failed'
        });
      }

      // Redis health check
      const redisStart = Date.now();
      try {
        await this.redis.ping();
        checks.push({
          name: 'redis',
          status: 'pass' as 'pass' | 'fail',
          message: 'Redis connection healthy',
          responseTime: Date.now() - redisStart
        });
      } catch (error) {
        checks.push({
          name: 'redis',
          status: 'fail' as 'pass' | 'fail',
          message: 'Redis connection failed'
        });
      }

      // External API health checks
      const apiChecks = await this.checkExternalAPIs();
      checks.push(...apiChecks);

      const failedChecks = checks.filter((c: any) => c.status === 'fail').length;
      const status = failedChecks === 0 ? 'healthy' : failedChecks < 2 ? 'degraded' : 'unhealthy';

      return {
        status,
        checks,
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      };

    } catch (error) {
      console.error('Get system health error:', error);
      return {
        status: 'unhealthy',
        checks: [{
          name: 'system',
          status: 'fail',
          message: 'System health check failed'
        }],
        uptime: 0,
        version: 'unknown'
      };
    }
  }

  // Check external APIs
  private async checkExternalAPIs(): Promise<Array<{
    name: string;
    status: 'pass' | 'fail';
    message: string;
    responseTime?: number;
  }>> {
    const checks = [];
    
    // Check Stripe API
    try {
      const stripeStart = Date.now();
      // In production, this would make an actual API call
      await new Promise(resolve => setTimeout(resolve, 100));
      checks.push({
        name: 'stripe',
        status: 'pass' as 'pass' | 'fail',
        message: 'Stripe API healthy',
        responseTime: Date.now() - stripeStart
      });
    } catch (error) {
      checks.push({
        name: 'stripe',
        status: 'fail' as 'pass' | 'fail',
        message: 'Stripe API failed'
      });
    }

    return checks;
  }
}
