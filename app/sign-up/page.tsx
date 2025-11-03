'use client';

// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get WorkOS client ID from environment
    const id = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || '';
    setClientId(id);
    setIsLoading(false);
  }, []);

  const handleSignUp = () => {
    if (!clientId) {
      console.error('WorkOS Client ID not configured');
      return;
    }

    // Redirect to WorkOS sign-up
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const signUpUrl = `https://api.workos.com/sso/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&action=signup`;
    
    window.location.href = signUpUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join DealershipAI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your free trial and transform your dealership with AI
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center">Loading...</div>}>
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-8">
            <button
              onClick={handleSignUp}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign up with WorkOS
            </button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/sign-in" className="font-medium text-blue-600 hover:text-blue-700">
                Sign in
              </a>
            </p>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
