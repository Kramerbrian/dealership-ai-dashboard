'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, TrendingUp, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UnlockPromptProps {
  featureName: string;
  onClose: () => void;
}

export const UnlockPrompt: React.FC<UnlockPromptProps> = ({
  featureName,
  onClose
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro');
  const [showConfetti, setShowConfetti] = useState(false);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Easter egg: Type "unlock" triggers confetti
  useEffect(() => {
    let sequence = '';
    const handleKeyPress = (e: KeyboardEvent) => {
      sequence += e.key.toLowerCase();
      // Keep last 6 characters
      if (sequence.length > 6) {
        sequence = sequence.slice(-6);
      }
      if (sequence.includes('unlock')) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        sequence = '';
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const plans = {
    pro: {
      name: 'Pro',
      price: 499,
      sessions: 50,
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Full access to 40 Advanced Metrics',
        'Real-time AI visibility tracking',
        'Custom PIQR queries (50/month)',
        'Competitive intelligence reports',
        'Priority support'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: 999,
      sessions: 200,
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-500',
      features: [
        'Everything in Pro, plus:',
        'One-click automated fixes',
        'Mystery Shop automation',
        'Custom PIQR queries (200/month)',
        'White-label reports',
        'Dedicated success manager'
      ]
    }
  };

  const plan = plans[selectedPlan];
  const Icon = plan.icon;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl 
              pointer-events-auto border border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800/80 
                hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Gradient */}
            <div className={`relative p-8 bg-gradient-to-r ${plan.gradient} overflow-hidden`}>
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                  bg-white/20 backdrop-blur-sm mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Unlock {featureName}
                </h2>
                <p className="text-white/80 text-lg">
                  Join 500+ dealerships using AI intelligence to dominate their markets
                </p>
              </div>
            </div>

            {/* Plan Selector */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-8">
                {(['pro', 'enterprise'] as const).map((planKey) => {
                  const p = plans[planKey];
                  const PlanIcon = p.icon;
                  const isSelected = selectedPlan === planKey;

                  return (
                    <button
                      key={planKey}
                      onClick={() => setSelectedPlan(planKey)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${isSelected 
                          ? 'border-purple-500 bg-purple-500/5 scale-105' 
                          : 'border-gray-700 hover:border-purple-500/30'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${p.gradient}`}>
                          <PlanIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{p.name}</h3>
                          <p className="text-xs text-gray-400">{p.sessions} sessions/mo</p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">${p.price}</span>
                        <span className="text-sm text-gray-400">/month</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Features List */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  What's Included
                </h3>
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Proof */}
              <div className="mb-8 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white mb-1">
                      "DealershipAI helped us close 23% more deals from AI-assisted research"
                    </p>
                    <p className="text-xs text-gray-400">
                      — Terry Reid, GM at Reid Hyundai, Naples FL
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 
                    text-white font-medium transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    // Simulate upgrade
                    console.log('Upgrade to:', selectedPlan);
                    setShowConfetti(true);
                    setTimeout(() => {
                      onClose();
                    }, 2000);
                  }}
                  className={`flex-1 px-6 py-3 rounded-lg bg-gradient-to-r ${plan.gradient}
                    text-white font-semibold transition-all hover:scale-105 hover:shadow-lg
                    flex items-center justify-center gap-2`}
                >
                  Upgrade to {plan.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Fine Print */}
              <p className="text-xs text-gray-400 text-center mt-4">
                30-day money-back guarantee • Cancel anytime • No setup fees
              </p>
            </div>

            {/* Confetti Effect */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * window.innerWidth,
                      y: -20,
                      opacity: 1
                    }}
                    animate={{ 
                      y: window.innerHeight + 20,
                      opacity: 0,
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 2 + Math.random(),
                      delay: Math.random() * 0.5
                    }}
                    className="absolute w-2 h-2 bg-purple-500 rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  );
};
