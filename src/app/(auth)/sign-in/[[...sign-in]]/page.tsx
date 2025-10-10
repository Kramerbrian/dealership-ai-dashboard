/**
 * Sign-In Page
 * Single SSO entry point for DealershipAI
 */

'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, Shield, Brain } from 'lucide-react';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const tenant = searchParams.get('tenant') || 'default';
  const product = searchParams.get('product') || 'default';
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn('boxyhq-saml', {
        tenant,
        product,
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-trigger sign-in for seamless SSO experience
    const autoSignIn = searchParams.get('auto') === 'true';
    if (autoSignIn) {
      handleSignIn();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to DealershipAI</CardTitle>
          <CardDescription>
            The ultimate AI-powered visibility engine for automotive dealerships
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Brain className="h-4 w-4 text-blue-600" />
              <span>AI-powered insights</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-purple-600" />
              <span>Real-time analytics</span>
            </div>
          </div>

          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting to DealershipAI...
              </>
            ) : (
              'Sign In to DealershipAI'
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
