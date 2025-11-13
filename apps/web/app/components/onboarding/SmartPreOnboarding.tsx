'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Brain,
  Globe,
  BarChart3,
  MapPin
} from 'lucide-react';

interface PreOnboardingProps {
  onStart: () => void;
  userData?: {
    name?: string;
    company?: string;
    plan?: string;
  };
}

export default function SmartPreOnboarding({ onStart, userData }: PreOnboardingProps) {
  const [currentTip, setCurrentTip] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const quickTips = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Setup",
      description: "Our AI assistant will guide you through the entire process in just 3-7 minutes"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Insights",
      description: "Get your first AI visibility report within 5 minutes of setup"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Personalized Recommendations",
      description: "Receive custom suggestions based on your dealership's specific needs"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      text: "87% more accurate data"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      text: "3x faster insights"
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      text: "Zero technical knowledge required"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % quickTips.length);
    }, 3000);

    // Auto-ready after 5 seconds
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(readyTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex items-center justify-center p-5">
      <div className="max-w-2xl w-full">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[var(--brand-primary)]" />
          </div>
          <h1 className="text-4xl font-semibold mb-4">
            Welcome{userData?.name ? `, ${userData.name}` : ''}! 🎉
          </h1>
          <p className="text-white/70 text-xl">
            Your {userData?.plan || 'Professional'} plan is active. Let's get you set up in under 5 minutes.
          </p>
        </div>

        {/* Quick Tips Carousel */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">What to Expect</h2>
            <p className="text-white/70">Here's how our AI assistant will help you</p>
          </div>
          
          <div className="relative h-32 mb-6">
            {quickTips.map((tip, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentTip 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentTip 
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tip.title}</h3>
                    <p className="text-white/70">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {quickTips.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTip 
                    ? 'bg-[var(--brand-primary)]' 
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  {benefit.icon}
                </div>
                <p className="text-sm font-medium">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onStart}
            disabled={!isReady}
            className={`inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold transition-all ${
              isReady
                ? 'opacity-100 scale-100'
                : 'opacity-50 scale-95'
            }`}
            style={{ backgroundImage: 'var(--brand-gradient)' }}
          >
            {isReady ? (
              <>
                <Brain className="w-5 h-5" />
                Start AI Setup Assistant
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                Preparing your setup...
              </>
            )}
          </button>
          
          {!isReady && (
            <p className="text-sm text-white/50 mt-3">
              Getting everything ready for you...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
