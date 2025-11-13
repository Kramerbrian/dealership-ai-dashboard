'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DriveError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Drive page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4">
      <div
        className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
        role="alert"
        aria-live="assertive"
      >
        <AlertTriangle
          className="w-16 h-16 text-yellow-400 mx-auto mb-4"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold mb-4">Unable to Load Drive Dashboard</h1>
        <p className="text-gray-300 mb-6">
          We encountered an error loading your pulse cards. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-white text-black hover:bg-white/90 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            aria-label="Try again to load the drive dashboard"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/20"
            aria-label="Go to dashboard"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

