/**
 * Global Error Boundary
 * Catches errors in root layout
 */

'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'global-error-boundary',
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-red-400">Critical Error</h1>
              <h2 className="text-xl font-semibold text-gray-300">
                A critical error occurred
              </h2>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
              <p className="text-gray-400">
                Something went wrong at the application level. Please refresh the page or contact support.
              </p>
              
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="bg-gray-800 border border-gray-700 rounded p-4 text-left">
                  <p className="text-xs text-red-400 font-mono mb-2">Error:</p>
                  <p className="text-xs text-gray-300 font-mono break-all">{error.message}</p>
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
