'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Enhanced Error Boundary
 * 
 * Catches React component errors and provides recovery options
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error (client-side only)
    if (typeof window !== 'undefined') {
      // Send to logging service
      const errorData = {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
        timestamp: new Date().toISOString(),
      };

      // Try to send to error tracking
      if (typeof fetch !== 'undefined') {
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorData),
        }).catch(() => {
          // Silently fail if error reporting fails
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error Boundary caught error:', error, errorInfo);
      }
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    if (this.state.retryCount >= this.maxRetries) {
      // Max retries reached, reload page
      window.location.reload();
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Page-level error (full screen)
      if (this.props.level === 'page') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                    Error details (development only)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={this.handleReset}
                  disabled={this.state.retryCount >= this.maxRetries}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    this.state.retryCount >= this.maxRetries
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {this.state.retryCount >= this.maxRetries ? 'Max retries' : `Try again (${this.state.retryCount + 1}/${this.maxRetries})`}
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Refresh page
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Component-level error (inline)
      return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 my-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Component Error
              </h3>
              <p className="mt-1 text-sm text-red-700">
                This component encountered an error. Please try refreshing or contact support if the problem persists.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={this.handleReset}
                  className="text-sm text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <details className="inline-block">
                    <summary className="text-sm text-red-800 cursor-pointer">
                      Details
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {this.state.error?.toString()}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  level: 'page' | 'component' = 'component'
) {
  return function WrappedComponent(props: P) {
    return (
      <EnhancedErrorBoundary level={level}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    );
  };
}

