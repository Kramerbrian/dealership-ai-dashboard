/**
 * Production-ready logging utility for DealershipAI
 * Handles Google API logs and other application logging
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  error?: Error;
  metadata?: Record<string, any>;
  timestamp: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // In development, log everything
    if (this.isDevelopment) return true;
    
    // In production, only log errors and warnings
    if (this.isProduction) {
      return level === LogLevel.ERROR || level === LogLevel.WARN;
    }
    
    // Default: log everything
    return true;
  }

  private log(level: LogLevel, message: string, context?: string, error?: Error, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    
    const logEntry: LogEntry = {
      level,
      message,
      context,
      error,
      metadata,
      timestamp: new Date().toISOString()
    };

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, error ? error.stack : '', metadata ? JSON.stringify(metadata) : '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, metadata ? JSON.stringify(metadata) : '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, metadata ? JSON.stringify(metadata) : '');
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage, metadata ? JSON.stringify(metadata) : '');
        break;
    }

    // In production, you might want to send logs to an external service
    if (this.isProduction && level === LogLevel.ERROR) {
      this.sendToExternalService(logEntry);
    }
  }

  private sendToExternalService(logEntry: LogEntry): void {
    // TODO: Implement external logging service (e.g., Sentry, LogRocket, etc.)
    // For now, we'll just keep it in console for production errors
  }

  // Public logging methods
  error(message: string, context?: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, undefined, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, undefined, metadata);
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, undefined, metadata);
  }

  // Google Analytics specific logging
  googleAnalytics = {
    initialized: (propertyId?: string) => {
      this.info('Google Analytics client initialized successfully', 'GA4', { propertyId });
    },
    
    usingMockData: (reason: string) => {
      this.info(`Using mock data: ${reason}`, 'GA4');
    },
    
    apiCall: (method: string, propertyId: string, duration: number) => {
      this.debug(`GA4 API call: ${method}`, 'GA4', { propertyId, duration: `${duration}ms` });
    },
    
    apiError: (method: string, propertyId: string, error: Error) => {
      this.error(`GA4 API error in ${method}`, 'GA4', error, { propertyId });
    },
    
    validationSuccess: (propertyId: string) => {
      this.info('GA4 property validation successful', 'GA4', { propertyId });
    },
    
    validationFailed: (propertyId: string, error: Error) => {
      this.error('GA4 property validation failed', 'GA4', error, { propertyId });
    }
  };
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logError = (message: string, context?: string, error?: Error, metadata?: Record<string, any>) => 
  logger.error(message, context, error, metadata);

export const logWarn = (message: string, context?: string, metadata?: Record<string, any>) => 
  logger.warn(message, context, metadata);

export const logInfo = (message: string, context?: string, metadata?: Record<string, any>) => 
  logger.info(message, context, metadata);

export const logDebug = (message: string, context?: string, metadata?: Record<string, any>) => 
  logger.debug(message, context, metadata);
