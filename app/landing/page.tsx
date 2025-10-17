'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Brain, Search, Sparkles, Shield, Gauge, LineChart, CheckCircle2 } from 'lucide-react';
import { EnhancedTextRotator } from '@/app/components/TextRotator';

export default function DealershipAILanding() {
  const platforms = [
    'ChatGPT',
    'Gemini', 
    'Perplexity',
    'AI Overviews',
    'Copilot'
  ];

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white">
      {/* ====== Brand Tokens (replace with Drive brand standards) ====== */}
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
          
          /* Enhanced text rotator animations */
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `,
        }}
      />

      {/* ====== Header ====== */}
      <header className="sticky top-0 z-40 border-b border-[var(--brand-border)]/70 bg-[var(--brand-bg)]/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg" style={{ background: 'var(--brand-gradient)' }} />
            <div className="text-lg font-semibold tracking-tight">dealership<span className="font-bold" style={{ color: 'var(--brand-primary)' }}>AI</span></div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#results" className="hover:text-white">Results</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/auth/signin" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
              Sign In
            </a>
            <a href="#scan" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium glass hover:bg-white/10">
              Run Free Scan <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ====== Hero ====== */}
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
                <span className="block">
                  <EnhancedTextRotator 
                    texts={platforms}
                    interval={3000}
                    className="inline-block bg-clip-text text-transparent font-bold"
                    showDot={true}
                  />
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

                     <form
                       className="mt-8 glass rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2"
                       onSubmit={(e) => {
                         e.preventDefault();
                         const url = (e.currentTarget as any).elements.dealerUrl.value?.trim();
                         if (!url) return;
                         // Redirect to OAuth sign-in with domain parameter for analysis
                         window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`/intelligence?domain=${encodeURIComponent(url)}`)}`;
                       }}
                     >
                <input
                  name="dealerUrl"
                  type="url"
                  required
                  placeholder="www.yourdealership.com"
                  className="flex-1 bg-transparent outline-none px-3 py-3 text-sm placeholder:text-white/40"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  Analyze My Dealership <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Enhanced Calculator Integration */}
              <div className="mt-6">
                <a
                  href="/auth/signin?callbackUrl=%2Fintelligence%3Fmode%3Dcalculator"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold glass hover:bg-white/10 transition-all duration-200"
                >
                  🧮 Calculate My Opportunity <ArrowRight className="w-4 h-4" />
                </a>
              </div>

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

      {/* ====== Credibility Strip ====== */}
      <section className="border-t border-[var(--brand-border)]/70">
        <div className="mx-auto max-w-7xl px-5 py-10 grid sm:grid-cols-3 gap-4 text-center text-white/70 text-xs">
          <div>Bi-weekly AI model checks</div>
          <div>Evidence-backed citations & schema</div>
          <div>Cost-guarded orchestration <span className="text-white/40">(≤$0.15/rooftop/mo)</span></div>
        </div>
      </section>

      {/* ====== How it works ====== */}
      <section id="how" className="py-16">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="text-2xl font-semibold mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                t: 'Probe the models',
                d: 'Normalize buyer intents then sample ChatGPT, Gemini, Perplexity, and Google AIO.',
                i: <Brain className="w-5 h-5 text-[var(--brand-primary)]" />,
              },
              {
                t: 'Score & verify',
                d: 'Blend real responses with public signals (schema, GBP, site speed) for calibrated truth.',
                i: <Shield className="w-5 h-5 text-[var(--brand-primary)]" />,
              },
              {
                t: 'Fix the gaps',
                d: 'One-click JSON-LD, FAQ hubs, review responder, and geo-entity optimization.',
                i: <Sparkles className="w-5 h-5 text-[var(--brand-primary)]" />,
              },
            ].map((c) => (
              <div key={c.t} className="glass rounded-2xl p-5">
                <div className="w-9 h-9 rounded-lg grid place-items-center bg-white/5 mb-3">{c.i}</div>
                <div className="font-semibold">{c.t}</div>
                <div className="text-sm text-white/70 mt-1">{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Results ====== */}
      <section id="results" className="py-16 border-t border-[var(--brand-border)]/70">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="text-2xl font-semibold mb-6">Expected outcomes</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { k: 'AI Mentions', v: '+25–45%' },
              { k: 'Zero-Click Coverage', v: '+18–35%' },
              { k: 'Review Response', v: '→ 80%+' },
              { k: 'Revenue Recovered', v: '$60–150K/mo' },
            ].map((m) => (
              <div key={m.k} className="glass rounded-2xl p-5">
                <div className="text-sm text-white/60">{m.k}</div>
                <div className="text-xl font-semibold">{m.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-xs text-white/40">Ranges based on prior launches; your live scan sets the baseline.</div>
        </div>
      </section>

      {/* ====== Pricing (PLG) ====== */}
      <section id="pricing" className="py-16 border-t border-[var(--brand-border)]/70">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="text-2xl font-semibold mb-6">Simple plans</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: 'Level 1',
                price: 'Free',
                bullets: ['AI scan', 'Evidence report', 'Fix list'],
                cta: 'Run Free Scan',
                href: '#scan',
              },
              {
                name: 'Level 2',
                price: '$499/mo',
                bullets: ['Bi-weekly checks', 'Auto-responses', 'Schema generator'],
                cta: 'Start Trial',
                href: '/signup?plan=l2',
              },
              {
                name: 'Level 3',
                price: '$999/mo',
                bullets: ['Enterprise guardrails', 'Multi-rooftop', 'SLA & SSO'],
                cta: 'Talk to Sales',
                href: '/contact',
              },
            ].map((p, i) => (
              <div key={p.name} className={`glass rounded-2xl p-6 ${i === 1 ? 'ring-1 ring-[var(--brand-primary)]/50' : ''}`}>
                <div className="text-sm text-white/60">{p.name}</div>
                <div className="mt-1 text-3xl font-semibold">{p.price}</div>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {b}
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href === '#scan' ? '#scan' : `/auth/signin?callbackUrl=${encodeURIComponent(`/intelligence?plan=${p.name.toLowerCase().replace(' ', '-')}`)}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section id="faq" className="py-16 border-t border-[var(--brand-border)]/70">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-2xl font-semibold mb-6">FAQ</h2>
          <div className="space-y-3">
            {[
              ['What signals power the score?', 'Live AI model checks plus public signals: schema, GBP, site performance.'],
              ['Will this replace my SEO agency?', 'No. It makes them effective in AI contexts and stops ad spillage.'],
              ['How fast do results show up?', 'First lifts often within 30 days once fixes are deployed.'],
            ].map(([q, a]) => (
              <details key={q} className="glass rounded-xl p-4">
                <summary className="cursor-pointer text-sm font-semibold">{q}</summary>
                <p className="mt-2 text-sm text-white/70">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Footer ====== */}
      <footer className="border-t border-[var(--brand-border)]/70">
        <div className="mx-auto max-w-7xl px-5 py-10 text-sm text-white/60 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} dealershipAI | Kai Nomura</div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="mailto:kainomura@dealershipai.com?subject=Contact%20from%20DealershipAI%20Website&body=Hi%20Kai,%0A%0AI%20found%20your%20contact%20information%20on%20the%20DealershipAI%20website%20and%20would%20like%20to%20get%20in%20touch.%0A%0APlease%20let%20me%20know%20how%20I%20can%20reach%20you.%0A%0ABest%20regards," className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}