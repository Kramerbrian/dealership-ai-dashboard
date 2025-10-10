/**
 * Onboarding Page
 * 
 * Comprehensive onboarding experience for new users:
 * - Welcome flow
 * - Profile setup
 * - Feature introduction
 * - Goal setting
 * - Team setup
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productTourManager } from '@/lib/product-tour';
import { learningCenterManager } from '@/lib/learning-center';
import { teamManagementSystem } from '@/lib/team-management';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isRequired: boolean;
  isCompleted: boolean;
}

interface OnboardingData {
  profile: {
    dealershipName: string;
    industry: string;
    size: string;
    location: string;
    website: string;
  };
  goals: {
    primaryGoal: string;
    targetMetrics: string[];
    timeline: string;
  };
  team: {
    teamSize: string;
    roles: string[];
    departments: string[];
  };
  preferences: {
    notifications: boolean;
    weeklyReports: boolean;
    emailUpdates: boolean;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profile: {
      dealershipName: '',
      industry: 'automotive',
      size: 'small',
      location: '',
      website: '',
    },
    goals: {
      primaryGoal: '',
      targetMetrics: [],
      timeline: '3-months',
    },
    team: {
      teamSize: '1-5',
      roles: [],
      departments: [],
    },
    preferences: {
      notifications: true,
      weeklyReports: true,
      emailUpdates: true,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DealershipAI',
      description: 'Let\'s get you started with the most advanced AI-powered dealership analytics platform',
      component: WelcomeStep,
      isRequired: true,
      isCompleted: false,
    },
    {
      id: 'profile',
      title: 'Set Up Your Profile',
      description: 'Tell us about your dealership to personalize your experience',
      component: ProfileSetupStep,
      isRequired: true,
      isCompleted: false,
    },
    {
      id: 'goals',
      title: 'Define Your Goals',
      description: 'What do you want to achieve with DealershipAI?',
      component: GoalsSetupStep,
      isRequired: true,
      isCompleted: false,
    },
    {
      id: 'team',
      title: 'Team Setup',
      description: 'Configure your team and collaboration settings',
      component: TeamSetupStep,
      isRequired: false,
      isCompleted: false,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your notification and reporting preferences',
      component: PreferencesStep,
      isRequired: false,
      isCompleted: false,
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Welcome to DealershipAI. Let\'s start optimizing your dealership\'s AI visibility.',
      component: CompletionStep,
      isRequired: true,
      isCompleted: false,
    },
  ];

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      // Mark current step as completed
      const updatedSteps = [...onboardingSteps];
      updatedSteps[currentStep].isCompleted = true;
      
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      // Save onboarding data
      await saveOnboardingData(onboardingData);
      
      // Start welcome tour
      await productTourManager.startTour('onboarding-welcome', 'current-user');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboardingData = async (data: OnboardingData) => {
    // In a real implementation, this would save to the database
    console.log('Saving onboarding data:', data);
    
    // Store in localStorage for now
    localStorage.setItem('onboarding-data', JSON.stringify(data));
    localStorage.setItem('onboarding-completed', 'true');
  };

  const updateOnboardingData = (section: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const CurrentStepComponent = onboardingSteps[currentStep].component;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Bar */}
      <div className="w-full bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <CurrentStepComponent
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            canGoBack={currentStep > 0}
            canSkip={!onboardingSteps[currentStep].isRequired}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ onNext, isLoading }: any) {
  return (
    <div className="p-8 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to DealershipAI
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The most advanced AI-powered dealership analytics platform. Let's get you started with a personalized setup experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-blue-50 rounded-lg">
          <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Visibility Analytics</h3>
          <p className="text-sm text-gray-600">Track your dealership's presence across AI platforms</p>
        </div>

        <div className="p-6 bg-green-50 rounded-lg">
          <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Predictive Insights</h3>
          <p className="text-sm text-gray-600">Get AI-powered recommendations for growth</p>
        </div>

        <div className="p-6 bg-purple-50 rounded-lg">
          <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
          <p className="text-sm text-gray-600">Work together to optimize your dealership</p>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Getting Started...' : 'Get Started'}
      </button>
    </div>
  );
}

