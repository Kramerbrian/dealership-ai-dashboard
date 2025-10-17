import { Logtail } from "@logtail/node";

// Initialize Logtail logger
const logtail = process.env.LOGTAIL_SOURCE_TOKEN 
  ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
  : null;

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Logger interface
interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

// Console logger fallback
class ConsoleLogger implements Logger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  debug(message: string, meta?: any): void {
    console.debug(this.formatMessage('debug', message, meta));
  }

  info(message: string, meta?: any): void {
    console.info(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }
}

// Logtail logger
class LogtailLogger implements Logger {
  debug(message: string, meta?: any): void {
    logtail?.debug(message, meta);
  }

  info(message: string, meta?: any): void {
    logtail?.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    logtail?.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    logtail?.error(message, meta);
  }
}

// Create logger instance
export const logger: Logger = logtail ? new LogtailLogger() : new ConsoleLogger();

// Specialized loggers for different components
export const dtriLogger = {
  refresh: (dealer: string, score: number, meta?: any) => {
    logger.info(`DTRI refresh completed for ${dealer}`, {
      dealer,
      score,
      component: 'dtri',
      action: 'refresh',
      ...meta
    });
  },

  error: (dealer: string, error: Error, meta?: any) => {
    logger.error(`DTRI refresh failed for ${dealer}`, {
      dealer,
      error: error.message,
      stack: error.stack,
      component: 'dtri',
      action: 'refresh',
      ...meta
    });
  },

  queue: (jobType: string, status: string, meta?: any) => {
    logger.info(`DTRI queue job ${status}`, {
      jobType,
      status,
      component: 'dtri',
      action: 'queue',
      ...meta
    });
  }
};

export const apiLogger = {
  request: (method: string, path: string, status: number, duration: number, meta?: any) => {
    logger.info(`API ${method} ${path}`, {
      method,
      path,
      status,
      duration,
      component: 'api',
      action: 'request',
      ...meta
    });
  },

  error: (method: string, path: string, error: Error, meta?: any) => {
    logger.error(`API ${method} ${path} failed`, {
      method,
      path,
      error: error.message,
      stack: error.stack,
      component: 'api',
      action: 'error',
      ...meta
    });
  }
};

export const queueLogger = {
  jobStarted: (jobId: string, jobType: string, meta?: any) => {
    logger.info(`Queue job started`, {
      jobId,
      jobType,
      component: 'queue',
      action: 'started',
      ...meta
    });
  },

  jobCompleted: (jobId: string, jobType: string, duration: number, meta?: any) => {
    logger.info(`Queue job completed`, {
      jobId,
      jobType,
      duration,
      component: 'queue',
      action: 'completed',
      ...meta
    });
  },

  jobFailed: (jobId: string, jobType: string, error: Error, meta?: any) => {
    logger.error(`Queue job failed`, {
      jobId,
      jobType,
      error: error.message,
      stack: error.stack,
      component: 'queue',
      action: 'failed',
      ...meta
    });
  }
};

// Performance logger
export const perfLogger = {
  timing: (operation: string, duration: number, meta?: any) => {
    logger.info(`Performance timing`, {
      operation,
      duration,
      component: 'performance',
      action: 'timing',
      ...meta
    });
  },

  memory: (operation: string, memoryUsage: NodeJS.MemoryUsage, meta?: any) => {
    logger.info(`Memory usage`, {
      operation,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      component: 'performance',
      action: 'memory',
      ...meta
    });
  }
};

// Business metrics logger
export const metricsLogger = {
  dtriScore: (dealer: string, score: number, trend: string, meta?: any) => {
    logger.info(`DTRI score recorded`, {
      dealer,
      score,
      trend,
      component: 'metrics',
      action: 'dtri_score',
      ...meta
    });
  },

  revenueRisk: (dealer: string, risk: number, meta?: any) => {
    logger.info(`Revenue risk calculated`, {
      dealer,
      risk,
      component: 'metrics',
      action: 'revenue_risk',
      ...meta
    });
  },

  elasticity: (dealer: string, elasticity: number, meta?: any) => {
    logger.info(`Elasticity calculated`, {
      dealer,
      elasticity,
      component: 'metrics',
      action: 'elasticity',
      ...meta
    });
  }
};

// Error tracking with context
export const errorLogger = {
  database: (operation: string, error: Error, meta?: any) => {
    logger.error(`Database error`, {
      operation,
      error: error.message,
      stack: error.stack,
      component: 'database',
      action: 'error',
      ...meta
    });
  },

  external: (service: string, operation: string, error: Error, meta?: any) => {
    logger.error(`External service error`, {
      service,
      operation,
      error: error.message,
      stack: error.stack,
      component: 'external',
      action: 'error',
      ...meta
    });
  },

  validation: (field: string, value: any, error: Error, meta?: any) => {
    logger.error(`Validation error`, {
      field,
      value,
      error: error.message,
      component: 'validation',
      action: 'error',
      ...meta
    });
  }
};

// Utility function to create structured log context
export function createLogContext(
  component: string,
  action: string,
  userId?: string,
  dealerId?: string,
  requestId?: string
) {
  return {
    component,
    action,
    userId,
    dealerId,
    requestId,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
}

// Middleware for API request logging
export function logApiRequest(req: Request, res: Response, next: Function) {
  const start = Date.now();
  const method = req.method;
  const path = new URL(req.url).pathname;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.status;
    
    apiLogger.request(method, path, status, duration, {
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    });
  });

  next();
}

export default logger;
