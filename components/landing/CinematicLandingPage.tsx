/**
 * Cinematic Landing Page - Christopher Nolan Inspired
 * Neural glass aesthetic with conversation-first design
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Sparkles, 
  Eye, 
  Shield, 
  Infinity,
  ArrowRight,
  Menu,
  X,
  TrendingUp,
  Zap,
  Brain
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { ClerkConditional } from '@/components/providers/ClerkConditional';

export default function CinematicLandingPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ['start start', 'end end']
  });

  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const showcaseX = useTransform(scrollYProgress, [0, 0.5, 1], [0, -50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 1, 0.8, 0.6]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Fixed Translucent Nav */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500" />
            <span className="font-semibold text-lg">DealershipAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#product" className="text-white/80 hover:text-white transition-colors">
              Product
            </Link>
            <Link href="/#doctrine" className="text-white/80 hover:text-white transition-colors">
              Doctrine
            </Link>
            <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">
              Dashboard
            </Link>
            <ClerkConditional>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-white/80 hover:text-white transition-colors">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
            </ClerkConditional>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-xl"
            >
              <div className="px-6 py-4 space-y-4">
                <Link href="/#product" className="block text-white/80 hover:text-white">
                  Product
                </Link>
                <Link href="/#doctrine" className="block text-white/80 hover:text-white">
                  Doctrine
                </Link>
                <Link href="/dashboard" className="block text-white/80 hover:text-white">
                  Dashboard
                </Link>
                <ClerkConditional>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="block w-full text-left text-white/80 hover:text-white">
                        Login
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="block w-full text-left px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold">
                        Get Started
                      </button>
                    </SignUpButton>
                  </SignedOut>
                </ClerkConditional>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Zone */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Neural Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_70%)]" />
        
        {/* Soft Cyan Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />

        <motion.div
          style={{ y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Headline + Mission */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
              A conversation with{' '}
              <span className="font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                a system
              </span>
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              DealershipAI isn't software you use; it's cognition you borrow. 
              An embedded AI Chief Strategy Officer that continuously audits, predicts, fixes, and explains.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <ClerkConditional>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center gap-2">
                      Launch the Cognitive Interface
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center gap-2"
                  >
                    Launch the Cognitive Interface
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </SignedIn>
              </ClerkConditional>
            </div>
          </motion.div>

          {/* Right: AI Chat Demo Orb */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Orb Container */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
              />
              <motion.div
                animate={{
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-4 rounded-full border border-emerald-500/20"
              />
              
              {/* Central Orb */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(6,182,212,0.3)',
                    '0 0 40px rgba(16,185,129,0.4)',
                    '0 0 20px rgba(6,182,212,0.3)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center"
              >
                <Brain className="w-16 h-16 text-black" />
              </motion.div>

              {/* Prompt Example */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl rounded-xl p-4 border border-white/10"
              >
                <p className="text-sm text-white/80 mb-2">Example prompt:</p>
                <p className="text-white font-mono text-xs">
                  "What's my AI visibility score across ChatGPT, Claude, and Perplexity?"
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Clarity Deck */}
      <section id="product" className="relative py-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-light text-center mb-12"
          >
            The Three Pillars of Cognitive Trust
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Clarity',
                subtitle: 'How well you're seen',
                icon: Eye,
                description: 'Real-time visibility across all AI platforms. Know exactly where you stand.',
                color: 'cyan',
              },
              {
                title: 'Trust',
                subtitle: 'How much the system believes you',
                icon: Shield,
                description: 'Algorithmic trust scoring. Build credibility that AI systems recognize.',
                color: 'emerald',
              },
              {
                title: 'Inevitable Loop',
                subtitle: 'How it learns while you sleep',
                icon: Infinity,
                description: 'Continuous optimization. The system improves itself autonomously.',
                color: 'purple',
              },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { type: 'spring', stiffness: 300, damping: 30 },
                }}
                className="relative group"
              >
                {/* Tron-style Edge Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${card.color}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <div className={`absolute inset-0 rounded-2xl border-2 border-${card.color}-500/0 group-hover:border-${card.color}-500/50 transition-all duration-500`} />
                
                <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 h-full">
                  <card.icon className={`w-12 h-12 mb-4 text-${card.color}-400`} />
                  <h3 className="text-2xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-white/60 mb-4">{card.subtitle}</p>
                  <p className="text-white/80">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Showcase */}
      <section
        ref={showcaseRef}
        className="relative py-32 overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black"
      >
        <motion.div
          style={{ x: showcaseX, opacity }}
          className="relative"
        >
          <div className="max-w-7xl mx-auto px-6 mb-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-4xl font-light text-center mb-4"
            >
              From dashboard to cognition
            </motion.h2>
          </div>

          {/* 3 Panels - Inception Camera Effect */}
          <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-8 px-6 scrollbar-hide">
            {[
              {
                title: 'Drive',
                description: 'Manual control with real-time intelligence',
                gradient: 'from-cyan-500 to-blue-600',
              },
              {
                title: 'Autopilot',
                description: 'Automated fixes and continuous optimization',
                gradient: 'from-emerald-500 to-teal-600',
              },
              {
                title: 'Insights',
                description: 'Deep cognitive analysis and predictions',
                gradient: 'from-purple-500 to-pink-600',
              },
            ].map((panel, idx) => (
              <motion.div
                key={panel.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex-shrink-0 w-full md:w-1/3 snap-center"
              >
                <div className={`relative h-96 rounded-2xl bg-gradient-to-br ${panel.gradient} p-8 flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-3xl font-bold mb-4">{panel.title}</h3>
                    <p className="text-white/90 text-lg">{panel.description}</p>
                  </div>
                  <div className="absolute bottom-8 right-8">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border border-white/30" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <ClerkConditional>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center gap-2 mx-auto">
                    Launch the Cognitive Interface
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold hover:from-cyan-400 hover:to-emerald-400 transition-all"
                >
                  Launch the Cognitive Interface
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </SignedIn>
            </ClerkConditional>
          </motion.div>
        </motion.div>
      </section>

      {/* Metrics Strip */}
      <section className="py-16 px-6 bg-black border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                <AnimatedNumber value={847} />+
              </div>
              <p className="text-white/60">Active Dealerships</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                <AnimatedNumber value={2.1} suffix="M" />+
              </div>
              <p className="text-white/60">Revenue Recovered Monthly</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                <AnimatedNumber value={4.9} />/5
              </div>
              <p className="text-white/60">Customer Rating</p>
            </motion.div>
          </div>

          {/* Logos in liquid-metal monochrome */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale">
            {['Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford'].map((brand) => (
              <div key={brand} className="text-white/30 text-sm font-light">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="doctrine" className="py-16 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-light text-white/80 mb-8 italic"
          >
            "DealershipAI isn't software you use;
            <br />
            it's cognition you borrow."
          </motion.blockquote>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <Link href="/legal" className="hover:text-white/60 transition-colors">Legal</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/status" className="hover:text-white/60 transition-colors">Status</Link>
          </div>
          <p className="mt-8 text-xs text-white/30">
            © {new Date().getFullYear()} DealershipAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Animated Number Component
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toFixed(suffix ? 1 : 0)}{suffix}</>;
}

