/**
 * Logger Utility
 * Centralized logging for the application
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: keyof LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: LOG_LEVELS[level],
      message,
      ...(data && { data })
    };

    if (this.isDevelopment) {
      console[level.toLowerCase() as keyof Console](
        `[${timestamp}] ${level}: ${message}`,
        data ? data : ''
      );
    } else {
      // In production, you might want to send logs to a service like Logtail, Sentry, etc.
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message: string, error?: Error | any) {
    this.log('ERROR', message, error);
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.log('DEBUG', message, data);
    }
  }

  // Specialized loggers for different components
  api = {
    request: (method: string, path: string, duration?: number) => {
      this.info(`API ${method} ${path}`, { duration: duration ? `${duration}ms` : undefined });
    },
    error: (method: string, path: string, error: Error) => {
      this.error(`API ${method} ${path} failed`, error);
    },
    response: (method: string, path: string, status: number, duration: number) => {
      this.info(`API ${method} ${path} ${status}`, { duration: `${duration}ms` });
    }
  };

  database = {
    query: (query: string, duration?: number) => {
      this.debug(`DB Query: ${query}`, { duration: duration ? `${duration}ms` : undefined });
    },
    error: (operation: string, error: Error) => {
      this.error(`DB ${operation} failed`, error);
    }
  };

  auth = {
    login: (userId: string, method: string) => {
      this.info(`User login: ${userId}`, { method });
    },
    logout: (userId: string) => {
      this.info(`User logout: ${userId}`);
    },
    error: (operation: string, error: Error) => {
      this.error(`Auth ${operation} failed`, error);
    }
  };

  googleAnalytics = {
    apiCall: (endpoint: string, propertyId: string, duration: number) => {
      this.info(`GA4 API call: ${endpoint}`, { propertyId, duration: `${duration}ms` });
    },
    apiError: (method: string, propertyId: string, error: Error) => {
      this.error(`GA4 API ${method} failed for property ${propertyId}`, error);
    },
    dataProcessed: (metric: string, recordCount: number) => {
      this.info(`GA4 data processed: ${metric}`, { records: recordCount });
    }
  };

  performance = {
    slow: (operation: string, duration: number, threshold: number = 1000) => {
      if (duration > threshold) {
        this.warn(`Slow operation: ${operation}`, { duration: `${duration}ms`, threshold: `${threshold}ms` });
      }
    },
    metric: (name: string, value: number, unit: string = 'ms') => {
      this.debug(`Performance metric: ${name}`, { value: `${value}${unit}` });
    }
  };

  security = {
    rateLimitExceeded: (ip: string, endpoint: string) => {
      this.warn(`Rate limit exceeded`, { ip, endpoint });
    },
    unauthorizedAccess: (ip: string, endpoint: string, reason: string) => {
      this.warn(`Unauthorized access attempt`, { ip, endpoint, reason });
    },
    suspiciousActivity: (description: string, data: any) => {
      this.warn(`Suspicious activity: ${description}`, data);
    }
  };
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel };
export { LOG_LEVELS };