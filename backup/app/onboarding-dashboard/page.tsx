'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBrandPalette } from '@/lib/hooks/useBrandHue';

/**
 * DealershipAI Onboarding — Cinematic + Personalized
 * --------------------------------------------------
 * 1. Reads Clerk user + search params (dealer, role, aiv, ati)
 * 2. Fetches real KPI data via /api/marketpulse/compute
 * 3. Collects Gross PVR + Ad Expense PVR
 * 4. Animates "System Scan" → "Calibration" → "Launch"
 */

export default function OnboardingPage() {
  const { user } = useUser();
  const { isLoaded } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<'scan' | 'input' | 'summary'>('scan');
  const [dealer, setDealer] = useState(
    params.get('dealer') || (user?.publicMetadata?.dealer as string) || ''
  );
  const [role, setRole] = useState(
    (params.get('role') || (user?.publicMetadata?.role as string) || 'GM') as string
  );
  const [kpi, setKpi] = useState<{ aiv: number; ati: number } | null>(null);
  const [pvr, setPvr] = useState<number | null>(null);
  const [adPvr, setAdPvr] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const { accent, accentSoft } = useBrandPalette(dealer);

  // Fetch KPI data
  useEffect(() => {
    if (!dealer || !isLoaded) return;

    const fetchKpi = async () => {
      try {
        const res = await fetch(
          `/api/marketpulse/compute?dealer=${encodeURIComponent(dealer)}`
        );
        const data = await res.json();
        setKpi({
          aiv: Number(data.aiv ?? 0.86),
          ati: Number(data.ati ?? 0.83),
        });
      } catch {
        setKpi({ aiv: 0.84, ati: 0.81 });
      } finally {
        setLoading(false);
        setTimeout(() => setStep('input'), 1800);
      }
    };

    fetchKpi();
  }, [dealer, isLoaded]);

  // Save to Clerk metadata once both values filled
  useEffect(() => {
    if (user && pvr && adPvr && step === 'summary') {
      user.update({
        publicMetadata: {
          ...user.publicMetadata,
          dealer,
          role,
          pvr,
          adPvr,
          onboardingComplete: true,
          lastOnboardedAt: new Date().toISOString(),
        },
      }).catch(console.error);
    }
  }, [pvr, adPvr, user, dealer, role, step]);

  function handleFinish() {
    router.push('/preview/orchestrator');
  }

  // Role-adaptive copy
  const roleCopy: Record<string, { greeting: string; description: string }> = {
    GM: {
      greeting: "We'll calculate how much revenue clarity protects.",
      description: 'To estimate ROI and detect optimization potential, we need your current profitability benchmarks.',
    },
    Marketing: {
      greeting: "Let's map your visibility funnel.",
      description: 'Help us understand your current marketing efficiency to optimize AI visibility.',
    },
    'Digital Ops': {
      greeting: "We'll measure how your integrations affect visibility.",
      description: 'Calibrate your technical baseline to identify optimization opportunities.',
    },
  };

  const copy = roleCopy[role] || roleCopy.GM;

  return (
    <main
      className="min-h-screen bg-[#0a0f14] text-white relative overflow-hidden font-sans"
      style={{
        background: `radial-gradient(circle at 50% 20%, ${accent}15, transparent 70%)`,
      }}
    >
      {/* Tron Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${accent}12, transparent 70%)`,
        }}
      />

      {/* Cinematic container */}
      <div className="max-w-3xl mx-auto px-6 pt-32 space-y-10 text-center relative z-10">
        <AnimatePresence mode="wait">
          {step === 'scan' && (
            <motion.section
              key="scan"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <motion.h1
                className="text-3xl md:text-4xl font-semibold"
                style={{ color: accentSoft }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                Scanning {dealer || 'your dealership'}...
              </motion.h1>
              <motion.div
                className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              >
                <motion.div
                  className="h-1.5"
                  style={{
                    background: `linear-gradient(90deg, ${accent}, ${accentSoft})`,
                  }}
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              {kpi && (
                <p className="text-sm text-zinc-400 mt-3">
                  AIV {Math.round(kpi.aiv * 100)}% · ATI {Math.round(kpi.ati * 100)}%
                </p>
              )}
            </motion.section>
          )}

          {step === 'input' && (
            <motion.section
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-semibold">Calibrate your baseline</h2>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto">{copy.description}</p>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Average Gross Profit per Vehicle (PVR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2750"
                    value={pvr ?? ''}
                    onChange={(e) => setPvr(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                    style={{ borderColor: accent + '40' }}
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Advertising Expense per Vehicle (Ad Expense PVR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 350"
                    value={adPvr ?? ''}
                    onChange={(e) => setAdPvr(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                    style={{ borderColor: accent + '40' }}
                  />
                </div>

                <motion.button
                  onClick={() => setStep('summary')}
                  disabled={!pvr || !adPvr}
                  className={`w-full mt-6 px-6 py-3 rounded-full font-medium text-sm transition ${
                    pvr && adPvr
                      ? 'text-white hover:opacity-90'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                  style={
                    pvr && adPvr
                      ? {
                          background: `linear-gradient(90deg, ${accent}, ${accentSoft})`,
                        }
                      : {}
                  }
                >
                  Continue
                </motion.button>
              </div>
            </motion.section>
          )}

          {step === 'summary' && (
            <motion.section
              key="summary"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-semibold">Calibration complete</h2>
              <p className="text-zinc-400 text-sm">
                Welcome, {user?.firstName || 'Dealer'} — your visibility and profitability baseline
                is ready.
              </p>

              <div className="grid grid-cols-2 gap-4 text-center mt-8">
                <MetricCard
                  label="AI Visibility"
                  value={`${Math.round((kpi?.aiv ?? 0) * 100)}%`}
                  accent={accent}
                />
                <MetricCard
                  label="Algorithmic Trust"
                  value={`${Math.round((kpi?.ati ?? 0) * 100)}%`}
                  accent={accent}
                />
                <MetricCard
                  label="Gross PVR"
                  value={`$${pvr?.toLocaleString()}`}
                  accent={accent}
                />
                <MetricCard
                  label="Ad Expense PVR"
                  value={`$${adPvr?.toLocaleString()}`}
                  accent={accent}
                />
              </div>

              <motion.button
                onClick={handleFinish}
                className="mt-8 px-6 py-3 rounded-full text-white font-medium hover:opacity-90"
                style={{
                  background: `linear-gradient(90deg, ${accent}, ${accentSoft})`,
                }}
              >
                Launch Dashboard →
              </motion.button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <motion.div
      className="rounded-2xl border bg-white/5 p-4"
      style={{ borderColor: accent + '40' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-sm text-zinc-400 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </motion.div>
  );
}

