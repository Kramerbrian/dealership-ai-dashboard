'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Brain, Search, Sparkles, Shield, Gauge, LineChart, CheckCircle2, MapPin, Target, TrendingUp, Zap } from 'lucide-react';
import { EnhancedTextRotator } from '@/app/components/TextRotator';
import { useGeoPersonalization } from '@/hooks/useGeoPersonalization';
import EnhancedAIOpportunityCalculator from '@/app/components/calculator/EnhancedAIOpportunityCalculator';

export default function EnhancedDealershipAILanding() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [userDomain, setUserDomain] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { 
    location, 
    marketAnalysis, 
    loading: geoLoading, 
    error: geoError, 
    getCurrentLocation, 
    analyzeMarket 
  } = useGeoPersonalization({ autoDetect: true });

  const platforms = [
    'ChatGPT',
    'Gemini', 
    'Perplexity',
    'AI Overviews',
    'Copilot'
  ];

  const handleDomainSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const domain = formData.get('dealerUrl') as string;
    
    if (!domain) return;
    
    // Validate URL format
    const isValidUrl = (url: string) => {
      try {
        // Add https:// if no protocol
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        new URL(fullUrl);
        return true;
      } catch {
        return false;
      }
    };
    
    if (!isValidUrl(domain)) {
      alert('Please enter a valid website URL (e.g., www.yourdealership.com)');
      return;
    }
    
    setUserDomain(domain);
    setIsAnalyzing(true);
 const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: domain,
        revenue: 100000,
        marketSize: 'medium',
        competition: 'moderate',
         }),
      });
      
      if (!response.ok) {
        throw new Error('Scan failed');
      }
      
      const scanResult = await response.json();
      
   // Store the analysis result for the calculator
 
 setIsAnalyzing(false);
    }
  };

  const handleCalculateOpportunity = async () => {
    if (location) {
      setShowCalculator(true);
    } else {
      // Try to get location first
      await getCurrentLocation();
      if (location) {
        setShowCalculator(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white">
      {/* ====== Brand Tokens ====== */}
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
            <div className="h-8 w-8 rounded-lg grid place-items-center bg-white/5">
              <Brain className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <div className="text-lg font-semibold">dealershipAI</div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-sm text-white/70 hover:text-white transition-colors">About</a>
            <a href="/sign-in" className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Sign In</a>
          </nav>
        </div>
      </header>

      {/* ====== Hero Section ====== */}
      <section id="scan" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 via-transparent to-[var(--brand-accent)]/5" />
        
        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full glass mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                Algorithmic Trust Dashboard
              </div>
              
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Be visible where shoppers actually decide:
                <span className="block bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
                  <EnhancedTextRotator
                    texts={platforms}
                    interval={3000}
                    className="inline-block"
                    showDot={true}
                  />
                </span>
              </h1>
              
              <p className="mt-4 text-white/70 max-w-xl">
                We audit and lift your AI visibility, then convert it into real leads and lower ad waste. Zero-click ready. Dealer-proof simple.
              </p>

              {/* Personalized Greeting */}
              {marketAnalysis && (
                <div className="mt-6 p-4 glass rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                    <MapPin className="w-4 h-4" />
                    Personalized for {formatLocation(marketAnalysis)}
                  </div>
                  <p className="text-sm text-white/80">
                    {getPersonalizedGreeting(marketAnalysis)}
                  </p>
                </div>
              )}

              {/* Domain Input Form */}
              <form
                className="mt-8 glass rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2"
                onSubmit={handleDomainSubmit}
              >
                <input
                  name="dealerUrl"
                  type="text"
                  required
                  placeholder="www.yourdealership.com"
                  className="flex-1 bg-transparent outline-none px-3 py-3 text-sm placeholder:text-white/40"
                />
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze My Dealership <Search className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Enhanced Calculator CTA */}
              <div className="mt-6">
                <button
                  onClick={handleCalculateOpportunity}
                  disabled={geoLoading}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold glass hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
                >
                  {geoLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      🧮 Calculate My Opportunity <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 text-xs text-white/50">
                Free scan. No credit card. 20s setup.
                {marketAnalysis && (
                  <span className="block mt-1 text-blue-400">
                    📍 Personalized for {formatLocation(marketAnalysis)}
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 blur-3xl opacity-30" style={{ backgroundImage: 'var(--brand-gradient)', boxShadow: 'var(--brand-glow)' }} />
              <div className="relative glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg grid place-items-center bg-white/5">
                    <Brain className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">AI Visibility Index</div>
                    <div className="text-xs text-white/60">Real-time analysis</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Overall Score</span>
                    <span className="text-lg font-bold text-[var(--brand-primary)]">87.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">QAI Score</span>
                    <span className="text-sm font-semibold text-emerald-400">92.1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">PIQR Risk</span>
                    <span className="text-sm font-semibold text-orange-400">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">OVI Score</span>
                    <span className="text-sm font-semibold text-blue-400">78.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Market Insights Section ====== */}
      {marketAnalysis && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold mb-4">
                Your Local Market Opportunity
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Based on our analysis of {formatLocation(marketAnalysis)}, here are the key opportunities we've identified for your dealership.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Market Overview */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Market Overview</h3>
                    <p className="text-sm text-white/60">{marketAnalysis.market.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">Market Type</span>
                    <span className="text-sm font-medium capitalize">{marketAnalysis.market.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">Population</span>
                    <span className="text-sm font-medium">{marketAnalysis.market.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">Median Income</span>
                    <span className="text-sm font-medium">${marketAnalysis.market.medianIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">Competition</span>
                    <span className="text-sm font-medium capitalize">{marketAnalysis.market.competitionLevel}</span>
                  </div>
                </div>
              </div>

              {/* Automotive Market */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Automotive Market</h3>
                    <p className="text-sm text-white/60">Local dealership landscape</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">Dealerships</span>
                    <span className="text-sm font-medium">{marketAnalysis.automotive.dealerships}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">Avg Inventory</span>
                    <span className="text-sm font-medium">{marketAnalysis.automotive.averageInventory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">Market Share</span>
                    <span className="text-sm font-medium">{marketAnalysis.automotive.marketShare}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-white/60">Local Preferences:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {marketAnalysis.automotive.localPreferences.slice(0, 2).map((pref, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Opportunity */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Opportunity</h3>
                    <p className="text-sm text-white/60">Local AI adoption</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">AI Adoption</span>
                    <span className="text-sm font-medium capitalize">{marketAnalysis.aiOpportunity.localAIOdoption}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">Avg Competitor AI</span>
                    <span className="text-sm font-medium">{marketAnalysis.aiOpportunity.competitorAIScores.average}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/70">AI Range</span>
                    <span className="text-sm font-medium">
                      {marketAnalysis.aiOpportunity.competitorAIScores.range.min}-{marketAnalysis.aiOpportunity.competitorAIScores.range.max}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-white/60">Key Opportunities:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {marketAnalysis.aiOpportunity.localOpportunities.slice(0, 2).map((opp, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                        {opp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====== Calculator Modal ====== */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCalculator(false)} />
            <div className="relative w-full max-w-7xl bg-[var(--brand-bg)] rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold">
                    AI-Enhanced Opportunity Calculator
                  </h2>
                  {marketAnalysis && (
                    <p className="text-sm text-white/60 mt-1">
                      Personalized for {formatLocation(marketAnalysis)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto">
                <EnhancedAIOpportunityCalculator />
              </div>
            </div>
          </div>
        </div>
      )}

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
