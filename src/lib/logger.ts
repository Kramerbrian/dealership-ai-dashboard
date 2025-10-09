/**
 * Standardized Logging System
 * Provides consistent logging across the application with different levels and contexts
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  component?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context: LogContext;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel;
  private isEnabled: boolean = true;

  private constructor() {
    this.currentLevel = this.getLogLevelFromEnv();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.isEnabled && level <= this.currentLevel;
  }

  private formatMessage(level: LogLevel, message: string, context: LogContext, error?: Error): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = Object.keys(context).length > 0 ? ` [${JSON.stringify(context)}]` : '';
    const errorStr = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';
    
    return `[${timestamp}] ${levelName}: ${message}${contextStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, context: LogContext = {}, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    // Console output
    const formattedMessage = this.formatMessage(level, message, context, error);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }
  }

  private async sendToLoggingService(logEntry: LogEntry): Promise<void> {
    try {
      // In production, send to your logging service (e.g., DataDog, LogRocket, Sentry)
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Fallback to console if logging service fails
      console.error('Failed to send log to service:', error);
    }
  }

  public error(message: string, context: LogContext = {}, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  // Convenience methods for common scenarios
  public apiRequest(method: string, url: string, context: LogContext = {}): void {
    this.info(`API Request: ${method} ${url}`, {
      ...context,
      operation: 'api_request',
      metadata: { method, url },
    });
  }

  public apiResponse(method: string, url: string, status: number, duration: number, context: LogContext = {}): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${url} - ${status} (${duration}ms)`, {
      ...context,
      operation: 'api_response',
      metadata: { method, url, status, duration },
    });
  }

  public databaseQuery(query: string, duration: number, context: LogContext = {}): void {
    this.debug(`Database Query: ${query} (${duration}ms)`, {
      ...context,
      operation: 'database_query',
      metadata: { query, duration },
    });
  }

  public userAction(action: string, context: LogContext = {}): void {
    this.info(`User Action: ${action}`, {
      ...context,
      operation: 'user_action',
      metadata: { action },
    });
  }

  public performance(metric: string, value: number, context: LogContext = {}): void {
    this.debug(`Performance: ${metric} = ${value}`, {
      ...context,
      operation: 'performance',
      metadata: { metric, value },
    });
  }

  public security(event: string, context: LogContext = {}): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      operation: 'security',
      metadata: { event },
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logError = (message: string, context?: LogContext, error?: Error) => 
  logger.error(message, context, error);

export const logWarn = (message: string, context?: LogContext) => 
  logger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) => 
  logger.info(message, context);

export const logDebug = (message: string, context?: LogContext) => 
  logger.debug(message, context);

// React hook for logging
export function useLogger(component: string) {
  const createContext = (additionalContext: LogContext = {}): LogContext => ({
    component,
    ...additionalContext,
  });

  return {
    error: (message: string, context: LogContext = {}, error?: Error) =>
      logger.error(message, createContext(context), error),
    warn: (message: string, context: LogContext = {}) =>
      logger.warn(message, createContext(context)),
    info: (message: string, context: LogContext = {}) =>
      logger.info(message, createContext(context)),
    debug: (message: string, context: LogContext = {}) =>
      logger.debug(message, createContext(context)),
  };
}

// Logging decorator for methods
export function logMethod(level: LogLevel = LogLevel.DEBUG) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const startTime = Date.now();
      const context: LogContext = {
        component: target.constructor.name,
        operation: propertyName,
        metadata: { args: args.length },
      };

      logger.log(level, `Method called: ${propertyName}`, context);

      try {
        const result = method.apply(this, args);
        
        if (result instanceof Promise) {
          return result
            .then((res) => {
              const duration = Date.now() - startTime;
              logger.log(level, `Method completed: ${propertyName} (${duration}ms)`, {
                ...context,
                metadata: { ...context.metadata, duration, success: true },
              });
              return res;
            })
            .catch((error) => {
              const duration = Date.now() - startTime;
              logger.error(`Method failed: ${propertyName} (${duration}ms)`, {
                ...context,
                metadata: { ...context.metadata, duration, success: false },
              }, error);
              throw error;
            });
        } else {
          const duration = Date.now() - startTime;
          logger.log(level, `Method completed: ${propertyName} (${duration}ms)`, {
            ...context,
            metadata: { ...context.metadata, duration, success: true },
          });
          return result;
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Method failed: ${propertyName} (${duration}ms)`, {
          ...context,
          metadata: { ...context.metadata, duration, success: false },
        }, error as Error);
        throw error;
      }
    };
  };
}

// Initialize logger
if (typeof window !== 'undefined') {
  // Browser-specific initialization
  logger.enable();
} else {
  // Server-specific initialization
  logger.enable();
}
