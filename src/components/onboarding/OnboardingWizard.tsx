"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Star, 
  Target, 
  BarChart3,
  Users,
  Settings,
  Zap,
  Award,
  Sparkles,
  ArrowRight,
  SkipForward,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  required: boolean;
  completed: boolean;
}

interface OnboardingData {
  dealershipName: string;
  industry: string;
  location: string;
  teamSize: string;
  currentChallenges: string[];
  goals: string[];
  tone: 'professional' | 'friendly' | 'witty' | 'empathetic';
  plan: 'starter' | 'professional' | 'enterprise';
  notifications: boolean;
  dataSharing: boolean;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    dealershipName: '',
    industry: 'automotive',
    location: '',
    teamSize: '1-10',
    currentChallenges: [],
    goals: [],
    tone: 'professional',
    plan: 'professional',
    notifications: true,
    dataSharing: true
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DealershipAI!',
      description: 'Let\'s get you set up for success',
      icon: <Sparkles className="h-6 w-6" />,
      component: <WelcomeStep data={data} setData={setData} />,
      required: true,
      completed: false
    },
    {
      id: 'business-info',
      title: 'Tell us about your dealership',
      description: 'Help us personalize your experience',
      icon: <Target className="h-6 w-6" />,
      component: <BusinessInfoStep data={data} setData={setData} />,
      required: true,
      completed: false
    },
    {
      id: 'challenges',
      title: 'What challenges are you facing?',
      description: 'We\'ll tailor our recommendations',
      icon: <BarChart3 className="h-6 w-6" />,
      component: <ChallengesStep data={data} setData={setData} />,
      required: false,
      completed: false
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      description: 'Let\'s align on your objectives',
      icon: <Star className="h-6 w-6" />,
      component: <GoalsStep data={data} setData={setData} />,
      required: false,
      completed: false
    },
    {
      id: 'tone',
      title: 'Choose your communication style',
      description: 'How should we respond to reviews?',
      icon: <Zap className="h-6 w-6" />,
      component: <ToneStep data={data} setData={setData} />,
      required: true,
      completed: false
    },
    {
      id: 'plan',
      title: 'Select your plan',
      description: 'Choose the perfect plan for your needs',
      icon: <Award className="h-6 w-6" />,
      component: <PlanStep data={data} setData={setData} />,
      required: true,
      completed: false
    },
    {
      id: 'preferences',
      title: 'Set your preferences',
      description: 'Customize your experience',
      icon: <Settings className="h-6 w-6" />,
      component: <PreferencesStep data={data} setData={setData} />,
      required: false,
      completed: false
    },
    {
      id: 'preview',
      title: 'Preview your dashboard',
      description: 'See what your AI-powered dashboard looks like',
      icon: <BarChart3 className="h-6 w-6" />,
      component: <PreviewStep data={data} />,
      required: false,
      completed: false
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Welcome to the future of dealership management',
      icon: <CheckCircle className="h-6 w-6" />,
      component: <CompleteStep data={data} />,
      required: false,
      completed: false
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const skipOnboarding = () => {
    // Save minimal data and redirect to dashboard
    localStorage.setItem('dealership-ai-onboarding-completed', 'true');
    toast.success('Welcome to DealershipAI! You can always complete setup later.');
    router.push('/dashboard');
  };

  const completeOnboarding = () => {
    // Save onboarding data
    localStorage.setItem('dealership-ai-onboarding-completed', 'true');
    localStorage.setItem('dealership-ai-onboarding-data', JSON.stringify(data));
    
    toast.success('🎉 Welcome to DealershipAI! Your dashboard is ready.');
    router.push('/dashboard');
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DealershipAI Setup</h1>
                <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <Button variant="outline" onClick={skipOnboarding}>
              <SkipForward className="h-4 w-4" />
              Skip Setup
            </Button>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
                <span className={index <= currentStep ? 'text-blue-600' : 'text-gray-400'}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="min-h-[500px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                {currentStepData.icon}
              </div>
              <div>
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                <p className="text-gray-600 mt-1">{currentStepData.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
              {currentStepData.component}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep === steps.length - 1 ? (
              <Button onClick={completeOnboarding} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" />
                Complete Setup
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ data, setData }: { data: OnboardingData; setData: (data: OnboardingData) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to DealershipAI!</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You're about to experience the future of dealership management. Our AI-powered platform will help you optimize your visibility, manage your reputation, and grow your business.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900">AI-Powered Insights</h3>
          <p className="text-sm text-blue-700">Get predictive analytics and actionable recommendations</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900">Reputation Management</h3>
          <p className="text-sm text-green-700">Automatically respond to reviews with your chosen tone</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900">What-If Simulator</h3>
          <p className="text-sm text-purple-700">Test scenarios and see potential outcomes</p>
        </div>
      </div>
    </div>
  );
}

function BusinessInfoStep({ data, setData }: { data: OnboardingData; setData: (data: OnboardingData) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dealership Name *
          </label>
          <Input
            value={data.dealershipName}
            onChange={(e) => setData({ ...data, dealershipName: e.target.value })}
            placeholder="Enter your dealership name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <Input
            value={data.location}
            onChange={(e) => setData({ ...data, location: e.target.value })}
            placeholder="City, State"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            value={data.industry}
            onChange={(e) => setData({ ...data, industry: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Team Size
          </label>
          <select
            value={data.teamSize}
            onChange={(e) => setData({ ...data, teamSize: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="200+">200+ employees</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ChallengesStep({ data, setData }: { data: OnboardingData; setData: (data: OnboardingData) => void }) {
  const challenges = [
    'Low online visibility',
    'Poor review management',
    'Inconsistent marketing',
    'Limited analytics',
    'High customer acquisition costs',
    'Competition from online retailers',
    'Seasonal fluctuations',
    'Staff training needs'
  ];

  const toggleChallenge = (challenge: string) => {
    const updated = data.currentChallenges.includes(challenge)
      ? data.currentChallenges.filter(c => c !== challenge)
      : [...data.currentChallenges, challenge];
    setData({ ...data, currentChallenges: updated });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Select the challenges you're currently facing. This helps us provide more relevant recommendations.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {challenges.map((challenge) => (
          <button
            key={challenge}
            onClick={() => toggleChallenge(challenge)}
            className={`p-3 text-left border rounded-lg transition-colors ${
              data.currentChallenges.includes(challenge)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {challenge}
          </button>
        ))}
      </div>
    </div>
  );
}

function GoalsStep({ data, setData }: { data: OnboardingData; setData: (data: OnboardingData) => void }) {
  const goals = [
    'Increase online visibility',
    'Improve customer reviews',
    'Boost sales conversion',
    'Reduce marketing costs',
    'Better team collaboration',
    'Data-driven decisions',
    'Automate repetitive tasks',
    'Scale the business'
  ];

  const toggleGoal = (goal: string) => {
    const updated = data.goals.includes(goal)
      ? data.goals.filter(g => g !== goal)
      : [...data.goals, goal];
    setData({ ...data, goals: updated });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        What are your main goals for the next 6 months? We'll help you track progress toward these objectives.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleGoal(goal)}
            className={`p-3 text-left border rounded-lg transition-colors ${
              data.goals.includes(goal)
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {goal}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToneStep({ data, setData }: { data: OnboardingData; setData: (data: OnboardingData) => void }) {
  const tones = [
    {
      key: 'professional',
      name: 'Professional',
      description: 'Formal, courteous, and business-appropriate',
      example: 'Thank you for your feedback. We appreciate your business and look forward to serving you again.'
    },
    {
      key: 'friendly',
      name: 'Friendly',
      description: 'Warm, approachable, and personable',
      example: 'Thanks so much for the great review! We\'re thrilled you had such a positive experience with us.'
    },
    {
      key: 'witty',
      name: 'Witty',
      description: 'Clever, humorous, and engaging',
      example: 'Wow, you\'ve made our day! We\'re practically blushing from all the praise. 😊'
    },
    {
      key: 'empathetic',
      name: 'Empathetic',
      description: 'Understanding, compassionate, and caring',
      example: 'We truly appreciate you taking the time to share your experience. Your feedback means everything to us.'
    }
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Choose how you'd like our AI to respond to customer reviews. You can change this anytime in settings.
      </p>
      
      <div className="space-y-4">
        {tones.map((tone) => (
          <div
            key={tone.key}
            onClick={() => setData({ ...data, tone: tone.key as any })}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              data.tone === tone.key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                data.tone === tone.key
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {data.tone === tone.key && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{tone.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tone.description}</p>
                <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 italic">
                  "{tone.example}"
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanStep({ data, setData }: { data: OnboardingData; setData: (data: OnboardingData) => void }) {
  const plans = [
    {
      key: 'starter',
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small dealerships',
      features: [
        'Basic AIV tracking',
        'Review monitoring',
        'Email support',
        'Up to 2 team members'
      ],
      popular: false
    },
    {
      key: 'professional',
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Most popular for growing dealerships',
      features: [
        'Advanced AIV analytics',
        'AI-powered insights',
        'Reputation management',
        'What-if simulator',
        'Priority support',
        'Up to 10 team members'
      ],
      popular: true
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      price: '$999',
      period: '/month',
      description: 'For large dealerships and groups',
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced reporting',
        'White-label options',
        'Unlimited team members',
        '24/7 phone support'
      ],
      popular: false,
      badge: 'Ludicrous Mode'
    }
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Choose the plan that best fits your needs. You can upgrade or downgrade anytime.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.key}
            onClick={() => setData({ ...data, plan: plan.key as any })}
            className={`relative p-6 border rounded-lg cursor-pointer transition-all ${
              data.plan === plan.key
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : plan.popular
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.badge && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                {plan.badge}
              </Badge>
            )}
            
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600">
                Most Popular
              </Badge>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
              
              <ul className="space-y-2 text-sm text-gray-600">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreferencesStep({ data, setData }: { data: OnboardingData; setData: (data: OnboardingData) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Customize your experience with these optional settings.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-600">Receive updates about your AIV scores and important alerts</p>
          </div>
          <input
            type="checkbox"
            checked={data.notifications}
            onChange={(e) => setData({ ...data, notifications: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Data Sharing</h3>
            <p className="text-sm text-gray-600">Help us improve our AI by sharing anonymized usage data</p>
          </div>
          <input
            type="checkbox"
            checked={data.dataSharing}
            onChange={(e) => setData({ ...data, dataSharing: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function PreviewStep({ data }: { data: OnboardingData }) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Here's a preview of what your personalized dashboard will look like:
      </p>
      
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{data.dealershipName} Dashboard</h3>
              <p className="text-sm text-gray-600">Welcome back! Here's your AI-powered overview</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">87</div>
              <div className="text-sm text-blue-600">AIV Score</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">4.8</div>
              <div className="text-sm text-green-600">Avg Rating</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">92%</div>
              <div className="text-sm text-purple-600">Response Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>3 new insights available</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>2 reviews need responses</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Team performance: Excellent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteStep({ data }: { data: OnboardingData }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Welcome to the future of dealership management, {data.dealershipName}! 
          Your AI-powered dashboard is ready to help you optimize your visibility and grow your business.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Sparkles className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900">AI Insights Ready</h3>
          <p className="text-sm text-blue-700">Your personalized recommendations are being generated</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900">Reputation Engine Active</h3>
          <p className="text-sm text-green-700">Monitoring reviews with {data.tone} tone</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900">Analytics Tracking</h3>
          <p className="text-sm text-purple-700">Your AIV scores are being calculated</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Explore your personalized dashboard</li>
          <li>• Set up your first campaign</li>
          <li>• Invite your team members</li>
          <li>• Take the product tour</li>
        </ul>
      </div>
    </div>
  );
}