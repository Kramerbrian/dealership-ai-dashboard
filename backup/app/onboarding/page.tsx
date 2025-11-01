'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, Brain, Target, Zap, Users } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DealershipAI!',
      description: 'Let\'s get your AI visibility tracking set up in just a few minutes.',
      icon: <Brain className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'goals',
      title: 'Set Your Goals',
      description: 'Tell us what you want to achieve with AI visibility tracking.',
      icon: <Target className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'setup',
      title: 'Initial Setup',
      description: 'Configure your dealership profile and preferences.',
      icon: <Zap className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'team',
      title: 'Invite Your Team',
      description: 'Add team members who should have access to your dashboard.',
      icon: <Users className="w-6 h-6" />,
      completed: false
    }
  ];

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Verify the checkout session and get customer data
      fetchCustomerData(sessionId);
    } else {
      // Redirect if no session
      router.push('/');
    }
  }, [searchParams, router]);

  const fetchCustomerData = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomerData(data.customer);
        setIsLoading(false);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      router.push('/');
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].completed = true;
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      // Onboarding complete, redirect to dashboard
      router.push('/dashboard?onboarded=true');
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard?onboarded=true');
    }
  };

  if (isLoading) {
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
          <div className="text-sm text-white/70">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </header>

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

          {steps[currentStep].id === 'goals' && (
            <GoalsStep 
              onComplete={() => handleStepComplete(currentStep)} 
            />
          )}

          {steps[currentStep].id === 'setup' && (
            <SetupStep 
              customerData={customerData}
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
              onClick={() => router.push('/dashboard?onboarded=true')}
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

      <button
        onClick={onComplete}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
      >
        Let's Get Started <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function GoalsStep({ onComplete }: { onComplete: () => void }) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    { id: 'visibility', label: 'Improve AI visibility across platforms', icon: '👁️' },
    { id: 'revenue', label: 'Recover lost revenue from AI searches', icon: '💰' },
    { id: 'competition', label: 'Stay ahead of competitors', icon: '🏆' },
    { id: 'automation', label: 'Automate AI monitoring and responses', icon: '🤖' },
    { id: 'insights', label: 'Get actionable insights and reports', icon: '📊' }
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
              <span className="text-sm font-medium">{goal.label}</span>
              {selectedGoals.includes(goal.id) && (
                <CheckCircle2 className="w-5 h-5 text-[var(--brand-primary)] ml-auto" />
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

function SetupStep({ customerData, onComplete }: { customerData: any; onComplete: () => void }) {
  const [setupData, setSetupData] = useState({
    industry: '',
    size: '',
    location: '',
    primaryGoals: ''
  });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Dealership Type</label>
          <select
            value={setupData.industry}
            onChange={(e) => setSetupData(prev => ({ ...prev, industry: e.target.value }))}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          >
            <option value="">Select type</option>
            <option value="new">New Car Dealership</option>
            <option value="used">Used Car Dealership</option>
            <option value="both">New & Used Cars</option>
            <option value="luxury">Luxury Dealership</option>
            <option value="commercial">Commercial Vehicles</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Dealership Size</label>
          <select
            value={setupData.size}
            onChange={(e) => setSetupData(prev => ({ ...prev, size: e.target.value }))}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          >
            <option value="">Select size</option>
            <option value="small">1-25 employees</option>
            <option value="medium">26-100 employees</option>
            <option value="large">100+ employees</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          value={setupData.location}
          onChange={(e) => setSetupData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="City, State"
          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
        />
      </div>

      <button
        onClick={onComplete}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        style={{ backgroundImage: 'var(--brand-gradient)' }}
      >
        Save & Continue <ArrowRight className="w-4 h-4" />
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

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
