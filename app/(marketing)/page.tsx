/**
 * DealershipAI Cinematic Landing Page
 * Christopher Nolan-inspired with 3-stage continuity system
 * Quick Start: Copy to app/(marketing)/page.tsx or app/(landing)/page.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Sparkles, TrendingUp, Shield, Zap, Eye } from 'lucide-react';

// Brand hue system (inline, no external deps)
const useBrand = (domain: string) => {
  const hue = domain ? (domain.charCodeAt(0) * 7) % 360 : 210;
  return {
    accent: `hsl(${hue}, 70%, 55%)`,
    soft: `hsl(${hue}, 60%, 45%)`,
    gradient: `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${hue + 30}, 70%, 55%))`
  };
};

// Continuity system for enter/exit fades
const Continuity = ({ phase, children }: { phase: 'enter' | 'exit' | 'idle'; children: React.ReactNode }) => {
  return (
    <AnimatePresence mode="wait">
      {phase !== 'idle' && (
        <motion.div
          key={phase}
          initial={phase === 'enter' ? { opacity: 0, scale: 1.1 } : { opacity: 1, scale: 1 }}
          animate={phase === 'enter' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function DealershipAILanding() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [stage, setStage] = useState<'intro' | 'hero' | 'analyzing'>('intro');
  const [phase, setPhase] = useState<'enter' | 'exit' | 'idle'>('enter');
  const [domain, setDomain] = useState('');
  const brand = useBrand(domain);

  // Stage 1: Intro (0-1.8s)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stage === 'intro') {
        setStage('hero');
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [stage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    // Stage 3: Analyzing
    setStage('analyzing');
    setPhase('exit');

    // Store for onboarding continuity
    if (typeof window !== 'undefined') {
      localStorage.setItem('dai:dealer', domain);
    }

    // Transition to onboarding
    setTimeout(() => {
      router.push('/onboarding');
    }, 1400);
  };

  // Stage 1: Intro
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.19, 1, 0.22, 1] }}
          className="text-center"
        >
          <h1 className="text-6xl font-light text-white mb-4">DealershipAI</h1>
          <p className="text-white/60 text-sm">Cognitive Operations Platform</p>
        </motion.div>
      </div>
    );
  }

  // Stage 2: Hero
  if (stage === 'hero') {
    return (
      <Continuity phase={phase}>
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
          {/* Nav */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="text-xl font-light">DealershipAI</div>
              {isLoaded && !user && (
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </nav>

          {/* Hero Section */}
          <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h1 
                className="text-6xl md:text-7xl font-light mb-6 bg-clip-text text-transparent"
                style={{ backgroundImage: brand.gradient }}
              >
                When ChatGPT doesn't know you exist,
                <br />
                <span className="font-normal">you might as well be selling horse carriages.</span>
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                See your AI visibility across ChatGPT, Claude, Perplexity, and Gemini in 15 seconds.
              </p>
            </motion.div>

            {/* URL Input */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto mb-16"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="terryreidhyundai.com"
                  className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
                />
                {user ? (
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-xl font-semibold text-black transition-all"
                    style={{ background: brand.gradient }}
                  >
                    Analyze →
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="px-8 py-4 rounded-xl font-semibold text-black transition-all"
                      style={{ background: brand.gradient }}
                    >
                      Start Free Scan →
                    </button>
                  </SignInButton>
                )}
              </div>
            </motion.form>

            {/* 5 Pillars Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-5 gap-4 mb-16"
            >
              {[
                { name: 'AI Visibility', score: 87, icon: Eye, color: 'cyan' },
                { name: 'Zero-Click Shield', score: 92, icon: Shield, color: 'emerald' },
                { name: 'UGC Health', score: 78, icon: TrendingUp, color: 'blue' },
                { name: 'Geo Trust', score: 85, icon: Sparkles, color: 'purple' },
                { name: 'SGP Integrity', score: 91, icon: Zap, color: 'orange' },
              ].map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <Icon className="w-6 h-6 mb-3 text-white/60" />
                    <div className="text-3xl font-light mb-1">{pillar.score}</div>
                    <div className="text-xs text-white/50">{pillar.name}</div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center space-y-4"
            >
              <div className="text-4xl font-light">
                <span className="text-red-400">$142K</span> Monthly Loss
              </div>
              <div className="text-white/60">
                73% of dealers are invisible to AI search
              </div>
              <div className="text-sm text-white/40">
                Average scan time: 15 seconds • ROI: Pays for itself in 2 hours
              </div>
            </motion.div>
          </div>
        </div>
      </Continuity>
    );
  }

  // Stage 3: Analyzing
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 0.85, opacity: 0.8 }}
        transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
        />
        <h2 className="text-2xl font-light text-white">Analyzing your dealership...</h2>
        <p className="text-white/60 text-sm mt-2">This will only take a moment</p>
      </motion.div>
    </div>
  );
}
