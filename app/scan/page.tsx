'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Brain, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface ScanResult {
  domain: string;
  vai: number;
  piqr: number;
  hrp: number;
  qai: number;
  revenueAtRisk: number;
  recommendations: string[];
  status: 'scanning' | 'complete' | 'error';
}

export default function FreeScanPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsScanning(true);
    setScanResult({
      domain: domain.trim(),
      vai: 0,
      piqr: 0,
      hrp: 0,
      qai: 0,
      revenueAtRisk: 0,
      recommendations: [],
      status: 'scanning'
    });

    try {
      // Simulate AI scanning process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate realistic demo results
      const mockResult: ScanResult = {
        domain: domain.trim(),
        vai: Math.floor(Math.random() * 40) + 35, // 35-75%
        piqr: Math.floor(Math.random() * 30) + 50, // 50-80%
        hrp: Math.random() * 0.3 + 0.1, // 0.1-0.4
        qai: Math.floor(Math.random() * 25) + 60, // 60-85%
        revenueAtRisk: Math.floor(Math.random() * 50000) + 20000, // $20K-$70K
        recommendations: [
          'Optimize ChatGPT visibility with structured data',
          'Improve Google AI Overview presence',
          'Enhance Perplexity citation coverage',
          'Add FAQ schema markup',
          'Implement review response automation'
        ],
        status: 'complete'
      };

      setScanResult(mockResult);
    } catch (error) {
      setScanResult(prev => prev ? { ...prev, status: 'error' } : null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpgrade = (plan: 'professional' | 'enterprise') => {
    // Store scan results in session for upgrade flow
    if (scanResult) {
      sessionStorage.setItem('scanResult', JSON.stringify(scanResult));
    }
    router.push(`/signup?plan=${plan}&domain=${encodeURIComponent(domain)}`);
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
        `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--brand-border)]/70 bg-[var(--brand-bg)]/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg" style={{ background: 'var(--brand-gradient)' }} />
            <div className="text-lg font-semibold tracking-tight">dealership<span className="font-bold" style={{ color: 'var(--brand-primary)' }}>AI</span></div>
          </div>
          <a href="/" className="text-sm text-white/70 hover:text-white">← Back to Home</a>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12">
        {!scanResult ? (
          /* Scan Form */
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full glass mb-6">
              <Brain className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
              Free AI Visibility Scan
            </div>
            
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
              Discover Your AI Visibility Gap
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Get an instant analysis of how your dealership appears in ChatGPT, Gemini, Perplexity, and Google AI Overviews. 
              See exactly what revenue you're missing and how to fix it.
            </p>

            <form onSubmit={handleScan} className="max-w-lg mx-auto">
              <div className="glass rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="url"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="www.yourdealership.com"
                  className="flex-1 bg-transparent outline-none px-3 py-3 text-sm placeholder:text-white/40"
                  required
                />
                <button
                  type="submit"
                  disabled={isScanning}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      Start Free Scan <Search className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              <div className="text-xs text-white/50">Free scan. No credit card. Takes 30 seconds.</div>
            </form>

            {/* Trust Indicators */}
            <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="glass rounded-xl p-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-semibold">Instant Results</div>
                <div className="text-xs text-white/60">Get your AI visibility score in seconds</div>
              </div>
              <div className="glass rounded-xl p-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-semibold">Actionable Insights</div>
                <div className="text-xs text-white/60">Specific recommendations to improve</div>
              </div>
              <div className="glass rounded-xl p-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-semibold">Revenue Impact</div>
                <div className="text-xs text-white/60">See exactly what you're missing</div>
              </div>
            </div>
          </div>
        ) : scanResult.status === 'scanning' ? (
          /* Scanning State */
          <div className="text-center">
            <div className="glass rounded-2xl p-8 max-w-md mx-auto">
              <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Analyzing Your AI Visibility</h2>
              <p className="text-white/70 text-sm mb-4">
                Scanning {scanResult.domain} across AI platforms...
              </p>
              <div className="space-y-2 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Checking ChatGPT mentions
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Analyzing Gemini citations
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Testing Perplexity coverage
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 text-[var(--brand-primary)] animate-spin" />
                  Evaluating Google AI Overviews
                </div>
              </div>
            </div>
          </div>
        ) : scanResult.status === 'error' ? (
          /* Error State */
          <div className="text-center">
            <div className="glass rounded-2xl p-8 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Scan Failed</h2>
              <p className="text-white/70 text-sm mb-4">
                We couldn't analyze {scanResult.domain}. Please check the URL and try again.
              </p>
              <button
                onClick={() => setScanResult(null)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                style={{ backgroundImage: 'var(--brand-gradient)' }}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full glass mb-4">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Scan Complete
              </div>
              <h1 className="text-3xl font-semibold mb-2">
                AI Visibility Report for {scanResult.domain}
              </h1>
              <p className="text-white/70">
                Here's what we found and how to improve your AI presence
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[var(--brand-primary)] mb-1">
                  {scanResult.vai}%
                </div>
                <div className="text-sm text-white/60">AI Visibility Index</div>
                <div className="text-xs text-white/40 mt-1">ChatGPT + Gemini + Perplexity</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  {scanResult.piqr}%
                </div>
                <div className="text-sm text-white/60">Perplexity IQ Rating</div>
                <div className="text-xs text-white/40 mt-1">Citation quality score</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {scanResult.hrp.toFixed(2)}
                </div>
                <div className="text-sm text-white/60">High-Risk Probability</div>
                <div className="text-xs text-white/40 mt-1">Missing AI opportunities</div>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-red-400 mb-1">
                  ${(scanResult.revenueAtRisk / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-white/60">Revenue at Risk</div>
                <div className="text-xs text-white/40 mt-1">Monthly potential loss</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Priority Recommendations</h3>
              <div className="space-y-3">
                {scanResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-[var(--brand-primary)]">{index + 1}</span>
                    </div>
                    <div className="text-sm text-white/80">{rec}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="glass rounded-2xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to Fix These Issues?</h3>
              <p className="text-white/70 mb-6">
                Get automated monitoring, implementation tools, and priority support to maximize your AI visibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => handleUpgrade('professional')}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  Start Level 2 Trial - $499/mo <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpgrade('enterprise')}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold border border-[var(--brand-border)] hover:bg-white/5"
                >
                  Talk to Sales - $999/mo
                </button>
              </div>
              <div className="mt-3 text-xs text-white/50">
                14-day free trial • Cancel anytime • No setup fees
              </div>
            </div>

            {/* Demo Access */}
            <div className="glass rounded-2xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Want to See More?</h3>
              <p className="text-white/70 mb-4">
                Explore our full dashboard with detailed analytics and competitor comparisons.
              </p>
              <button
                onClick={() => router.push('/demo')}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border border-[var(--brand-border)] hover:bg-white/5"
              >
                View Demo Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
