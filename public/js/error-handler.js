/**
 * Centralized Error Handling System
 * Provides consistent error handling and user feedback
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.errorCounts = new Map();
    this.init();
  }

  /**
   * Initialize global error handlers
   */
  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error, event.message, event.filename, event.lineno);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handlePromiseRejection(event.reason, event.promise);
    });

    console.log('✅ Error Handler initialized');
  }

  /**
   * Handle global JavaScript errors
   */
  handleGlobalError(error, message, source, lineno) {
    // Ignore browser extension errors
    if (this.isExtensionError(message, source)) {
      return;
    }

    this.logError({
      type: 'JavaScript Error',
      message: message || error?.message,
      stack: error?.stack,
      source,
      lineno,
      timestamp: new Date().toISOString()
    });

    // Show user-friendly message for critical errors
    if (!this.isMinorError(message)) {
      this.showUserError(
        'An unexpected error occurred',
        'Please refresh the page. If the problem persists, contact support.',
        'error'
      );
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  handlePromiseRejection(reason, promise) {
    const message = reason?.message || String(reason);

    // Ignore network errors from blocked requests
    if (this.isNetworkError(message)) {
      return;
    }

    this.logError({
      type: 'Unhandled Promise Rejection',
      message,
      stack: reason?.stack,
      timestamp: new Date().toISOString()
    });

    this.showUserError(
      'Operation Failed',
      'An error occurred while processing your request. Please try again.',
      'warning'
    );
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error, context = '') {
    const errorInfo = this.parseApiError(error);

    this.logError({
      type: 'API Error',
      context,
      message: errorInfo.message,
      status: errorInfo.status,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });

    this.showUserError(
      errorInfo.title,
      errorInfo.message,
      errorInfo.severity
    );

    return errorInfo;
  }

  /**
   * Parse API error into user-friendly format
   */
  parseApiError(error) {
    // Network errors
    if (!navigator.onLine) {
      return {
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        severity: 'warning',
        status: 0
      };
    }

    // HTTP status errors
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 400:
          return {
            title: 'Invalid Request',
            message: 'The request contains invalid data. Please check your input.',
            severity: 'error',
            status
          };

        case 401:
          return {
            title: 'Authentication Required',
            message: 'Your session has expired. Please sign in again.',
            severity: 'warning',
            status
          };

        case 403:
          return {
            title: 'Access Denied',
            message: 'You don\'t have permission to perform this action.',
            severity: 'error',
            status
          };

        case 404:
          return {
            title: 'Not Found',
            message: 'The requested resource could not be found.',
            severity: 'warning',
            status
          };

        case 429:
          return {
            title: 'Too Many Requests',
            message: 'Please wait a moment before trying again.',
            severity: 'warning',
            status
          };

        case 500:
        case 502:
        case 503:
          return {
            title: 'Server Error',
            message: 'Our servers are experiencing issues. Please try again later.',
            severity: 'error',
            status
          };

        default:
          return {
            title: 'Request Failed',
            message: error.message || 'An unexpected error occurred.',
            severity: 'error',
            status
          };
      }
    }

    // Generic error
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      severity: 'error',
      status: null
    };
  }

  /**
   * Handle validation errors
   */
  handleValidationError(fieldErrors) {
    const messages = Object.entries(fieldErrors).map(([field, error]) =>
      `${field}: ${error}`
    ).join('\n');

    this.showUserError(
      'Validation Error',
      messages,
      'warning'
    );
  }

  /**
   * Log error to console and storage
   */
  logError(errorInfo) {
    // Add to error log
    this.errors.push(errorInfo);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Track error counts
    const key = `${errorInfo.type}:${errorInfo.message}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);

    // Console log (can be disabled in production)
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      console.error(`[${errorInfo.type}]`, errorInfo.message, errorInfo);
    }

    // Send to monitoring service (placeholder)
    this.sendToMonitoring(errorInfo);
  }

  /**
   * Show user-friendly error message
   */
  showUserError(title, message, severity = 'error') {
    // Use existing notification system if available
    if (typeof window.showNotification === 'function') {
      window.showNotification(title, message, severity);
    } else {
      // Fallback to alert
      alert(`${title}\n\n${message}`);
    }

    // Announce to screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`${title}: ${message}`, 'assertive');
    }
  }

  /**
   * Check if error is from browser extension
   */
  isExtensionError(message, source) {
    if (!message || !source) return false;

    const extensionPatterns = [
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'extension',
      'index.DC_',
      'Access to storage is not allowed'
    ];

    return extensionPatterns.some(pattern =>
      message.includes(pattern) || source.includes(pattern)
    );
  }

  /**
   * Check if error is minor and can be ignored
   */
  isMinorError(message) {
    if (!message) return false;

    const minorPatterns = [
      'ResizeObserver',
      'Non-Error promise rejection',
      'Loading chunk'
    ];

    return minorPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Check if error is network-related
   */
  isNetworkError(message) {
    if (!message) return false;

    const networkPatterns = [
      'NetworkError',
      'Failed to fetch',
      'Network request failed',
      'ERR_INTERNET_DISCONNECTED'
    ];

    return networkPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Wrap async function with error handling
   */
  async withErrorHandling(asyncFn, context = '') {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleApiError(error, context);
      throw error; // Re-throw for caller to handle if needed
    }
  }

  /**
   * Wrap sync function with error handling
   */
  tryCatch(fn, fallback = null, context = '') {
    try {
      return fn();
    } catch (error) {
      this.logError({
        type: 'Caught Error',
        context,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      return fallback;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return {
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10),
      errorCounts: Object.fromEntries(this.errorCounts),
      mostCommonError: this.getMostCommonError()
    };
  }

  /**
   * Get most common error
   */
  getMostCommonError() {
    let maxCount = 0;
    let mostCommon = null;

    for (const [error, count] of this.errorCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = error;
      }
    }

    return mostCommon;
  }

  /**
   * Clear error log
   */
  clearErrors() {
    this.errors = [];
    this.errorCounts.clear();
  }

  /**
   * Send error to monitoring service
   */
  sendToMonitoring(errorInfo) {
    // Placeholder for error monitoring service integration
    // Could integrate with Sentry, LogRocket, etc.

    // Only send in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // Rate limit error reporting
    const key = `${errorInfo.type}:${errorInfo.message}`;
    const count = this.errorCounts.get(key) || 0;

    // Only send first occurrence and every 10th occurrence
    if (count === 1 || count % 10 === 0) {
      // TODO: Send to monitoring service
      console.log('Would send to monitoring:', errorInfo);
    }
  }

  /**
   * Export errors for debugging
   */
  exportErrors() {
    const data = JSON.stringify(this.errors, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}

// Initialize error handler
window.errorHandler = new ErrorHandler();

// Export convenience functions
window.handleApiError = (error, context) => window.errorHandler.handleApiError(error, context);
window.handleValidationError = (errors) => window.errorHandler.handleValidationError(errors);
window.withErrorHandling = (fn, context) => window.errorHandler.withErrorHandling(fn, context);
window.tryCatch = (fn, fallback, context) => window.errorHandler.tryCatch(fn, fallback, context);

console.log('✅ Error Handler initialized - Centralized error management active');
