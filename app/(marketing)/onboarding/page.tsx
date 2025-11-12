"use client";

import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Share2, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ShareUnlockModal from '@/components/share/ShareUnlockModal';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

function StepShell({ title, children, step }: { title: string; children: React.ReactNode; step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Gradient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl -z-10" />

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg"
          >
            {step}
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex-1 mx-1 h-2 rounded-full overflow-hidden ${
              index < currentStep ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
            }`}
          >
            {index === currentStep - 1 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              />
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-gray-600 text-center">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}

// Telemetry tracking helper
async function trackEvent(type: string, payload?: Record<string, any>) {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        payload: payload || {},
        ts: Date.now()
      })
    });
  } catch (e) {
    console.warn('[Telemetry] Failed to track event:', e);
  }
}

export default function CinematicOnboarding() {
  const s = useOnboarding();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Track page view
  useEffect(() => {
    if (userLoaded) {
      trackEvent('onboarding_viewed', {
        step: s.step,
        userId: user?.id || 'anonymous',
        dealerUrl: s.dealerUrl || null
      });
      setIsLoading(false);
    }
  }, [userLoaded, user?.id, s.step, s.dealerUrl]);

  // Track step changes
  useEffect(() => {
    if (userLoaded && !isLoading) {
      trackEvent('onboarding_step_changed', {
        step: s.step,
        userId: user?.id || 'anonymous',
        dealerUrl: s.dealerUrl || null
      });
    }
  }, [s.step, userLoaded, user?.id, s.dealerUrl, isLoading]);

  // Redirect to sign-in if not authenticated (optional - can be removed for public onboarding)
  // Uncomment if you want to require authentication
  // useEffect(() => {
  //   if (userLoaded && !user) {
  //     router.push('/sign-in?redirect_url=/onboarding');
  //   }
  // }, [userLoaded, user, router]);

  const handleScan = async () => {
    if (!s.dealerUrl) return;
    
    setIsScanning(true);
    s.decScan();
    
    // Track scan start
    await trackEvent('onboarding_scan_started', {
      dealerUrl: s.dealerUrl,
      scansLeft: s.scansLeft - 1,
      userId: user?.id || 'anonymous'
    });

    // Simulate scanning animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsScanning(false);
    
    // Track scan complete
    await trackEvent('onboarding_scan_completed', {
      dealerUrl: s.dealerUrl,
      scansLeft: s.scansLeft,
      userId: user?.id || 'anonymous'
    });
    
    s.setStep(2);
  };

  const handleShareUnlock = () => {
    setShowShareModal(true);
    trackEvent('onboarding_share_unlock_clicked', {
      step: s.step,
      userId: user?.id || 'anonymous'
    });
  };

  const handleEmailSubmit = async () => {
    if (!s.email) return;
    
    await trackEvent('onboarding_email_submitted', {
      email: s.email,
      step: s.step,
      userId: user?.id || 'anonymous'
    });
    
    s.setStep(3);
  };

  const handleCompetitorToggle = async (name: string) => {
    const wasSelected = s.competitors.includes(name);
    s.toggleCompetitor(name);
    // Use setTimeout to ensure state has updated
    setTimeout(async () => {
      await trackEvent('onboarding_competitor_toggled', {
        competitor: name,
        selected: !wasSelected,
        totalSelected: s.competitors.length + (wasSelected ? -1 : 1),
        userId: user?.id || 'anonymous'
      });
    }, 0);
  };

  const handleMetricsSave = async () => {
    if (!s.pvr || !s.adExpensePvr) return;
    
    await trackEvent('onboarding_metrics_saved', {
      pvr: Number(s.pvr),
      adExpensePvr: Number(s.adExpensePvr),
      userId: user?.id || 'anonymous'
    });
    
    try {
      const response = await fetch('/api/save-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pvr: Number(s.pvr),
          adExpensePvr: Number(s.adExpensePvr),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save metrics');
      }
      s.setStep(5);
    } catch (error: any) {
      console.error('Failed to save metrics:', error);
      await trackEvent('onboarding_metrics_save_failed', {
        error: error.message,
        userId: user?.id || 'anonymous'
      });
      alert(`Failed to save metrics: ${error.message}. You can continue, but metrics won't be saved.`);
      s.setStep(5);
    }
  };

  const handleComplete = async () => {
    await trackEvent('onboarding_completed', {
      dealerUrl: s.dealerUrl,
      email: s.email,
      competitorsCount: s.competitors.length,
      hasPvr: !!s.pvr,
      userId: user?.id || 'anonymous'
    });
    
    // Mark onboarding as complete
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_complete', 'true');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 p-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12 pt-8"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-black text-white">
              DealershipAI
            </span>
          </div>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </Link>
        </motion.header>

        <ProgressBar currentStep={s.step} totalSteps={5} />

        <AnimatePresence mode="wait">
          {s.step === 1 && (
            <StepShell key="step1" title="Your Dealership URL" step={1}>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Paste your website URL. We'll run a 3-second AI visibility + zero-click scan and build your starter intelligence plan.
              </p>
              <div className="flex gap-3">
                <input
                  className="flex-1 border-2 border-gray-200 focus:border-blue-500 rounded-2xl px-6 py-4 text-lg transition-all outline-none"
                  placeholder="https://yourdealership.com"
                  value={s.dealerUrl}
                  onChange={e => s.setUrl(e.target.value)}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleScan}
                  disabled={!s.dealerUrl || isScanning}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg flex items-center gap-2 disabled:opacity-40 shadow-lg shadow-blue-500/50"
                >
                  {isScanning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  {isScanning ? 'Scanning...' : 'Scan Now'}
                </motion.button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Free scans remaining: {s.scansLeft}</span>
                <span className="text-sm text-blue-600 font-medium">Takes ~3 seconds</span>
              </div>
            </StepShell>
          )}

          {s.step === 2 && (
            <StepShell key="step2" title="Unlock Full Report" step={2}>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Share your AI visibility score to unlock full details, or enter your email to receive the complete PDF report.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShareUnlock}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl flex items-center gap-2 justify-center font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Share2 className="w-5 h-5" />
                  Share to Unlock
                </motion.button>
                <div className="flex gap-3">
                  <input
                    className="flex-1 border-2 border-gray-200 focus:border-blue-500 rounded-2xl px-5 py-4 transition-all outline-none"
                    placeholder="you@dealership.com"
                    type="email"
                    value={s.email}
                    onChange={e => s.setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && s.email) {
                        handleEmailSubmit();
                      }
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEmailSubmit}
                    disabled={!s.email}
                    className="px-6 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-2xl hover:bg-blue-50 transition-colors disabled:opacity-40"
                  >
                    Email Me
                  </motion.button>
                </div>
              </div>
              {!user && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Want to save your progress?</strong> Sign in with Clerk SSO to sync your data across devices.
                  </p>
                  <SignInButton mode="modal">
                    <button className="text-sm text-blue-600 font-semibold hover:underline">
                      Sign in with SSO →
                    </button>
                  </SignInButton>
                </div>
              )}
            </StepShell>
          )}

          {s.step === 3 && (
            <StepShell key="step3" title="Select Competitors (Optional)" step={3}>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Choose 3–5 competitors to track. We'll monitor their AI visibility and alert you when they appear in recommendations.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {['Naples Honda', 'Terry Reid Hyundai', 'Germain Toyota of Naples', 'Crown Nissan', 'Classic Honda'].map((name, index) => (
                  <motion.label
                    key={name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      s.competitors.includes(name)
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mr-3 w-5 h-5"
                      checked={s.competitors.includes(name)}
                      onChange={() => handleCompetitorToggle(name)}
                    />
                    <span className="font-medium">{name}</span>
                  </motion.label>
                ))}
              </div>
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => s.setStep(4)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl flex items-center gap-2 font-semibold shadow-lg shadow-purple-500/50"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </StepShell>
          )}

          {s.step === 4 && (
            <StepShell key="step4" title="Business Metrics (PVR)" step={4}>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Help us personalize your dashboard with your monthly PVR (Parts, Vehicle, Repair) revenue and advertising spend.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Monthly PVR Revenue ($)
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-2xl px-6 py-4 text-lg transition-all outline-none"
                    placeholder="e.g., 500,000"
                    value={s.pvr || ''}
                    onChange={e => s.setPvr?.(e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Total monthly revenue from Parts, Vehicle sales, and Repair services
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Monthly Ad Expense PVR ($)
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-2xl px-6 py-4 text-lg transition-all outline-none"
                    placeholder="e.g., 50,000"
                    value={s.adExpensePvr || ''}
                    onChange={e => s.setAdExpensePvr?.(e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Monthly advertising spend across all channels
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMetricsSave}
                  disabled={!s.pvr || !s.adExpensePvr}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl flex items-center gap-2 font-semibold disabled:opacity-40 shadow-lg shadow-purple-500/50"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </StepShell>
          )}

          {s.step === 5 && (
            <StepShell key="step5" title="Setup Complete!" step={5}>
              <div className="flex items-center gap-3 text-green-700 mb-6 bg-green-50 p-4 rounded-2xl">
                <Check className="w-6 h-6" />
                <span className="font-semibold">Your metrics have been saved successfully!</span>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                <p className="text-blue-900 leading-relaxed">
                  <strong>🎬 Cinematic Experience Ahead:</strong> You'll experience a stunning onboarding sequence with System Acknowledgment → Orchestrator Ready → Pulse Assimilation → Dashboard
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/preview"
                  className="block"
                  onClick={handleComplete}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl flex items-center gap-2 justify-center font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    🚀 Launch Orchestrator
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                </Link>
                <Link
                  href={`/dashboard?dealer=${encodeURIComponent(s.dealerUrl || 'demo')}`}
                  className="block"
                  onClick={handleComplete}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-5 border-2 border-gray-300 rounded-2xl flex items-center justify-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Skip to Dashboard
                  </motion.div>
                </Link>
              </div>
            </StepShell>
          )}
        </AnimatePresence>
      </div>

      {/* Share Unlock Modal */}
      <ShareUnlockModal
        open={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          // Auto-advance after sharing
          if (s.step === 2) {
            setTimeout(() => s.setStep(3), 500);
          }
        }}
        featureName="Full Report"
      />
      </main>
    </ErrorBoundary>
  );
}
