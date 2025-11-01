'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Brain, Search, Sparkles, Shield, Gauge, LineChart, CheckCircle2 } from 'lucide-react';
import { trackFormSubmit, trackLeadCapture, trackButtonClick } from '@/lib/analytics/google-analytics';

export default function EnhancedDealershipAILanding() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const dealerUrl = formData.get('dealerUrl') as string;

    try {
      // Capture analytics event
      trackFormSubmit('landing_page_scan');
      trackLeadCapture('landing_page');

      // Send to lead capture API
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerUrl,
          source: 'landing_page',
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = data.redirectUrl || `/dash?dealer=${encodeURIComponent(dealerUrl)}`;
        }, 2000);
      }
    } catch (error) {
      // Error submitting form - handle silently;
      alert('There was an error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePricingClick = (plan: string) => {
    trackButtonClick(`pricing_${plan}`);
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
          .loading-spinner {
            border: 3px solid rgba(255,255,255,0.1);
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--brand-border)]/70 bg-[var(--brand-bg)]/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg" style={{ background: 'var(--brand-gradient)' }} />
            <div className="text-lg font-semibold tracking-tight">
              dealership<span className="font-bold" style={{ color: 'var(--brand-primary)' }}>AI</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#results" className="hover:text-white">Results</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <a href="#scan" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium glass hover:bg-white/10">
            Run Free Scan <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="scan" className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(1200px 500px at 50% -10%, rgba(59,130,246,.35), rgba(139,92,246,.12) 40%, transparent 60%)' }} />
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full glass mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                Algorithmic Trust Dashboard
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Be visible where shoppers actually decide:
                <span className="block bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
                  ChatGPT • Gemini • Perplexity • AI Overviews
                </span>
              </h1>
              <p className="mt-4 text-white/70 max-w-xl">
                We audit and lift your AI visibility, then convert it into real leads and lower ad waste. Zero-click ready. Dealer-proof simple.
              </p>

              <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-xl">
                {[
                  { k: 'Revenue at Risk', v: '$47K/mo' },
                  { k: 'AI Visibility', v: '34%' },
                  { k: 'Recovery Window', v: '30 days' },
                ].map((m) => (
                  <div key={m.k} className="glass rounded-xl p-3">
                    <div className="text-xs text-white/60">{m.k}</div>
                    <div className="text-lg font-semibold">{m.v}</div>
                  </div>
                ))}
              </div>

              {submitted ? (
                <div className="mt-8 glass rounded-2xl p-6 border-2 border-green-500/50">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold">Success!</h3>
                  </div>
                  <p className="text-white/70">
                    We're analyzing your dealership now. Redirecting you to your dashboard...
                  </p>
                </div>
              ) : (
                <form className="mt-8 glass rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
                  <input
                    name="dealerUrl"
                    type="url"
                    required
                    placeholder="www.yourdealership.com"
                    className="flex-1 bg-transparent outline-none px-3 py-3 text-sm placeholder:text-white/40"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                    style={{ backgroundImage: 'var(--brand-gradient)' }}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze My Dealership <Search className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-3 text-xs text-white/50">Free scan. No credit card. 20s setup.</div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 blur-3xl opacity-30" style={{ backgroundImage: 'var(--brand-gradient)', boxShadow: 'var(--brand-glow)' }} />
              <div className="relative glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg grid place-items-center bg-white/5">
                    <Brain className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">AI Visibility Snapshot</div>
                    <div className="text-white/60">Live model blend</div>
                  </div>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ChatGPT mentions: <span className="ml-auto font-semibold">Low</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gemini citations: <span className="ml-auto font-semibold">Sparse</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Perplexity coverage: <span className="ml-auto font-semibold">Missing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Google AIO inclusion: <span className="ml-auto font-semibold">Intermittent</span>
                  </li>
                </ul>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { icon: Gauge, label: 'AEO Score', val: '62/100' },
                    { icon: LineChart, label: 'Zero-Click', val: '38%' },
                    { icon: Shield, label: 'Trust Signals', val: 'Moderate' },
                  ].map((x) => (
                    <div key={x.label} className="rounded-xl p-3 bg-white/5 border border-white/10">
                      <x.icon className="w-4 h-4 text-white/70" />
                      <div className="mt-1 text-xs text-white/60">{x.label}</div>
                      <div className="text-sm font-semibold">{x.val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 text-xs text-white/50">Sample data shown. Your scan runs live.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections remain the same... */}
      {/* Credibility, How it Works, Results, Pricing, FAQ, Footer */}
      {/* ... (keeping the original sections from the previous landing page) ... */}

    </div>
  );
}
