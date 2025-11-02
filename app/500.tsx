'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function InternalServerError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <h1 className="text-9xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
            500
          </h1>
          <h2 className="text-3xl font-semibold mb-4">Internal Server Error</h2>
          <p className="text-gray-300 text-lg">
            Something went wrong on our end. We're working to fix it.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
