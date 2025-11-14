'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, TrendingUp, Shield, Zap, Eye } from 'lucide-react';
import Link from 'next/link';

type MarketPulseData = {
  dealer: string;
  timestamp: string;
  aiv: number;
  ati: number;
  metrics: {
    schemaCoverage: number;
    trustScore: number;
    cwv: number;
    ugcHealth: number;
    geoIntegrity: number;
    zeroClick: number;
  };
  summary: string;
  confidence: number;
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dealer = searchParams.get('dealer') || '';
  const [data, setData] = useState<MarketPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanStep, setScanStep] = useState(0);
  const [introDone, setIntroDone] = useState(false);

  const scanSteps = [
    { label: 'Analyzing dealership visibility...', icon: Eye },
    { label: 'Schema accuracy: Calculating...', icon: Shield },
    { label: 'Trust confidence: Measuring...', icon: TrendingUp },
    { label: 'Competitor rank: Analyzing...', icon: Zap },
    { label: 'Calibration complete', icon: CheckCircle },
  ];

  // Cinematic intro
  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch KPI data
  useEffect(() => {
    if (!dealer) {
      router.push('/');
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/marketpulse/compute?dealer=${encodeURIComponent(dealer)}`);
        const result = await res.json();
        setData(result);

        // Animate scan steps
        for (let i = 0; i < scanSteps.length; i++) {
          setTimeout(() => {
            setScanStep(i);
            if (i === scanSteps.length - 1) {
              setTimeout(() => setLoading(false), 1000);
            }
          }, i * 800);
        }
      } catch (err) {
        console.error('Failed to fetch market pulse:', err);
        setLoading(false);
      }
    }

    fetchData();
  }, [dealer]);

  // Extract dealership name from URL
  const dealerName = dealer
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('.')[0]
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <main className="min-h-screen bg-[#0a0f14] text-white overflow-hidden relative font-sans">
      {/* Christopher Nolan cinematic intro */}
      <AnimatePresence>
        {!introDone && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            initial={{ scale: 1.2, opacity: 1 }}
            animate={{ scale: 1.02, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="text-3xl md:text-5xl font-semibold tracking-tight text-cyan-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              DealershipAI
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none" />

      {/* Diagnostic Scan Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-4xl mx-auto w-full">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">
              Good morning, {dealerName || 'Dealership'}.
            </h1>
            <p className="text-xl text-white/70">
              Let's protect your next{' '}
              <span className="text-cyan-400 font-semibold">
                ${data ? Math.round(data.metrics.trustScore * 1000).toLocaleString() : '18,450'}{' '}
                in revenue.
              </span>
            </p>
          </motion.div>

          {/* Scan Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 mb-8"
          >
            {loading ? (
              <div className="space-y-6">
                {scanSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = scanStep >= index;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-cyan-500/20 border-2 border-cyan-500'
                            : 'bg-white/5 border-2 border-white/10'
                        }`}
                      >
                        {isActive && index < scanSteps.length - 1 ? (
                          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                        ) : isActive ? (
                          <CheckCircle className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Icon className="w-5 h-5 text-white/30" />
                        )}
                      </div>
                      <span className="text-lg">{step.label}</span>
                      {isActive && index < scanSteps.length - 1 && data && index === 1 && (
                        <span className="ml-auto text-cyan-400 font-semibold">
                          {Math.round(data.metrics.schemaCoverage * 100)}%
                        </span>
                      )}
                      {isActive && index < scanSteps.length - 1 && data && index === 2 && (
                        <span className="ml-auto text-cyan-400 font-semibold">
                          {Math.round(data.metrics.trustScore * 100)}%
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-3 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-4xl font-bold text-cyan-400">
                        {data ? Math.round(data.aiv * 100) : 88}%
                      </div>
                      <div className="text-sm text-white/60">AI Visibility Index</div>
                    </div>
                    <div className="text-left">
                      <div className="text-4xl font-bold text-emerald-400">
                        {data ? Math.round(data.ati * 100) : 82}%
                      </div>
                      <div className="text-sm text-white/60">Algorithmic Trust</div>
                    </div>
                  </div>
                  <p className="text-white/70 text-lg">{data?.summary || 'All systems nominal.'}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* CTA */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <Link
                href={`/dash?dealer=${encodeURIComponent(dealer)}`}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg hover:opacity-90 transition-all"
              >
                Activate Pulse Dashboard
                <TrendingUp className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}

