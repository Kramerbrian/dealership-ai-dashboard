'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SmartPreOnboarding from '@/app/components/onboarding/SmartPreOnboarding';
import { Loader2 } from 'lucide-react';

interface SessionData {
  subscription: {
    id: string;
    plan: string;
    status: string;
    trialEnd: number;
    currentPeriodEnd: number;
  };
  dealership: {
    domain: string;
    company: string;
  };
  customer: {
    id: string;
    email: string;
  };
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const tier = searchParams.get('tier'); // 'free' for Tier 1 users

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [showPreOnboarding, setShowPreOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Stripe session data OR handle free tier
  useEffect(() => {
    if (sessionId && isLoaded) {
      // Paid tier (Tier 2/3) - fetch Stripe session
      fetchSessionData();
    } else if (isLoaded && !sessionId) {
      if (tier === 'free') {
        // Free tier (Tier 1) - skip Stripe, go straight to onboarding
        setSessionData(null); // No session data for free users
        setIsLoading(false);
      } else {
        // No session ID and not free tier - check if user already completed onboarding
        checkOnboardingStatus();
      }
    }
  }, [sessionId, tier, isLoaded]);

  const fetchSessionData = async () => {
    try {
      const res = await fetch(`/api/onboarding/session?session_id=${sessionId}`);

      if (!res.ok) {
        throw new Error('Failed to fetch session data');
      }

      const data = await res.json();
      setSessionData(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Failed to load session data');
      setIsLoading(false);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      // Check if user has already completed onboarding
      const res = await fetch('/api/onboarding/status');
      const { completed } = await res.json();

      if (completed) {
        // Already onboarded - redirect to dashboard
        router.push('/dashboard');
      } else {
        // Start onboarding without session data
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error checking status:', err);
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = () => {
    setShowPreOnboarding(false);
  };

  const handleSkipOnboarding = () => {
    router.push('/dashboard?onboarding=skipped');
  };

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pre-onboarding experience
  if (showPreOnboarding) {
    return (
      <SmartPreOnboarding
        onStart={handleStartOnboarding}
        userData={{
          name: user?.firstName || undefined,
          company: sessionData?.dealership?.company,
          plan: tier === 'free' ? 'Free' : (sessionData?.subscription?.plan || 'Professional')
        }}
      />
    );
  }

  // Main onboarding flow (to be implemented)
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Welcome to DealershipAI!</h1>
          <p className="text-white/70 mb-8">
            Let's get you set up in just a few minutes.
          </p>

          {/* Trial countdown for paid tiers only */}
          {sessionData?.subscription?.trialEnd && tier !== 'free' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-300">
                🎁 Your {sessionData.subscription.plan} trial expires in{' '}
                {Math.ceil((sessionData.subscription.trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24))}{' '}
                days
              </p>
            </div>
          )}

          {/* Free tier welcome message */}
          {tier === 'free' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-8">
              <p className="text-sm text-green-300">
                🎉 Welcome to DealershipAI! You're on the <strong>Free tier</strong> with 5 scans per month.
                <br />
                <span className="text-xs text-green-400">
                  Upgrade anytime to unlock bi-weekly checks, automated responses, and more!
                </span>
              </p>
            </div>
          )}

          {/* Quick setup form */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Quick Setup</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Your Website URL
                </label>
                <input
                  type="text"
                  defaultValue={sessionData?.dealership?.domain || ''}
                  placeholder="www.yourdealership.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue={sessionData?.dealership?.company || ''}
                  placeholder="Your Dealership Name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard?onboarded=true')}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Complete Setup
              </button>
              <button
                onClick={handleSkipOnboarding}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>

          <p className="text-sm text-white/50 mt-6">
            Don't worry, you can always complete this later from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
