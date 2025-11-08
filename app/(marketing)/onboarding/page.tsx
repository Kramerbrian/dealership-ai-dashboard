'use client';

import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { validateUrlClient } from '@/lib/utils/url-validation-client';
import { 
  CheckCircle2, 
  Globe, 
  MapPin, 
  BarChart3, 
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    websiteUrl: '',
    googleBusinessProfile: '',
    googleAnalytics: false,
  });
  const [urlError, setUrlError] = useState<string | null>(null);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to DealershipAI',
      description: 'Let\'s get your AI visibility tracking set up in just a few minutes',
      component: 'welcome'
    },
    {
      id: 'website',
      title: 'Connect Your Website',
      description: 'Add your dealership website URL for AI visibility tracking',
      component: 'website',
      required: true
    },
    {
      id: 'google-business',
      title: 'Google Business Profile',
      description: 'Connect your Google Business Profile for local AI search tracking',
      component: 'google-business',
      required: false
    },
    {
      id: 'analytics',
      title: 'Google Analytics (Optional)',
      description: 'Connect GA4 for 87% more accurate traffic insights',
      component: 'analytics',
      required: false
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Your AI visibility tracking is now active',
      component: 'complete'
    }
  ];

  useEffect(() => {
    if (isLoaded && !user) {
      // User should be signed in to access onboarding
      return;
    }
  }, [isLoaded, user]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    // Mark onboarding as complete in localStorage (for immediate client-side checks)
    localStorage.setItem('onboarding_complete', 'true');
    
    // Save to user metadata in Clerk with form data
    try {
      const response = await fetch('/api/user/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          googleBusinessProfile: formData.googleBusinessProfile,
          googleAnalytics: formData.googleAnalytics,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save onboarding status');
      }
      
      const result = await response.json();
      
      // Update localStorage with saved metadata for immediate access
      if (result.metadata) {
        localStorage.setItem('user_metadata', JSON.stringify(result.metadata));
      }
    } catch (error: any) {
      // Non-blocking: localStorage is set, so onboarding flow continues
      console.warn('Failed to save onboarding status to server:', error);
      // Still redirect to dashboard - localStorage will handle client-side checks
    }
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(new Set([...completedSteps, stepId]));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.component) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900">
              Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We'll help you set up AI visibility tracking for your dealership in just a few minutes.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-left bg-blue-50 p-4 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">87% More Accurate Data</div>
                  <div className="text-sm text-gray-600">Connected platforms provide real-time insights</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left bg-purple-50 p-4 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Track AI Search Visibility</div>
                  <div className="text-sm text-gray-600">Monitor ChatGPT, Claude, Gemini, and Perplexity</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'website':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Website URL</h3>
                <p className="text-sm text-gray-600">Required for core AI visibility tracking</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Dealership Website
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, websiteUrl: value });
                  if (value) {
                    const validation = validateUrlClient(value);
                    if (!validation.valid) {
                      setUrlError(validation.error || 'Invalid URL');
                    } else {
                      setUrlError(null);
                    }
                  } else {
                    setUrlError(null);
                  }
                }}
                placeholder="https://yourdealership.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  urlError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {urlError && (
                <p className="mt-2 text-sm text-red-600">{urlError}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                We'll analyze your website to track AI visibility across platforms
              </p>
            </div>
            {formData.websiteUrl && !urlError && (
              <button
                onClick={() => {
                  handleStepComplete('website');
                  handleNext();
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        );

      case 'google-business':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Google Business Profile</h3>
                <p className="text-sm text-gray-600">Optional - Track local AI search visibility</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Business Profile URL
              </label>
              <input
                type="url"
                value={formData.googleBusinessProfile}
                onChange={(e) => setFormData({ ...formData, googleBusinessProfile: e.target.value })}
                placeholder="https://maps.google.com/business/your-profile"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Connect your Google Business Profile to track local AI search visibility
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
              {formData.googleBusinessProfile && (
                <button
                  onClick={() => {
                    handleStepComplete('google-business');
                    handleNext();
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Google Analytics 4</h3>
                <p className="text-sm text-gray-600">Optional - Get 87% more accurate insights</p>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-4">
                Connect your Google Analytics 4 account to get more accurate traffic insights and better AI visibility tracking.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.googleAnalytics}
                  onChange={(e) => setFormData({ ...formData, googleAnalytics: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  I want to connect Google Analytics 4
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
              <button
                onClick={() => {
                  if (formData.googleAnalytics) {
                    handleStepComplete('analytics');
                  }
                  handleNext();
                }}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                {formData.googleAnalytics ? 'Connect GA4' : 'Continue'} 
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900">
              You're All Set!
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Your AI visibility tracking is now active. We'll start monitoring your presence across AI platforms.
            </p>
            <button
              onClick={handleComplete}
              className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 mx-auto"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>
          {renderStepContent()}
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-blue-600 w-8'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

