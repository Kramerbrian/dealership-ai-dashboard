'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function LandingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring (in production, send to error tracking service)
    if (process.env.NODE_ENV === 'development') {
      console.error('Landing page error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center p-4">
      <div
        className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
        role="alert"
        aria-live="assertive"
      >
        <AlertTriangle
          className="w-16 h-16 text-yellow-400 mx-auto mb-4"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-300 mb-6">
          We're having trouble loading the page. This has been reported to our team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            aria-label="Try again to load the page"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/20"
            aria-label="Return to homepage"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-400 mb-2">
              Error Details (Development)
            </summary>
            <div className="p-4 bg-black/20 rounded-lg text-xs font-mono text-red-300 break-all">
              <p className="mb-2">{error.message}</p>
              {error.stack && (
                <pre className="overflow-auto max-h-40 text-red-200">{error.stack}</pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

