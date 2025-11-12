'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

// Minimal brand palette hook
const useBrand = (domain: string) => {
  const hue = domain ? (domain.charCodeAt(0) * 7) % 360 : 210;
  return {
    accent: `hsl(${hue}, 70%, 55%)`,
    soft: `hsl(${hue}, 60%, 45%)`
  };
};

// Unified continuity system
const Continuity = ({ phase }: { phase: 'enter' | 'exit' | null }) => {
  const { accent } = useBrand(typeof window !== 'undefined' ? localStorage.getItem('dai:dealer') ?? '' : '');
  
  return (
    <AnimatePresence>
      {phase && (
        <motion.div
          className="fixed inset-0 z-[90] pointer-events-none"
          initial={{ opacity: phase === 'enter' ? 1 : 0 }}
          animate={{ opacity: phase === 'enter' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          style={{
            background: `radial-gradient(circle, ${accent}30, rgba(0,0,0,${phase === 'enter' ? 0.9 : 0.95}) 80%)`
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default function DealershipAILanding() {
  const router = useRouter();
  const { user } = useUser();
  const [stage, setStage] = useState<'intro' | 'hero' | 'analyzing'>('intro');
  const [dealer, setDealer] = useState('');
  const [phase, setPhase] = useState<'enter' | 'exit' | null>('enter');
  const { accent, soft } = useBrand(dealer);

  useEffect(() => {
    const t1 = setTimeout(() => setStage('hero'), 1800);
    const t2 = setTimeout(() => setPhase(null), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer) return;
    localStorage.setItem('dai:dealer', dealer);
    
    // Nolan zoom on analysis trigger
    setStage('analyzing');
    setTimeout(() => {
      setPhase('exit');
      setTimeout(() => router.push('/onboarding'), 800);
    }, 1400);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <Continuity phase={phase} />

      {/* Nolan intro */}
      <AnimatePresence>
        {stage === 'intro' && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
          >
            <motion.div
              className="w-44 h-44 rounded-full border-2 border-white/20 flex items-center justify-center"
              animate={{ scale: [0.8, 1.15, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-lg tracking-wider text-zinc-300">DealershipAI</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyzing zoom */}
      <AnimatePresence>
        {stage === 'analyzing' && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50"
            initial={{ scale: 1 }}
            animate={{ scale: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
          >
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div 
                className="w-32 h-32 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: accent }}
              >
                <span className="text-sm tracking-wider text-zinc-300">Analyzing</span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${accent}` }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <motion.div
              className="mt-8 text-zinc-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Scanning AI visibility across 5 platforms...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      {stage === 'hero' && (
        <main className="relative z-10 mx-auto max-w-6xl px-6 py-28 text-center">
          <div
            className="absolute inset-0 opacity-40 blur-[160px]"
            style={{ background: `radial-gradient(circle, ${accent}25, transparent 80%)` }}
          />
          
          <motion.h1
            className="text-4xl md:text-6xl font-semibold leading-tight bg-gradient-to-r text-transparent bg-clip-text"
            style={{ backgroundImage: `linear-gradient(90deg, ${soft}, ${accent})` }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Bloomberg Terminal<br />for Automotive AI Visibility
          </motion.h1>

          <motion.p
            className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            When ChatGPT doesn't know you exist, you might as well be selling horse carriages.
          </motion.p>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <input
              type="text"
              value={dealer}
              onChange={(e) => setDealer(e.target.value)}
              placeholder="yourdealership.com"
              className="w-full sm:w-96 px-4 py-3 rounded-full text-sm bg-zinc-900/70 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2"
              style={{ borderColor: soft }}
            />

            {user ? (
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-sm font-medium text-white transition-transform hover:scale-105"
                style={{ background: `linear-gradient(90deg, ${soft}, ${accent})` }}
              >
                Analyze My Visibility →
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-6 py-3 rounded-full text-sm font-medium text-white transition-transform hover:scale-105"
                  style={{ background: `linear-gradient(90deg, ${soft}, ${accent})` }}
                >
                  Start Free Scan →
                </button>
              </SignInButton>
            )}
          </motion.form>

          {/* Social proof */}
          <motion.div
            className="mt-12 text-sm text-zinc-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex justify-center gap-8 mb-4">
              <div><span className="text-2xl font-semibold text-white">$142K</span><br/>Avg. Monthly Loss</div>
              <div><span className="text-2xl font-semibold text-white">73%</span><br/>Dealers Invisible</div>
              <div><span className="text-2xl font-semibold text-white">15s</span><br/>Scan Time</div>
            </div>
          </motion.div>

          {/* Mini preview */}
          <motion.div
            className="mt-20 rounded-2xl border border-white/10 bg-zinc-900/40 p-8 shadow-inner backdrop-blur"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-left">
              {[
                { label: 'AI Visibility', score: 47, color: '#ef4444' },
                { label: 'Zero-Click Shield', score: 62, color: '#f59e0b' },
                { label: 'UGC Health', score: 71, color: '#eab308' },
                { label: 'Geo Trust', score: 84, color: '#22c55e' },
                { label: 'SGP Integrity', score: 58, color: '#f59e0b' }
              ].map((metric) => (
                <div key={metric.label} className="relative">
                  <div className="text-xs text-zinc-500 mb-2">{metric.label}</div>
                  <div className="text-3xl font-semibold" style={{ color: metric.color }}>
                    {metric.score}
                  </div>
                  <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: metric.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.score}%` }}
                      transition={{ delay: 1.5, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center text-sm text-zinc-400">
              Live demo data • Your actual scores revealed in 15 seconds
            </div>
          </motion.div>
        </main>
      )}

      {/* Footer */}
      <footer className="absolute bottom-0 w-full py-8 text-center text-xs text-zinc-600">
        <div className="mb-2">Trusted by dealer groups managing $2.3B+ in annual revenue</div>
        <div>© {new Date().getFullYear()} DealershipAI • The AI Visibility Operating System</div>
      </footer>
    </div>
  );
}
