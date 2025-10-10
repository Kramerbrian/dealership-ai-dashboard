/**
 * Sign-Up Page
 * Redirects to sign-in for SSO flow
 */

'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, Users, TrendingUp, Target } from 'lucide-react';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const tenant = searchParams.get('tenant') || 'default';
  const product = searchParams.get('product') || 'default';
  const callbackUrl = searchParams.get('callbackUrl') || '/onboarding';

  const handleSignUp = async () => {
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
      setError('Sign-up failed. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-trigger sign-up for seamless SSO experience
    const autoSignUp = searchParams.get('auto') === 'true';
    if (autoSignUp) {
      handleSignUp();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-blue-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Join DealershipAI</CardTitle>
          <CardDescription>
            Transform your dealership with AI-powered visibility analytics
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
              <Users className="h-4 w-4 text-green-600" />
              <span>Multi-user team management</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Predictive analytics & forecasting</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Target className="h-4 w-4 text-purple-600" />
              <span>AI-powered optimization</span>
            </div>
          </div>

          <Button
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating your account...
              </>
            ) : (
              'Get Started with DealershipAI'
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => signIn('boxyhq-saml', { tenant, product, callbackUrl: '/dashboard' })}
              className="text-blue-600 hover:underline"
            >
              Sign in here
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
