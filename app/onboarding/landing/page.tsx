'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  Brain,
  CheckCircle2,
  Play,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Shield,
  Globe,
  Search,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Star,
  Car,
  Award,
  Trophy,
  Gift
} from 'lucide-react';

function OnboardingLanding() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'guided' | 'agent'>('guided');

  const onboardingMethods = [
    {
      id: 'guided',
      title: 'Guided Setup',
      description: 'Step-by-step walkthrough with visual progress tracking',
      icon: <Target className="w-8 h-8" />,
      features: [
        'Visual progress tracking',
        'Integration cards with help text',
        'Real-time connection testing',
        'Reward system and badges'
      ],
      time: '5-10 minutes',
      difficulty: 'Easy',
      recommended: true
    },
    {
      id: 'agent',
      title: 'AI Assistant',
      description: 'Chat with our AI assistant for personalized setup',
      icon: <MessageCircle className="w-8 h-8" />,
      features: [
        'Conversational interface',
        'Personalized recommendations',
        'Smart suggestions',
        'Natural language guidance'
      ],
      time: '3-7 minutes',
      difficulty: 'Very Easy',
      recommended: true
    }
  ];

  const integrations = [
    {
      name: 'Google Business Profile',
      icon: <MapPin className="w-6 h-6" />,
      benefit: 'Track local AI search visibility',
      required: true
    },
    {
      name: 'Website URL',
      icon: <Globe className="w-6 h-6" />,
      benefit: 'Core website analysis and performance',
      required: true
    },
    {
      name: 'Google Analytics 4',
      icon: <BarChart3 className="w-6 h-6" />,
      benefit: '87% more accurate traffic insights',
      required: false
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '87% More Accurate Data',
      description: 'Connected platforms provide real-time, comprehensive insights'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and secure API connections'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '3x Faster Insights',
      description: 'Automated data collection and analysis'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: '94% Better ROI',
      description: 'Actionable insights lead to measurable results'
    }
  ];

  const handleStartOnboarding = () => {
    switch (selectedMethod) {
      case 'guided':
        router.push('/onboarding/enhanced');
        break;
      case 'agent':
        router.push('/onboarding/agent');
        break;
    }
  };

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
            Welcome to your AI visibility dashboard
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-semibold mb-4">
            Let's Supercharge Your AI Visibility
          </h1>
          <p className="text-white/70 text-xl max-w-3xl mx-auto mb-8">
            Connect your marketing platforms to unlock 10x more accurate AI visibility tracking, 
            automated insights, and actionable recommendations that drive real results.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto mb-12">
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-[var(--brand-primary)]">87%</div>
              <div className="text-sm text-white/70">More Accurate</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-[var(--brand-primary)]">3x</div>
              <div className="text-sm text-white/70">Faster Insights</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-[var(--brand-primary)]">94%</div>
              <div className="text-sm text-white/70">Better ROI</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-[var(--brand-primary)]">24/7</div>
              <div className="text-sm text-white/70">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Onboarding Methods */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Choose Your Setup Method</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {onboardingMethods.map((method) => (
              <div
                key={method.id}
                className={`glass rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                  selectedMethod === method.id 
                    ? 'ring-2 ring-[var(--brand-primary)] bg-[var(--brand-primary)]/10' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => setSelectedMethod(method.id as any)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                    {method.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{method.title}</h3>
                      {method.recommended && (
                        <span className="text-xs px-2 py-1 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/70">{method.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {method.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>{method.time}</span>
                  </div>
                  <div className="text-white/60">{method.difficulty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations Preview */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Platforms You Can Connect</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration, index) => (
              <div key={index} className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                    {integration.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{integration.name}</h4>
                    {integration.required && (
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-white/70">{integration.benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Why Connect Your Platforms?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="glass rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-white/70">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Preview */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Earn Rewards as You Setup</h2>
          <div className="glass rounded-2xl p-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold mb-1">Bronze Badge</h4>
                <p className="text-sm text-white/70">Connect 3+ platforms</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-semibold mb-1">Silver Badge</h4>
                <p className="text-sm text-white/70">Connect 5+ platforms</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
                <h4 className="font-semibold mb-1">Gold Badge</h4>
                <p className="text-sm text-white/70">Connect 7+ platforms</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8 text-purple-500" />
                </div>
                <h4 className="font-semibold mb-1">Platinum Badge</h4>
                <p className="text-sm text-white/70">Complete all steps</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
            <p className="text-white/70 mb-6">
              Choose your preferred setup method and start tracking your AI visibility with maximum accuracy.
            </p>
            <button
              onClick={handleStartOnboarding}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              Start {onboardingMethods.find(m => m.id === selectedMethod)?.title} Setup
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-white/50 mt-4">
              You can always add more integrations later in your dashboard settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingLanding;