// Profile Setup Step Component
function ProfileSetupStep({ data, onUpdate, onNext, onPrevious, canGoBack }: any) {
  const [formData, setFormData] = useState(data.profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate('profile', formData);
    onNext();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Profile</h2>
        <p className="text-gray-600">Tell us about your dealership to personalize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dealership Name *
            </label>
            <input
              type="text"
              required
              value={formData.dealershipName}
              onChange={(e) => setFormData({ ...formData, dealershipName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your dealership name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="automotive">Automotive</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="rv">RV</option>
              <option value="marine">Marine</option>
              <option value="powersports">Powersports</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dealership Size
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="small">Small (1-10 employees)</option>
              <option value="medium">Medium (11-50 employees)</option>
              <option value="large">Large (51+ employees)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, State"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yourdealership.com"
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          {canGoBack && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          <button
            type="submit"
            className="ml-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

// Goals Setup Step Component
function GoalsSetupStep({ data, onUpdate, onNext, onPrevious, canGoBack }: any) {
  const [formData, setFormData] = useState(data.goals);

  const targetMetrics = [
    'Increase AI visibility score',
    'Improve customer reviews',
    'Generate more leads',
    'Increase revenue',
    'Improve online presence',
    'Better customer service',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate('goals', formData);
    onNext();
  };

  const toggleMetric = (metric: string) => {
    const updated = formData.targetMetrics.includes(metric)
      ? formData.targetMetrics.filter(m => m !== metric)
      : [...formData.targetMetrics, metric];
    setFormData({ ...formData, targetMetrics: updated });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Define Your Goals</h2>
        <p className="text-gray-600">What do you want to achieve with DealershipAI?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Goal *
          </label>
          <textarea
            required
            value={formData.primaryGoal}
            onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Describe your main objective..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Metrics
          </label>
          <div className="grid grid-cols-2 gap-3">
            {targetMetrics.map((metric) => (
              <label key={metric} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.targetMetrics.includes(metric)}
                  onChange={() => toggleMetric(metric)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{metric}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline
          </label>
          <select
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1-month">1 Month</option>
            <option value="3-months">3 Months</option>
            <option value="6-months">6 Months</option>
            <option value="1-year">1 Year</option>
          </select>
        </div>

        <div className="flex justify-between pt-6">
          {canGoBack && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          <button
            type="submit"
            className="ml-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

// Team Setup Step Component
function TeamSetupStep({ data, onUpdate, onNext, onPrevious, onSkip, canGoBack, canSkip }: any) {
  const [formData, setFormData] = useState(data.team);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate('team', formData);
    onNext();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Setup</h2>
        <p className="text-gray-600">Configure your team and collaboration settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Size
          </label>
          <select
            value={formData.teamSize}
            onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1-5">1-5 people</option>
            <option value="6-15">6-15 people</option>
            <option value="16-50">16-50 people</option>
            <option value="50+">50+ people</option>
          </select>
        </div>

        <div className="flex justify-between pt-6">
          {canGoBack && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          <div className="ml-auto space-x-3">
            {canSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                Skip
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Preferences Step Component
function PreferencesStep({ data, onUpdate, onNext, onPrevious, onSkip, canGoBack, canSkip }: any) {
  const [formData, setFormData] = useState(data.preferences);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate('preferences', formData);
    onNext();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences</h2>
        <p className="text-gray-600">Customize your notification and reporting preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable push notifications</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.weeklyReports}
              onChange={(e) => setFormData({ ...formData, weeklyReports: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Receive weekly performance reports</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.emailUpdates}
              onChange={(e) => setFormData({ ...formData, emailUpdates: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Email updates and insights</span>
          </label>
        </div>

        <div className="flex justify-between pt-6">
          {canGoBack && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          <div className="ml-auto space-x-3">
            {canSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                Skip
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Completion Step Component
function CompletionStep({ onNext, isLoading }: any) {
  return (
    <div className="p-8 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You're All Set!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to DealershipAI. Your personalized dashboard is ready, and we've prepared a guided tour to help you get started.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
        <ul className="text-left text-blue-800 space-y-2">
          <li>• Take the guided product tour</li>
          <li>• Explore your AI visibility metrics</li>
          <li>• Set up your first optimization goals</li>
          <li>• Invite team members to collaborate</li>
        </ul>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Setting up your dashboard...' : 'Go to Dashboard'}
      </button>
    </div>
  );
}
