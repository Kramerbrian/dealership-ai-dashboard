'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import DecayBanner from '@/components/plg/DecayBanner';
import SessionCounter from '@/components/plg/SessionCounter';
import GeoPoolingDemo from '@/components/plg/GeoPoolingDemo';
import LiveActivityFeed from '@/components/plg/LiveActivityFeed';
import TrustBadge from '@/components/plg/TrustBadge';

const InstantAnalyzer = dynamic(
  () => import('@/components/plg/InstantAnalyzer'),
  { ssr: false }
);

export default function Landing() {
  const [dealer, setDealer] = useState('');
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(3);

  useEffect(() => {
    const saved = Number(localStorage.getItem('plg_scans_left') || '3');
    setLeft(saved);
  }, []);

  const run = () => {
    const next = Math.max(0, left - 1);
    setLeft(next);
    localStorage.setItem('plg_scans_left', String(next));
    setOpen(true);
    
    // Track event
    if (typeof window !== 'undefined' && (window as any).plg?.track) {
      (window as any).plg.track('scan_started', { dealer });
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <DecayBanner />
      <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white grid place-items-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold">DealershipAI</div>
          </div>
          <div className="flex items-center gap-3">
            <TrustBadge />
            <Link
              href="/dashboard"
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="flex-1 grid place-items-center p-6">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            See how trusted your dealership looks to AI — in 3 seconds
          </h1>
          <p className="text-gray-600 max-w-3xl mb-6">
            Run a zero-click + AI visibility scan, get a score out of 100, see
            your revenue at risk, and trigger fixes instantly.
          </p>
          <div className="flex items-center gap-3 mb-4">
            <input
              className="flex-1 rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourdealership.com"
              value={dealer}
              onChange={(e) => setDealer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && run()}
            />
            <button
              onClick={run}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg transition-shadow"
            >
              <Zap className="w-4 h-4" />
              Run 3-sec Scan
            </button>
            <Link
              href={`/dashboard?dealer=${encodeURIComponent(dealer || 'demo-dealer')}`}
              className="px-5 py-3 rounded-xl border flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              View Dashboard
            </Link>
          </div>
          <SessionCounter count={left} />
        </div>
      </section>

      {open && (
        <InstantAnalyzer
          dealer={dealer || 'demo-dealer'}
          onClose={() => setOpen(false)}
        />
      )}

      <section className="py-16">
        <GeoPoolingDemo />
      </section>

      <section className="py-8">
        <LiveActivityFeed />
      </section>

      <footer className="border-t border-gray-200 bg-white/80">
        <div className="max-w-6xl mx-auto p-6 text-sm text-gray-600 flex justify-between">
          <div>© {new Date().getFullYear()} DealershipAI</div>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

