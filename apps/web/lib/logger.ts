/**
 * Production Logging System
 * Structured logging for production environment
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private enableConsole: boolean;
  private enableFile: boolean;

  private constructor() {
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    this.logLevel = LogLevel[envLogLevel as keyof typeof LogLevel] || LogLevel.INFO;
    this.enableConsole = process.env.ENABLE_CONSOLE_LOGGING !== 'false';
    this.enableFile = process.env.ENABLE_FILE_LOGGING === 'true';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const contextStr = entry.context ? JSON.stringify(entry.context) : '';
    const errorStr = entry.error
      ? `\nError: ${entry.error.name}: ${entry.error.message}`
      : '';

    return `[${timestamp}] [${levelName}] ${entry.message} ${contextStr}${errorStr}`;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formatted = this.formatMessage(entry);

    if (this.enableConsole) {
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
          console.error(formatted);
          break;
      }
    }

    if (this.enableFile) {
      // In production, this would write to a log file or log aggregation service
      // For now, we'll use console which will be captured by the hosting platform
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.writeLog({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  info(message: string, context?: Record<string, any>): void {
    this.writeLog({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.writeLog({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.writeLog({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
