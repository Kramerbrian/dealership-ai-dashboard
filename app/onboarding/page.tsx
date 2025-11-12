'use client';
import React, { useState, useEffect } from 'react';
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ShareUnlockModal from '@/components/share/ShareUnlockModal';
import { CheckCircle, ArrowRight, Lock, Share2, Loader2 } from 'lucide-react';

// Telemetry helper
const track = async (type: string, payload: any = {}) => {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, payload, ts: Date.now() })
    });
  } catch (e) {
    console.warn('telemetry failed', e);
  }
};

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  required?: boolean;
  locked?: boolean;
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [domain, setDomain] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [role, setRole] = useState('GM');
  const [shareOpen, setShareOpen] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Track page view
  useEffect(() => {
    if (isLoaded) {
      track('onboarding_page_view', {
        userId: user?.id,
        dealerId: user?.publicMetadata?.dealerId,
        step: currentStep
      });
    }
  }, [isLoaded, user, currentStep]);

  // Redirect if not signed in
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to continue with onboarding.</p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const steps: Step[] = [
    {
      id: 'welcome',
      title: 'Welcome to DealershipAI',
      description: 'Let\'s get you set up in just a few steps.',
      component: (
        <div className="space-y-4">
          <p className="text-gray-600">We'll help you configure your dealership profile and start tracking your AI visibility.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>What you'll set up:</strong>
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Your dealership domain</li>
              <li>• Your role and preferences</li>
              <li>• Initial AI visibility scan</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'domain',
      title: 'Your Dealership Domain',
      description: 'Enter your dealership website domain.',
      required: true,
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Website Domain
            </label>
            <input
              type="text"
              placeholder="naplesautogroup.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-xs text-gray-500">Enter your domain without http:// or https://</p>
          </div>
        </div>
      )
    },
    {
      id: 'dealer',
      title: 'Dealership Information',
      description: 'Tell us about your dealership.',
      required: true,
      component: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dealership Name
            </label>
            <input
              type="text"
              placeholder="Naples Auto Group"
              value={dealerName}
              onChange={(e) => setDealerName(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GM">General Manager</option>
              <option value="Owner">Owner</option>
              <option value="Marketing">Marketing Director</option>
              <option value="Digital">Digital Manager</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      )
    },
    {
      id: 'analyze',
      title: 'Initial AI Visibility Scan',
      description: 'Let\'s check your current AI visibility.',
      required: true,
      component: (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Analyzing {domain}...</p>
            </div>
          ) : completed.includes('analyze') ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Analysis Complete</span>
              </div>
              <p className="mt-2 text-sm text-green-700">Your initial AI visibility scan is complete. View results in your dashboard.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">We'll analyze your dealership's visibility across 5 AI platforms.</p>
              <button
                onClick={handleAnalyze}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Run Analysis
              </button>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Your onboarding is complete.',
      component: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Welcome to DealershipAI!</h3>
            <p className="text-gray-700">Your dashboard is ready. Start tracking your AI visibility and revenue impact.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="px-4 py-3 border rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      )
    }
  ];

  async function handleAnalyze() {
    if (!domain) {
      alert('Please enter your domain first');
      return;
    }

    setLoading(true);
    track('onboarding_analyze_start', { domain, userId: user?.id });

    try {
      const res = await fetch(`/api/analyze?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();

      if (res.ok) {
        setCompleted([...completed, 'analyze']);
        track('onboarding_analyze_complete', { domain, userId: user?.id, result: data });
        
        // Save to user metadata (optional)
        // You can call /api/save-metrics here if needed
      } else {
        alert(data.error || 'Analysis failed');
        track('onboarding_analyze_error', { domain, userId: user?.id, error: data.error });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze. Please try again.');
      track('onboarding_analyze_error', { domain, userId: user?.id, error: String(error) });
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    const step = steps[currentStep];
    
    // Validate required fields
    if (step.required) {
      if (step.id === 'domain' && !domain.trim()) {
        alert('Please enter your domain');
        return;
      }
      if (step.id === 'dealer' && !dealerName.trim()) {
        alert('Please enter your dealership name');
        return;
      }
    }

    // Track step completion
    track('onboarding_step_complete', {
      step: step.id,
      userId: user?.id,
      domain,
      dealerName
    });

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      track('onboarding_complete', {
        userId: user?.id,
        domain,
        dealerName,
        role
      });
      router.push('/dashboard');
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">{step.title}</h1>
          <p className="text-gray-600 mb-6">{step.description}</p>

          {step.component}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-blue-600 w-8'
                  : idx < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <ShareUnlockModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        featureName="Onboarding Complete"
      />
    </div>
  );
}

