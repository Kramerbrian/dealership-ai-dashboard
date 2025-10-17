'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Brain, 
  Target, 
  Zap, 
  Users, 
  BarChart3,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Search,
  TrendingUp,
  Shield,
  Sparkles,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Info
} from 'lucide-react';
import { useOnboardingPersistence } from '@/app/hooks/useOnboardingPersistence';
import { useOnboardingAnalytics } from '@/app/hooks/useOnboardingAnalytics';
import QuickActions from '@/app/components/onboarding/QuickActions';
import SettingsPanel from '@/app/components/onboarding/SettingsPanel';
import SmartHelpSystem from '@/app/components/onboarding/SmartHelpSystem';
import { LoadingState, ButtonLoadingState, CardLoadingState } from '@/app/components/onboarding/LoadingStates';
import { ErrorHandler, ErrorBoundary } from '@/app/components/onboarding/ErrorHandler';
import { ConnectionSuccess, ConnectionError, ConnectionLoading } from '@/app/components/onboarding/EnhancedVisualFeedback';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  optional?: boolean;
}

interface IntegrationData {
  // Google Services
  ga4PropertyId?: string;
  googleBusinessProfileId?: string;
  googleSearchConsoleUrl?: string;
  googleAnalyticsConnected?: boolean;
  googleBusinessConnected?: boolean;
  
  // Social Media
  facebookPixelId?: string;
  facebookPageId?: string;
  instagramBusinessId?: string;
  youtubeChannelId?: string;
  
  // Website & SEO
  websiteUrl?: string;
  domain?: string;
  
  // CRM & Marketing
  hubspotPortalId?: string;
  salesforceInstanceUrl?: string;
  
  // Review Platforms
  yelpBusinessId?: string;
  dealerRaterId?: string;
  carsComId?: string;
}

function EnhancedOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);
  const [integrationData, setIntegrationData] = useState<IntegrationData>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'pending' | 'connected' | 'failed'>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [currentError, setCurrentError] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState<{ type: string; message: string } | null>(null);

  // Enhanced hooks
  const { 
    onboardingState, 
    isLoading: persistenceLoading, 
    hasRecovered, 
    updateStep, 
    updateIntegrationData: persistIntegrationData, 
    saveProgress, 
    getRecoveryMessage 
  } = useOnboardingPersistence('guided');

  const {
    trackStepStart,
    trackStepComplete,
    trackIntegrationAttempt,
    trackIntegrationSuccess,
    trackIntegrationError,
    trackHelpRequest,
    trackCompletion
  } = useOnboardingAnalytics('guided');

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DealershipAI!',
      description: 'Let\'s supercharge your AI visibility with connected data sources.',
      icon: <Brain className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'required-setup',
      title: 'Required Setup',
      description: 'Connect your Google Business Profile OR Website URL to get started.',
      icon: <Globe className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'google-analytics',
      title: 'Google Analytics 4 (Optional)',
      description: 'Connect GA4 for 87% more accurate traffic insights.',
      icon: <BarChart3 className="w-6 h-6" />,
      completed: false,
      optional: true
    },
    {
      id: 'social-media',
      title: 'Social Media Platforms (Optional)',
      description: 'Link Facebook, Instagram, and YouTube for complete visibility.',
      icon: <Facebook className="w-6 h-6" />,
      completed: false,
      optional: true
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics (Optional)',
      description: 'Connect CRM and review platforms for deeper insights.',
      icon: <Search className="w-6 h-6" />,
      completed: false,
      optional: true
    },
    {
      id: 'goals',
      title: 'Set Your Goals',
      description: 'Define what success looks like for your dealership.',
      icon: <Target className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'team',
      title: 'Invite Your Team (Optional)',
      description: 'Add team members to collaborate on AI insights.',
      icon: <Users className="w-6 h-6" />,
      completed: false,
      optional: true
    }
  ];

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const userId = searchParams.get('user_id');
    
    if (sessionId || userId) {
      fetchCustomerData(sessionId || userId);
    } else {
      // For demo purposes, create mock data
      setCustomerData({
        name: 'Demo User',
        email: 'demo@dealership.com',
        company: 'Demo Dealership',
        plan: 'Professional'
      });
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchCustomerData = async (identifier: string) => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${identifier}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomerData(data.customer);
      } else {
        // Fallback to mock data
        setCustomerData({
          name: 'Demo User',
          email: 'demo@dealership.com',
          company: 'Demo Dealership',
          plan: 'Professional'
        });
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // Fallback to mock data
      setCustomerData({
        name: 'Demo User',
        email: 'demo@dealership.com',
        company: 'Demo Dealership',
        plan: 'Professional'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].completed = true;
    
    // Track step completion
    trackStepComplete(steps[stepIndex].id, integrationData);
    
    // Update persistence
    updateStep(stepIndex, steps[stepIndex].id, integrationData);
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
      // Track next step start
      trackStepStart(steps[stepIndex + 1].id);
    } else {
      // Onboarding complete
      const connectedIntegrations = Object.keys(integrationData).filter(key => integrationData[key as keyof IntegrationData]);
      trackCompletion(connectedIntegrations, Date.now() - onboardingState.startTime);
      router.push('/dash?onboarded=true');
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dash?onboarded=true');
    }
  };

  const updateIntegrationData = (key: keyof IntegrationData, value: any) => {
    setIntegrationData(prev => ({ ...prev, [key]: value }));
  };

  const testConnection = async (service: string) => {
    setConnectionStatus(prev => ({ ...prev, [service]: 'pending' }));
    
    try {
      // Track integration attempt
      trackIntegrationAttempt(service, false);
      
      // Simulate API call with better error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.3; // 70% success rate
          if (success) {
            resolve(true);
          } else {
            reject(new Error('Connection failed. Please check your credentials.'));
          }
        }, 2000);
      });
      
      setConnectionStatus(prev => ({ ...prev, [service]: 'connected' }));
      trackIntegrationSuccess(service, { timestamp: Date.now() });
      
      // Show success feedback
      setShowSuccess({ type: 'connection', message: `${service} connected successfully!` });
      setTimeout(() => setShowSuccess(null), 3000);
      
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [service]: 'failed' }));
      trackIntegrationError(service, 'connection_failed', error instanceof Error ? error.message : 'Unknown error');
      
      // Show error feedback
      setCurrentError({
        id: `connection-${service}-${Date.now()}`,
        type: 'error',
        title: 'Connection Failed',
        message: `Failed to connect to ${service}`,
        details: error instanceof Error ? error.message : 'Unknown error',
        dismissible: true,
        action: {
          label: 'Retry',
          onClick: () => testConnection(service)
        }
      });
    }
  };

  if (isLoading || persistenceLoading) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
          <p className="text-white/70">This will just take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white">
      {/* Brand Tokens */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root{
            --brand-gradient: linear-gradient(90deg,#3b82f6, #8b5cf6);
            --brand-primary: #3b82f6;
            --brand-accent: #8b5cf6;
            --brand-bg: #0a0b0f;
            --brand-card: rgba(255,255,255,0.04);
            --brand-border: rgba(255,255,255,0.08);
            --brand-glow: 0 0 60px rgba(59,130,246,.35);
          }
          .glass{ background:var(--brand-card); border:1px solid var(--brand-border); backdrop-filter: blur(12px); }
        `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--brand-border)]/70 bg-[var(--brand-bg)]/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg" style={{ background: 'var(--brand-gradient)' }} />
            <div className="text-lg font-semibold tracking-tight">dealership<span className="font-bold" style={{ color: 'var(--brand-primary)' }}>AI</span></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/70">
              Step {currentStep + 1} of {steps.length}
            </div>
            <QuickActions
              onSettingsClick={() => setShowSettings(true)}
              onRefreshClick={() => window.location.reload()}
              onHelpClick={() => trackHelpRequest(steps[currentStep].id, 'quick_help')}
            />
          </div>
        </div>
      </header>

      {/* Enhanced Components */}
      <ErrorHandler 
        error={currentError} 
        onDismiss={(errorId) => setCurrentError(null)}
        onRetry={(errorId) => {
          // Extract service from error ID and retry
          const service = errorId.split('-')[1];
          if (service) testConnection(service);
        }}
      />
      
      {showSuccess && (
        <ConnectionSuccess 
          integration={showSuccess.message} 
          onComplete={() => setShowSuccess(null)} 
        />
      )}
      
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onSave={async (settings) => {
          // Save settings logic
          console.log('Settings saved:', settings);
        }}
      />
      
      <SmartHelpSystem 
        stepId={steps[currentStep].id}
        onHelpRequest={(helpType) => trackHelpRequest(steps[currentStep].id, helpType)}
      />

      <div className="mx-auto max-w-4xl px-5 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep 
                    ? 'bg-[var(--brand-primary)] text-white' 
                    : 'bg-white/10 text-white/40'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-[var(--brand-primary)]' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center mx-auto mb-4">
              {steps[currentStep].icon}
            </div>
            <h1 className="text-3xl font-semibold mb-4">{steps[currentStep].title}</h1>
            <p className="text-white/70 text-lg">{steps[currentStep].description}</p>
          </div>

          {/* Step-specific content */}
          {steps[currentStep].id === 'welcome' && (
            <WelcomeStep 
              customerData={customerData} 
              onComplete={() => handleStepComplete(currentStep)} 
            />
          )}

          {steps[currentStep].id === 'required-setup' && (
            <RequiredSetupStep 
              integrationData={integrationData}
              updateIntegrationData={updateIntegrationData}
              connectionStatus={connectionStatus}
              testConnection={testConnection}
              onComplete={() => handleStepComplete(currentStep)} 
            />
          )}

          {steps[currentStep].id === 'google-analytics' && (
            <GoogleAnalyticsStep 
              integrationData={integrationData}
              updateIntegrationData={updateIntegrationData}
              connectionStatus={connectionStatus}
              testConnection={testConnection}
              onComplete={() => handleStepComplete(currentStep)} 
            />
          )}

          {steps[currentStep].id === 'social-media' && (
            <SocialMediaStep 
              integrationData={integrationData}
              updateIntegrationData={updateIntegrationData}
              connectionStatus={connectionStatus}
              testConnection={testConnection}
              onComplete={() => handleStepComplete(currentStep)} 
            />
          )}

          {steps[currentStep].id === 'analytics' && (
            <AnalyticsStep 
              integrationData={integrationData}
              updateIntegrationData={updateIntegrationData}
              connectionStatus={connectionStatus}
              testConnection={testConnection}
              onComplete={() => handleStepComplete(currentStep)} 
            />
          )}

          {steps[currentStep].id === 'goals' && (
            <GoalsStep 
              onComplete={() => handleStepComplete(currentStep)} 
            />
          )}

          {steps[currentStep].id === 'team' && (
            <TeamStep 
              onComplete={() => handleStepComplete(currentStep)} 
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleSkip}
              className="text-white/60 hover:text-white text-sm"
            >
              Skip for now
            </button>
            <button
              onClick={() => router.push('/dash?onboarded=true')}
              className="text-white/60 hover:text-white text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ customerData, onComplete }: { customerData: any; onComplete: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="glass rounded-xl p-6 max-w-md mx-auto">
        <h3 className="font-semibold mb-2">Welcome, {customerData?.name || 'there'}!</h3>
        <p className="text-sm text-white/70">
          Your {customerData?.plan || 'Professional'} plan is now active with a 14-day free trial.
        </p>
      </div>
      
      <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="glass rounded-xl p-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <div className="text-sm font-semibold">Account Created</div>
          <div className="text-xs text-white/60">Ready to start tracking</div>
        </div>
        <div className="glass rounded-xl p-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <div className="text-sm font-semibold">Payment Setup</div>
          <div className="text-xs text-white/60">Trial period active</div>
        </div>
        <div className="glass rounded-xl p-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <div className="text-sm font-semibold">Dashboard Access</div>
          <div className="text-xs text-white/60">Full features unlocked</div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-[var(--brand-primary)]" />
          <h3 className="text-lg font-semibold">Unlock Maximum Insights</h3>
        </div>
        <p className="text-sm text-white/70 mb-4">
          Connect your marketing platforms to get 10x more accurate AI visibility tracking and actionable insights.
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>87% more accurate data</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Enterprise-grade security</span>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
      >
        Let's Connect Your Data <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function RequiredSetupStep({ integrationData, updateIntegrationData, connectionStatus, testConnection, onComplete }: {
  integrationData: IntegrationData;
  updateIntegrationData: (key: keyof IntegrationData, value: any) => void;
  connectionStatus: Record<string, 'pending' | 'connected' | 'failed'>;
  testConnection: (service: string) => void;
  onComplete: () => void;
}) {
  const [selectedOption, setSelectedOption] = useState<'website' | 'gbp' | 'both'>('website');
  const [formData, setFormData] = useState({
    websiteUrl: integrationData.websiteUrl || '',
    googleBusinessProfileId: integrationData.googleBusinessProfileId || ''
  });

  const handleSubmit = () => {
    if (selectedOption === 'website' || selectedOption === 'both') {
      updateIntegrationData('websiteUrl', formData.websiteUrl);
      updateIntegrationData('domain', formData.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''));
    }
    if (selectedOption === 'gbp' || selectedOption === 'both') {
      updateIntegrationData('googleBusinessProfileId', formData.googleBusinessProfileId);
    }
    onComplete();
  };

  const isFormValid = () => {
    if (selectedOption === 'website') return formData.websiteUrl.trim();
    if (selectedOption === 'gbp') return formData.googleBusinessProfileId.trim();
    if (selectedOption === 'both') return formData.websiteUrl.trim() && formData.googleBusinessProfileId.trim();
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Required Setup</h3>
        <p className="text-white/70 text-sm">
          Connect at least one of these to get started with AI visibility tracking.
        </p>
      </div>

      {/* Option Selection */}
      <div className="space-y-3">
        <div
          className={`glass rounded-xl p-4 cursor-pointer transition-all ${
            selectedOption === 'website' ? 'ring-2 ring-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'hover:bg-white/5'
          }`}
          onClick={() => setSelectedOption('website')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold">Website URL</h4>
              <p className="text-sm text-white/70">Core website analysis and performance tracking</p>
            </div>
          </div>
        </div>

        <div
          className={`glass rounded-xl p-4 cursor-pointer transition-all ${
            selectedOption === 'gbp' ? 'ring-2 ring-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'hover:bg-white/5'
          }`}
          onClick={() => setSelectedOption('gbp')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold">Google Business Profile</h4>
              <p className="text-sm text-white/70">Track local AI search visibility</p>
            </div>
          </div>
        </div>

        <div
          className={`glass rounded-xl p-4 cursor-pointer transition-all ${
            selectedOption === 'both' ? 'ring-2 ring-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'hover:bg-white/5'
          }`}
          onClick={() => setSelectedOption('both')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold">Both (Recommended)</h4>
              <p className="text-sm text-white/70">Maximum AI visibility tracking accuracy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      {(selectedOption === 'website' || selectedOption === 'both') && (
        <div>
          <label className="block text-sm font-medium mb-2">Website URL *</label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
            placeholder="https://www.yourdealership.com"
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          />
        </div>
      )}

      {(selectedOption === 'gbp' || selectedOption === 'both') && (
        <div>
          <label className="block text-sm font-medium mb-2">Google Business Profile ID *</label>
          <input
            type="text"
            value={formData.googleBusinessProfileId}
            onChange={(e) => setFormData(prev => ({ ...prev, googleBusinessProfileId: e.target.value }))}
            placeholder="ChIJ..."
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          />
        </div>
      )}

      <div className="glass rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-white/90 font-medium mb-1">What you'll get:</p>
            <ul className="text-white/70 space-y-1">
              <li>• AI visibility tracking across search platforms</li>
              <li>• Performance monitoring and insights</li>
              <li>• Automated alerts and recommendations</li>
              <li>• Competitive analysis and benchmarking</li>
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isFormValid()}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function GoogleAnalyticsStep({ integrationData, updateIntegrationData, connectionStatus, testConnection, onComplete }: {
  integrationData: IntegrationData;
  updateIntegrationData: (key: keyof IntegrationData, value: any) => void;
  connectionStatus: Record<string, 'pending' | 'connected' | 'failed'>;
  testConnection: (service: string) => void;
  onComplete: () => void;
}) {
  const [ga4PropertyId, setGa4PropertyId] = useState(integrationData.ga4PropertyId || '');

  const handleSubmit = () => {
    updateIntegrationData('ga4PropertyId', ga4PropertyId);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Google Analytics 4 (Optional)</h3>
        <p className="text-white/70 text-sm">
          Connect GA4 for 87% more accurate traffic insights and user behavior tracking.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Google Analytics 4</h4>
              <p className="text-sm text-white/70">Track website traffic and user behavior</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-emerald-400 font-medium">87% more accurate insights</div>
            {connectionStatus.ga4 === 'connected' && (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">GA4 Property ID</label>
            <input
              type="text"
              value={ga4PropertyId}
              onChange={(e) => setGa4PropertyId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
            <p className="text-xs text-white/60 mt-1">
              Find this in your Google Analytics account under Admin > Property Settings
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => testConnection('ga4')}
              disabled={!ga4PropertyId || connectionStatus.ga4 === 'pending'}
              className="flex-1 text-sm px-4 py-2 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)]/30 disabled:opacity-50 transition-colors"
            >
              {connectionStatus.ga4 === 'pending' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-white/90 font-medium mb-1">Why connect GA4?</p>
            <p className="text-white/70">
              Google Analytics provides detailed traffic data that makes AI visibility tracking 87% more accurate. 
              You can always add this later in your dashboard settings.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onComplete}
          className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
        >
          Skip for Now
        </button>
        <button
          onClick={handleSubmit}
          disabled={!ga4PropertyId}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ backgroundImage: 'var(--brand-gradient)' }}
        >
          Connect GA4 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SocialMediaStep({ integrationData, updateIntegrationData, connectionStatus, testConnection, onComplete }: {
  integrationData: IntegrationData;
  updateIntegrationData: (key: keyof IntegrationData, value: any) => void;
  connectionStatus: Record<string, 'pending' | 'connected' | 'failed'>;
  testConnection: (service: string) => void;
  onComplete: () => void;
}) {
  const [formData, setFormData] = useState({
    facebookPixelId: integrationData.facebookPixelId || '',
    facebookPageId: integrationData.facebookPageId || '',
    instagramBusinessId: integrationData.instagramBusinessId || '',
    youtubeChannelId: integrationData.youtubeChannelId || ''
  });

  const handleSubmit = () => {
    updateIntegrationData('facebookPixelId', formData.facebookPixelId);
    updateIntegrationData('facebookPageId', formData.facebookPageId);
    updateIntegrationData('instagramBusinessId', formData.instagramBusinessId);
    updateIntegrationData('youtubeChannelId', formData.youtubeChannelId);
    onComplete();
  };

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Track Facebook ads and page performance',
      icon: <Facebook className="w-5 h-5" />,
      benefit: 'Monitor AI-generated content reach',
      fields: [
        { key: 'facebookPixelId', label: 'Facebook Pixel ID', placeholder: '123456789012345' },
        { key: 'facebookPageId', label: 'Facebook Page ID', placeholder: 'your-page-id' }
      ]
    },
    {
      id: 'instagram',
      name: 'Instagram Business',
      description: 'Track Instagram engagement and reach',
      icon: <Instagram className="w-5 h-5" />,
      benefit: 'Visual content AI visibility',
      fields: [
        { key: 'instagramBusinessId', label: 'Instagram Business ID', placeholder: '17841400000000000' }
      ]
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Monitor video performance and engagement',
      icon: <Youtube className="w-5 h-5" />,
      benefit: 'Video content AI optimization',
      fields: [
        { key: 'youtubeChannelId', label: 'YouTube Channel ID', placeholder: 'UCxxxxxxxxxxxxxxxxxxxxx' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Social Media Platforms</h3>
        <p className="text-white/70 text-sm">
          Connect your social media accounts to track AI visibility across platforms.
        </p>
      </div>

      <div className="space-y-4">
        {socialPlatforms.map((platform) => (
          <div key={platform.id} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                  {platform.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{platform.name}</h4>
                  <p className="text-sm text-white/70">{platform.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-400 font-medium">{platform.benefit}</div>
                {connectionStatus[platform.id] === 'connected' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              {platform.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                </div>
              ))}
              <button
                onClick={() => testConnection(platform.id)}
                disabled={connectionStatus[platform.id] === 'pending'}
                className="text-sm px-3 py-1 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)]/30 disabled:opacity-50"
              >
                {connectionStatus[platform.id] === 'pending' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-white/90 font-medium mb-1">Why connect social media?</p>
            <p className="text-white/70">
              AI platforms increasingly use social signals to determine business relevance and trustworthiness. 
              Connected accounts provide 73% more accurate AI visibility scores.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function AnalyticsStep({ integrationData, updateIntegrationData, connectionStatus, testConnection, onComplete }: {
  integrationData: IntegrationData;
  updateIntegrationData: (key: keyof IntegrationData, value: any) => void;
  connectionStatus: Record<string, 'pending' | 'connected' | 'failed'>;
  testConnection: (service: string) => void;
  onComplete: () => void;
}) {
  const [formData, setFormData] = useState({
    hubspotPortalId: integrationData.hubspotPortalId || '',
    salesforceInstanceUrl: integrationData.salesforceInstanceUrl || '',
    yelpBusinessId: integrationData.yelpBusinessId || '',
    dealerRaterId: integrationData.dealerRaterId || '',
    carsComId: integrationData.carsComId || ''
  });

  const handleSubmit = () => {
    updateIntegrationData('hubspotPortalId', formData.hubspotPortalId);
    updateIntegrationData('salesforceInstanceUrl', formData.salesforceInstanceUrl);
    updateIntegrationData('yelpBusinessId', formData.yelpBusinessId);
    updateIntegrationData('dealerRaterId', formData.dealerRaterId);
    updateIntegrationData('carsComId', formData.carsComId);
    onComplete();
  };

  const analyticsServices = [
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      description: 'Track lead generation and customer interactions',
      icon: <BarChart3 className="w-5 h-5" />,
      benefit: 'Lead quality insights',
      field: { key: 'hubspotPortalId', label: 'HubSpot Portal ID', placeholder: '12345678' }
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Monitor sales pipeline and customer data',
      icon: <TrendingUp className="w-5 h-5" />,
      benefit: 'Sales performance tracking',
      field: { key: 'salesforceInstanceUrl', label: 'Salesforce Instance URL', placeholder: 'https://yourcompany.salesforce.com' }
    },
    {
      id: 'yelp',
      name: 'Yelp Business',
      description: 'Track reviews and local reputation',
      icon: <MapPin className="w-5 h-5" />,
      benefit: 'Reputation monitoring',
      field: { key: 'yelpBusinessId', label: 'Yelp Business ID', placeholder: 'your-business-id' }
    },
    {
      id: 'dealerRater',
      name: 'DealerRater',
      description: 'Monitor automotive-specific reviews',
      icon: <Star className="w-5 h-5" />,
      benefit: 'Industry-specific insights',
      field: { key: 'dealerRaterId', label: 'DealerRater ID', placeholder: 'your-dealer-id' }
    },
    {
      id: 'carsCom',
      name: 'Cars.com',
      description: 'Track vehicle listings and performance',
      icon: <Car className="w-5 h-5" />,
      benefit: 'Inventory visibility',
      field: { key: 'carsComId', label: 'Cars.com Dealer ID', placeholder: 'your-dealer-id' }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Advanced Analytics & CRM</h3>
        <p className="text-white/70 text-sm">
          Connect your CRM and review platforms for comprehensive business insights.
        </p>
      </div>

      <div className="space-y-4">
        {analyticsServices.map((service) => (
          <div key={service.id} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                  {service.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{service.name}</h4>
                  <p className="text-sm text-white/70">{service.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-400 font-medium">{service.benefit}</div>
                {connectionStatus[service.id] === 'connected' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">{service.field.label}</label>
                <input
                  type="text"
                  value={formData[service.field.key as keyof typeof formData]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [service.field.key]: e.target.value }))}
                  placeholder={service.field.placeholder}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
              </div>
              <button
                onClick={() => testConnection(service.id)}
                disabled={connectionStatus[service.id] === 'pending'}
                className="text-sm px-3 py-1 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary)]/30 disabled:opacity-50"
              >
                {connectionStatus[service.id] === 'pending' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[var(--brand-primary)] mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-white/90 font-medium mb-1">Pro Tip: More connections = Better insights</p>
            <p className="text-white/70">
              Dealerships with 5+ connected platforms see 94% more accurate AI visibility predictions 
              and 67% faster time-to-insight.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function GoalsStep({ onComplete }: { onComplete: () => void }) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    { id: 'visibility', label: 'Improve AI visibility across platforms', icon: '👁️', impact: 'High' },
    { id: 'revenue', label: 'Recover lost revenue from AI searches', icon: '💰', impact: 'High' },
    { id: 'competition', label: 'Stay ahead of competitors', icon: '🏆', impact: 'Medium' },
    { id: 'automation', label: 'Automate AI monitoring and responses', icon: '🤖', impact: 'High' },
    { id: 'insights', label: 'Get actionable insights and reports', icon: '📊', impact: 'Medium' },
    { id: 'reputation', label: 'Improve online reputation and reviews', icon: '⭐', impact: 'Medium' }
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">What are your main goals?</h3>
        <p className="text-white/70 text-sm">
          Select your primary objectives to personalize your dashboard experience.
        </p>
      </div>

      <div className="grid gap-3">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedGoals.includes(goal.id)
                ? 'glass ring-2 ring-[var(--brand-primary)]'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{goal.icon}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">{goal.label}</span>
                <div className="text-xs text-white/60 mt-1">
                  Impact: <span className={`font-medium ${
                    goal.impact === 'High' ? 'text-emerald-400' : 
                    goal.impact === 'Medium' ? 'text-yellow-400' : 'text-gray-400'
                  }`}>{goal.impact}</span>
                </div>
              </div>
              {selectedGoals.includes(goal.id) && (
                <CheckCircle2 className="w-5 h-5 text-[var(--brand-primary)]" />
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onComplete}
        disabled={selectedGoals.length === 0}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function TeamStep({ onComplete }: { onComplete: () => void }) {
  const [teamMembers, setTeamMembers] = useState([{ email: '', role: 'viewer' }]);

  const addMember = () => {
    setTeamMembers(prev => [...prev, { email: '', role: 'viewer' }]);
  };

  const updateMember = (index: number, field: string, value: string) => {
    setTeamMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Invite Your Team</h3>
        <p className="text-white/70 text-sm">
          Add team members who should have access to your AI visibility dashboard.
        </p>
      </div>

      <div className="space-y-3">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex gap-3">
            <input
              type="email"
              value={member.email}
              onChange={(e) => updateMember(index, 'email', e.target.value)}
              placeholder="team@yourdealership.com"
              className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
            <select
              value={member.role}
              onChange={(e) => updateMember(index, 'role', e.target.value)}
              className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={addMember}
        className="w-full border border-dashed border-white/30 rounded-lg px-4 py-3 text-sm text-white/60 hover:text-white hover:border-white/50"
      >
        + Add Another Team Member
      </button>

      <button
        onClick={onComplete}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
      >
        Complete Setup <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function EnhancedOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <EnhancedOnboardingContent />
    </Suspense>
  );
}
