'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';
import { CheckCircle2 } from 'lucide-react';

/**
 * Onboarding Step 4: Signup
 * Clerk signup with auto-fill from previous steps
 */
export default function OnboardingStep4Page() {
  const router = useRouter();
  const url = typeof window !== 'undefined' ? sessionStorage.getItem('onboarding_url') : null;

  useEffect(() => {
    if (!url) {
      router.push('/onboard/step-1');
    }

    // Track signup start
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('onboard_signup_started', { url });
    }
  }, [router, url]);

  const handleSignupComplete = () => {
    // Track completion
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('onboard_completed', { url });
    }

    // Clear onboarding data
    sessionStorage.removeItem('onboarding_url');
    sessionStorage.removeItem('onboarding_results');

    // Redirect to dashboard with celebration
    router.push('/dashboard?onboarded=true&celebrate=true');
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= 4 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-zinc-800 text-zinc-500'
              }`}>
                {step === 4 ? '4' : step}
              </div>
              {step < 4 && (
                <div className={`w-12 h-0.5 ${
                  step < 4 ? 'bg-purple-600' : 'bg-zinc-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Free Account
          </h1>
          <p className="text-zinc-400">
            Save your analysis and track your Trust Score over time
          </p>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: CheckCircle2, text: 'Track your Trust Score over time' },
            { icon: CheckCircle2, text: 'Get alerts when competitors pass you' },
            { icon: CheckCircle2, text: 'Access AI agent for instant answers' },
          ].map(({ icon: Icon, text }, idx) => (
            <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex items-center gap-3">
              <Icon className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm text-zinc-300">{text}</span>
            </div>
          ))}
        </div>

        {/* Clerk Signup Component */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 flex justify-center">
          <SignUp
            routing="path"
            path="/onboard/step-4"
            signInUrl="/auth/signin"
            afterSignUpUrl="/dashboard?onboarded=true"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-white',
                headerSubtitle: 'text-zinc-400',
                formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90',
                formFieldInput: 'bg-zinc-900 border-zinc-700 text-white',
                formFieldLabel: 'text-zinc-300',
                footerActionLink: 'text-purple-400 hover:text-purple-300',
              },
            }}
          />
        </div>

        {/* Auto-fill hint */}
        {url && (
          <div className="mt-4 text-center text-xs text-zinc-500">
            Dealership URL: {url}
          </div>
        )}
      </div>
    </div>
  );
}
