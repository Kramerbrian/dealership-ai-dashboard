"use client";

import { useState, useEffect } from "react";
import InstantAnalyzer from "@/components/landing/instant-analyzer";
import InstantResults from "@/components/landing/instant-results";
import ShareModal from "@/components/landing/share-modal";
import DecayTaxBanner from "@/components/landing/decay-tax-banner";
import BlurredSection from "@/components/landing/blurred-section";
import ReferralIncentive from "@/components/landing/referral-incentive";
import ThemeToggle from "@/components/landing/theme-toggle";
import { getRemainingAnalyses } from "@/lib/plg-utilities";

export default function LandingPage() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<any>(null);
  const [showShare, setShowShare] = useState(false);
  const [remaining, setRemaining] = useState(3);

  useEffect(() => {
    setRemaining(getRemainingAnalyses());
  }, []);

  const handleAnalyze = async (inputDomain: string) => {
    setDomain(inputDomain);
    // Trigger analysis API call
    const response = await fetch(`/api/analyze?domain=${encodeURIComponent(inputDomain)}`);
    const data = await response.json();
    setResults(data);
    setRemaining(getRemainingAnalyses());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="DealershipAI" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DealershipAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            {remaining > 0 && (
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {remaining} free {remaining === 1 ? "analysis" : "analyses"} left
              </span>
            )}
            <ThemeToggle />
            <a
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Decay Tax Banner */}
      <DecayTaxBanner />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            Invisible online? That's cute—if it were 1998.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            See how AI platforms (ChatGPT, Perplexity, Claude) see your dealership. 
            Get your AI Visibility Score in 30 seconds.
          </p>
        </div>

        <InstantAnalyzer onAnalyze={handleAnalyze} remaining={remaining} />
      </section>

      {/* Results Section */}
      {results && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <InstantResults domain={domain} results={results} onShare={() => setShowShare(true)} />
        </section>
      )}

      {/* Blurred Pro Section */}
      <BlurredSection />

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-600 dark:text-slate-400">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-slate-600 dark:text-slate-400">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>3 free analyses</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Basic AI visibility score</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Platform breakdown</span>
              </li>
            </ul>
            <button className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Get Started
            </button>
          </div>

          {/* Pro - Most Popular */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 relative transform scale-105">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white">
                ⭐ Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$599</span>
              <span className="text-white/80">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-white/90">
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Unlimited analyses</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Full AI visibility suite</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Competitive tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span>
                <span>Auto-fix recommendations</span>
              </li>
            </ul>
            <button className="w-full px-4 py-3 rounded-lg bg-white text-purple-600 font-bold hover:bg-slate-100 transition-colors">
              Start Pro Trial
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$999</span>
              <span className="text-slate-600 dark:text-slate-400">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>API access</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>White-label option</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Dedicated CSM</span>
              </li>
            </ul>
            <button className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Referral Incentive */}
      <ReferralIncentive />

      {/* Share Modal */}
      {showShare && <ShareModal domain={domain} onClose={() => setShowShare(false)} />}
    </div>
  );
}

