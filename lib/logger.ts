/**
 * Structured Logging Utility
 * 
 * Provides centralized logging with:
 * - JSON structured output
 * - Log levels (error, warn, info, debug)
 * - Request ID tracking
 * - Contextual metadata
 * - Integration with LogTail (when configured)
 */

// Dynamically import Logtail only in Node.js runtime (not Edge)
let Logtail: any = null;
let logtail: any = null;

// Only initialize Logtail in Node.js runtime
if (typeof process !== 'undefined' && process.env.LOGTAIL_TOKEN) {
  try {
    // Dynamic import to avoid Edge runtime issues
    if (typeof require !== 'undefined') {
      const LogtailModule = require('@logtail/node');
      Logtail = LogtailModule.Logtail || LogtailModule.default;
      if (Logtail) {
        logtail = new Logtail(process.env.LOGTAIL_TOKEN);
      }
    }
  } catch (error) {
    // Logtail not available (e.g., in Edge runtime)
    console.debug('Logtail not available in this runtime');
  }
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const baseLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: process.env.NODE_ENV || 'development',
      ...context,
    };

    // Add request ID if available
    if (typeof window !== 'undefined' && (window as any).requestId) {
      baseLog.requestId = (window as any).requestId;
    }

    return baseLog;
  }

  private async sendToLogtail(level: LogLevel, message: string, context?: LogContext) {
    if (!logtail) return;

    try {
      const formatted = this.formatMessage(level, message, context);
      
      switch (level) {
        case 'error':
          await logtail.error(message, formatted);
          break;
        case 'warn':
          await logtail.warn(message, formatted);
          break;
        case 'info':
          await logtail.info(message, formatted);
          break;
        case 'debug':
          await logtail.debug(message, formatted);
          break;
      }
    } catch (error) {
      // Fallback to console if Logtail fails
      console.error('Logtail error:', error);
      this.logToConsole(level, message, context);
    }
  }

  private logToConsole(level: LogLevel, message: string, context?: LogContext) {
    const formatted = this.formatMessage(level, message, context);
    
    // Format for console readability
    const prefix = `[${formatted.timestamp}] ${formatted.level.toUpperCase()}`;
    
    if (process.env.NODE_ENV === 'production') {
      // In production, log as JSON for log aggregation
      console.log(JSON.stringify(formatted));
    } else {
      // In development, log with better readability
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        prefix,
        message,
        context ? context : ''
      );
    }
  }

  async error(message: string, context?: LogContext | Error) {
    const logContext: LogContext = context instanceof Error 
      ? { 
          error: context.message,
          stack: context.stack,
          name: context.name,
        }
      : context || {};

    await this.sendToLogtail('error', message, logContext);
    this.logToConsole('error', message, logContext);
  }

  async warn(message: string, context?: LogContext) {
    await this.sendToLogtail('warn', message, context);
    this.logToConsole('warn', message, context);
  }

  async info(message: string, context?: LogContext) {
    await this.sendToLogtail('info', message, context);
    this.logToConsole('info', message, context);
  }

  async debug(message: string, context?: LogContext) {
    // Only log debug in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_LOGS === 'true') {
      await this.sendToLogtail('debug', message, context);
      this.logToConsole('debug', message, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions
export function logError(error: Error, context?: LogContext) {
  return logger.error(error.message, { ...context, error: error.stack });
}

export function logInfo(message: string, context?: LogContext) {
  return logger.info(message, context);
}

export function logWarn(message: string, context?: LogContext) {
  return logger.warn(message, context);
}

export function logDebug(message: string, context?: LogContext) {
  return logger.debug(message, context);
}

// Request ID helper
export function setRequestId(id: string) {
  if (typeof window !== 'undefined') {
    (window as any).requestId = id;
  }
}

export function getRequestId(): string | undefined {
  if (typeof window !== 'undefined') {
    return (window as any).requestId;
  }
  return undefined;
}

export default logger;
