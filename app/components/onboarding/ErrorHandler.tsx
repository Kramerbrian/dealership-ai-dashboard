'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  X, 
  RefreshCw, 
  ExternalLink, 
  Copy,
  CheckCircle2,
  Info,
  AlertTriangle,
  Bug
} from 'lucide-react';

interface ErrorInfo {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoDismiss?: boolean;
  dismissAfter?: number;
}

interface ErrorHandlerProps {
  error: ErrorInfo | null;
  onDismiss?: (errorId: string) => void;
  onRetry?: (errorId: string) => void;
  onReport?: (errorId: string, details: string) => void;
}

export function ErrorHandler({ error, onDismiss, onRetry, onReport }: ErrorHandlerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsExpanded(false);
      
      if (error.autoDismiss && error.dismissAfter) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, error.dismissAfter);
        return () => clearTimeout(timer);
      }
    }
  }, [error]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (error && onDismiss) {
      onDismiss(error.id);
    }
  };

  const handleRetry = () => {
    if (error && onRetry) {
      onRetry(error.id);
    }
  };

  const handleCopyError = async () => {
    if (error) {
      const errorText = `${error.title}\n${error.message}\n${error.details || ''}`;
      try {
        await navigator.clipboard.writeText(errorText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy error:', err);
      }
    }
  };

  const handleReportError = () => {
    if (error && onReport) {
      onReport(error.id, `${error.title}: ${error.message}`);
    }
  };

  const getErrorIcon = () => {
    switch (error?.type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getErrorStyles = () => {
    switch (error?.type) {
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30';
      default:
        return 'bg-red-500/20 border-red-500/30';
    }
  };

  if (!error || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`glass rounded-xl p-4 border ${getErrorStyles()} animate-slide-in`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getErrorIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">{error.title}</h3>
              {error.dismissible && (
                <button
                  onClick={handleDismiss}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className="text-sm text-white/80 mb-3">{error.message}</p>
            
            {error.details && (
              <div className="mb-3">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-white/60 hover:text-white/80 transition-colors"
                >
                  {isExpanded ? 'Hide' : 'Show'} details
                </button>
                
                {isExpanded && (
                  <div className="mt-2 p-3 bg-black/20 rounded-lg">
                    <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono">
                      {error.details}
                    </pre>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {error.action && (
                <button
                  onClick={error.action.onClick}
                  className="px-3 py-1 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)]/30 transition-colors text-sm"
                >
                  {error.action.label}
                </button>
              )}
              
              <button
                onClick={handleRetry}
                className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              
              <button
                onClick={handleCopyError}
                className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
              
              <button
                onClick={handleReportError}
                className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-1"
              >
                <Bug className="w-3 h-3" />
                Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error; retry: () => void }> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error; retry: () => void }> }>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen bg-[var(--brand-background)] flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="glass rounded-xl p-6 border border-red-500/30 bg-red-500/10">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
                <p className="text-white/70 mb-6">
                  We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/80 text-white rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                  >
                    Refresh Page
                  </button>
                  
                  <button
                    onClick={() => window.open('mailto:support@dealershipai.com?subject=Error Report', '_blank')}
                    className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Toast Component
interface ErrorToastProps {
  error: ErrorInfo;
  onDismiss: (errorId: string) => void;
}

export function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss(error.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [error.id, onDismiss]);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getErrorStyles = () => {
    switch (error.type) {
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30';
      default:
        return 'bg-red-500/20 border-red-500/30';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`glass rounded-lg p-3 border ${getErrorStyles()} animate-slide-in`}>
      <div className="flex items-center gap-2">
        {getErrorIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{error.title}</p>
          <p className="text-xs text-white/70">{error.message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss(error.id);
          }}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Add custom CSS animations
const styles = `
  @keyframes slide-in {
    0% { transform: translateX(100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  .animate-slide-in { animation: slide-in 0.3s ease-out; }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
