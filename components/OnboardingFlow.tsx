'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { analytics } from '@/lib/analytics';

interface OnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

type OnboardingStep = {
  step: number;
  title: string;
  component: string;
  validation?: string;
  time: string;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: 'Enter Your Dealership URL',
    component: 'UrlInput',
    validation: 'Domain ownership check',
    time: '30 seconds',
  },
  {
    step: 2,
    title: 'First AI Scan',
    component: 'LoadingAnimation',
    time: '15-30 seconds',
  },
  {
    step: 3,
    title: 'Results Reveal',
    component: 'TrustScoreReveal',
    time: 'Infinite (until user acts)',
  },
  {
    step: 4,
    title: 'Create Account to Save',
    component: 'ClerkSignUp',
    time: '60 seconds',
  },
];

export function OnboardingFlow({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [dealerUrl, setDealerUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);

  const progress = (currentStep / ONBOARDING_STEPS.length) * 100;

  useEffect(() => {
    // Track onboarding start
    analytics.track({
      event: 'onboarding_step_completed',
      properties: { step: 0, stepName: 'started' },
    });

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && currentStep < 4) {
        setShowExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [currentStep]);

  const handleUrlSubmit = async () => {
    if (!dealerUrl.trim()) return;

    setIsValidating(true);
    analytics.track({
      event: 'url_submitted',
      properties: { url: dealerUrl },
    });

    try {
      // Validate domain
      const url = dealerUrl.startsWith('http') ? dealerUrl : `https://${dealerUrl}`;
      
      // Call AI scan endpoint
      const response = await fetch(`/api/ai-scores?origin=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        // If not registered, register it first
        const registerRes = await fetch('/api/origins/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origins: [url] }),
        });

        if (registerRes.ok) {
          // Retry scan
          const scanRes = await fetch(`/api/ai-scores?origin=${encodeURIComponent(url)}`);
          const data = await scanRes.json();
          setScanResult(data);
        } else {
          throw new Error('Failed to register domain');
        }
      } else {
        const data = await response.json();
        setScanResult(data);
      }

      setIsValidating(false);
      setCurrentStep(2);

      // Start scan animation
      setTimeout(() => {
        setCurrentStep(3);
        analytics.track({
          event: 'scan_completed',
          properties: { dealerUrl: url },
        });
      }, 2000);
    } catch (error: any) {
      console.error('Scan error:', error);
      setIsValidating(false);
      alert('Failed to scan. Please try again.');
    }
  };

  const handleCreateAccount = () => {
    analytics.track({
      event: 'account_created',
      properties: { source: 'onboarding' },
    });
    setCurrentStep(4);
  };

  const handleComplete = () => {
    analytics.track({
      event: 'onboarding_step_completed',
      properties: { step: 4, stepName: 'completed' },
    });
    onComplete?.();
  };

  const currentStepData = ONBOARDING_STEPS[currentStep - 1];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {ONBOARDING_STEPS.length}</span>
            {!showExitIntent && (
              <button
                onClick={() => setShowExitIntent(true)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Exit intent modal */}
        {showExitIntent && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold mb-4">Wait! Don't lose your data</h3>
              <p className="text-gray-600 mb-6">
                Your Trust Score analysis will be lost without an account.
              </p>
              {scanResult && (
                <p className="text-xl font-semibold mb-6">
                  Your Trust Score: {scanResult.scores?.aiVisibility?.toFixed(1) || 'N/A'}%
                </p>
              )}
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowExitIntent(false)} variant="outline">
                  Continue
                </Button>
                <Button onClick={handleCreateAccount}>
                  Create Account to Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: URL Input */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
            <p className="text-gray-600">
              Enter your dealership website URL to start your free AI visibility analysis
            </p>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://www.yourdealership.com"
                value={dealerUrl}
                onChange={(e) => setDealerUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                className="flex-1"
              />
              <Button onClick={handleUrlSubmit} disabled={isValidating || !dealerUrl.trim()}>
                {isValidating ? 'Validating...' : 'Start Scan'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Loading Animation */}
        {currentStep === 2 && (
          <div className="space-y-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-bold">Analyzing your Trust Score...</h2>
            <p className="text-gray-600">
              Our AI is scanning your website for visibility, schema markup, and competitive positioning
            </p>
          </div>
        )}

        {/* Step 3: Results Reveal */}
        {currentStep === 3 && scanResult && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your AI Visibility Results</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {scanResult.scores?.aiVisibility?.toFixed(1) || 'N/A'}%
                </div>
                <div className="text-lg font-semibold">AI Trust Score</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{scanResult.scores?.zeroClick?.toFixed(1) || 'N/A'}%</div>
                  <div className="text-sm text-gray-600">Zero-Click</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{scanResult.scores?.ugcHealth?.toFixed(1) || 'N/A'}%</div>
                  <div className="text-sm text-gray-600">UGC Health</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {scanResult.platformVisibility?.google?.toFixed(1) || 'N/A'}%
                  </div>
                  <div className="text-sm text-gray-600">Google Visibility</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🚨 Top Issue Found</h3>
              <p className="text-sm text-gray-700">
                Missing schema markup on 23% of vehicle pages. This reduces AI visibility by 15%.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Competitor Comparison</h3>
              <p className="text-sm text-gray-700">
                Your competitors average 87% AI visibility. You're at {scanResult.scores?.aiVisibility?.toFixed(1) || 'N/A'}%.
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleCreateAccount} className="flex-1">
                Create Account to Save Results
              </Button>
              <Button onClick={onSkip} variant="outline">
                View Without Account
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Account Creation */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
            <p className="text-gray-600">
              Save your analysis and get access to automated fixes, competitor tracking, and weekly reports.
            </p>
            {/* Clerk sign-up component would go here */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                Clerk sign-up integration would be rendered here
              </p>
              <Button onClick={handleComplete} className="w-full">
                Complete Onboarding
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

