'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';

export default function TestOAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn('google', { 
        callbackUrl: '/test-oauth',
        redirect: false 
      });
      console.log('Sign in result:', result);
    } catch (error) {
      console.error('Sign in error:', error);
    }
    setLoading(false);
  };

  const checkSession = async () => {
    const sessionData = await getSession();
    setSession(sessionData);
    console.log('Current session:', sessionData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">OAuth Test Page</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          <button
            onClick={checkSession}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Check Session
          </button>
        </div>

        {session && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Current Session:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
