'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Shield, Users, MapPin, Database, Search, Eye, Zap, 
  DollarSign, Trophy, AlertTriangle, CheckCircle, ArrowRight, Star,
  BarChart3, Lock, Unlock, Clock, Target, Award, MessageSquare,
  PlayCircle, FileText, Sparkles, Brain, Radio, Activity, Menu, X
} from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { TextRotator } from '@/components/ui/TextRotator';

// DealershipAI Logo Component
const DealershipAILogo = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const dimensions = {
    sm: { width: 120, height: 32, text: "text-sm" },
    default: { width: 180, height: 42, text: "text-base" },
    lg: { width: 240, height: 56, text: "text-xl" }
  };
  
  const dim = dimensions[size];
  
  return (
    <div className="flex items-center gap-3">
      <svg width={dim.height} height={dim.height} viewBox="0 0 48 48" fill="none">
        {/* AI Brain Icon */}
        <circle cx="24" cy="24" r="20" fill="url(#brain-gradient)" fillOpacity="0.2" />
        <circle cx="24" cy="24" r="20" stroke="url(#brain-gradient)" strokeWidth="2" />
        
        {/* Neural Network Pattern */}
        <circle cx="24" cy="16" r="3" fill="url(#brain-gradient)" />
        <circle cx="16" cy="28" r="3" fill="url(#brain-gradient)" />
        <circle cx="32" cy="28" r="3" fill="url(#brain-gradient)" />
        <circle cx="24" cy="32" r="3" fill="url(#brain-gradient)" />
        
        <line x1="24" y1="19" x2="16" y2="25" stroke="url(#brain-gradient)" strokeWidth="2" />
        <line x1="24" y1="19" x2="32" y2="25" stroke="url(#brain-gradient)" strokeWidth="2" />
        <line x1="16" y1="28" x2="24" y2="29" stroke="url(#brain-gradient)" strokeWidth="2" />
        <line x1="32" y1="28" x2="24" y2="29" stroke="url(#brain-gradient)" strokeWidth="2" />
        
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col">
        <span className={`${dim.text} font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent`}>
          DealershipAI
        </span>
        <span className="text-[10px] text-gray-400 -mt-1">AI Visibility Intelligence</span>
      </div>
    </div>
  );
};

export default function DealershipAI17SectionPremium() {
  const { isSignedIn, user } = useUser();
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [decayTax, setDecayTax] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll effect for sticky nav
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Decay tax counter
  useEffect(() => {
    const interval = setInterval(() => {
      setDecayTax(prev => prev + 0.23);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 3000);
  };

  const demoDealer = {
    name: "Lou Grubbs Motors",
    location: "Chicago, IL",
    scores: { overall: 64, ai: 58, zeroClick: 45, ugc: 72, geo: 68, sgp: 61 },
    monthlyLoss: 45200,
    rank: 3
  };

  const competitors = [
    { name: "Selleck Motors", location: "Temecula, CA", score: 78, from: "The Goods" },
    { name: "LaRusso Auto", location: "Reseda, CA", score: 71, from: "Cobra Kai" },
    { name: "Lou Grubbs Motors", location: "Chicago, IL", score: 64, from: "Demo", isUser: true },
    { name: "Toby's Honest Used Cars", location: "Mesa, AZ", score: 52, from: "Used Cars" },
    { name: "Rudy Russo's Lot", location: "Mesa, AZ", score: 48, from: "Used Cars" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      
      {/* STICKY NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/95 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl shadow-purple-500/10' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <DealershipAILogo size="sm" />
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm hover:text-purple-400 transition-colors">Features</a>
              <a href="#pricing" className="text-sm hover:text-purple-400 transition-colors">Pricing</a>
              <a href="#case-studies" className="text-sm hover:text-purple-400 transition-colors">Case Studies</a>
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal" redirectUrl="/dashboard">
                    <button className="px-4 py-2 text-purple-300 hover:text-purple-200 rounded-lg text-sm font-semibold transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal" redirectUrl="/onboarding">
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-semibold hover:scale-105 transition-transform">
                      Get Started
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <a href="/dashboard" className="px-4 py-2 text-purple-300 hover:text-purple-200 rounded-lg text-sm font-semibold transition-colors">
                    Dashboard
                  </a>
                  <UserButton afterSignOutUrl="/" />
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
              <a href="#features" className="block py-2 hover:text-purple-400 transition-colors">Features</a>
              <a href="#pricing" className="block py-2 hover:text-purple-400 transition-colors">Pricing</a>
              <a href="#case-studies" className="block py-2 hover:text-purple-400 transition-colors">Case Studies</a>
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal" redirectUrl="/dashboard">
                    <button className="w-full px-4 py-2 text-purple-300 hover:text-purple-200 rounded-lg font-semibold">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal" redirectUrl="/onboarding">
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold">
                      Get Started
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <a href="/dashboard" className="block py-2 hover:text-purple-400 transition-colors">Dashboard</a>
                  <div className="flex justify-center">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* SECTION 1: HERO + INSTANT AUDIT */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-32">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm animate-fade-in">
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-sm">Live: <span className="font-semibold text-purple-300">847 dealerships</span> being analyzed</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight animate-fade-in-up">
            Stop Being Invisible<br />to AI Car Shoppers
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <TextRotator 
              phrases={['ChatGPT', 'Google Gemini', 'Google AI Overviews', 'Perplexity']}
              interval={2500}
              className="text-purple-400 font-semibold"
            />{' '}
            are recommending your competitors.<br />
            <span className="text-purple-400 font-semibold">Find out why in 30 seconds</span> (no signup required)
          </p>

          {/* Video Demo Section */}
          <div className="max-w-3xl mx-auto mb-12 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border border-purple-500/30 bg-slate-900/50">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/demo-60sec.mp4" type="video/mp4" />
                {/* Fallback for browsers that don't support video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                  <div className="text-center text-white">
                    <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Video demo coming soon</p>
                  </div>
                </div>
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <div className="text-sm mb-1 opacity-90">Watch Demo (60 seconds)</div>
                <div className="text-2xl font-bold">See How Lou Grubbs Motors Went From #12 → #1</div>
              </div>
            </div>
          </div>

          {/* Enhanced Instant Audit Form */}
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="p-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl backdrop-blur-sm border border-purple-500/30">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="yourdealership.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-6 py-4 bg-slate-900/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!urlInput || analyzing}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/50"
                >
                  {analyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Free
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                No email required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Instant results
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                See competitors
              </span>
            </p>
          </div>

          {/* Enhanced Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 items-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            {[
              { icon: Users, label: "500+ Dealerships", sublabel: "Nationwide" },
              { icon: Activity, label: "5 AI Platforms", sublabel: "Tracked 24/7" },
              { icon: Target, label: "99.9% Accuracy", sublabel: "Verified Daily" }
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-purple-500/20 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all group">
                <badge.icon className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-sm font-semibold">{badge.label}</div>
                  <div className="text-xs text-gray-400">{badge.sublabel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full p-1">
              <div className="w-1.5 h-3 bg-purple-400 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ENHANCED DECAY TAX COUNTER */}
      <section className="py-16 bg-gradient-to-r from-red-950/50 via-orange-950/50 to-red-950/50 border-y border-red-500/30 backdrop-blur-sm relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-slate-900/30 border border-red-500/30 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-red-500/20 rounded-2xl border border-red-500/30">
                <AlertTriangle className="w-12 h-12 text-red-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-red-400 mb-2">Real-Time Revenue Loss</h3>
                <p className="text-gray-300 text-lg">Every second your dealership is invisible to AI...</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-6xl font-bold text-red-400 font-mono tabular-nums mb-2">
                ${decayTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-400">Lost since you landed on this page</p>
              <p className="text-xs text-red-300 mt-1">≈ ${(decayTax * 0.23).toFixed(2)}/second</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ENHANCED PROBLEM AMPLIFICATION */}
      <section className="py-32 px-4 relative">
        {/* Background Gradient Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm font-semibold mb-6">
              THE CRISIS
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              The $45K/Month Problem<br />Nobody's Talking About
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              While you're optimizing for Google, 67% of car shoppers are asking ChatGPT, Gemini, Perplexity, and Google AI Overviews which dealer to visit. <span className="text-red-400 font-semibold">And they're not finding you.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: "AI Invisibility Crisis",
                stat: "67%",
                gradient: "from-red-500 to-orange-500",
                desc: "of car shoppers use AI before visiting dealerships",
                impact: "You're losing 2 out of 3 potential customers"
              },
              {
                icon: DollarSign,
                title: "Revenue Hemorrhage",
                stat: "$45K",
                gradient: "from-orange-500 to-yellow-500",
                desc: "average monthly loss per dealership",
                impact: "That's 16 vehicles you didn't sell"
              },
              {
                icon: Trophy,
                title: "Competitor Advantage",
                stat: "3.4x",
                gradient: "from-yellow-500 to-red-500",
                desc: "more likely to be recommended if optimized",
                impact: "They're taking your customers"
              }
            ].map((problem, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl" 
                     style={{background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`}}></div>
                <div className="relative p-8 bg-slate-900/50 border border-red-500/20 rounded-2xl backdrop-blur-sm hover:border-red-500/50 transition-all hover:scale-105 hover:-translate-y-1">
                  <div className={`p-4 bg-gradient-to-br ${problem.gradient} bg-opacity-20 rounded-xl inline-block mb-6`}>
                    <problem.icon className="w-12 h-12 text-red-400" />
                  </div>
                  <div className={`text-5xl font-bold bg-gradient-to-r ${problem.gradient} bg-clip-text text-transparent mb-4`}>
                    {problem.stat}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{problem.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{problem.desc}</p>
                  <div className="pt-4 border-t border-red-500/20">
                    <p className="text-sm font-semibold text-red-300">{problem.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: ENHANCED RESULTS (when visible) */}
      {showResults && (
        <section className="py-32 px-4 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold mb-6">
                ANALYSIS COMPLETE
              </div>
              <h2 className="text-5xl font-bold mb-4">Your AI Visibility Score</h2>
              <p className="text-gray-300">Real-time analysis of {demoDealer.name}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Enhanced Score Card */}
              <div className="p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl backdrop-blur-md hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">{demoDealer.name}</h3>
                    <p className="text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {demoDealer.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {demoDealer.scores.overall}
                    </div>
                    <p className="text-sm text-gray-400">out of 100</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "AI Visibility", score: demoDealer.scores.ai, locked: false, color: "from-purple-500 to-pink-500" },
                    { label: "Zero-Click Shield", score: demoDealer.scores.zeroClick, locked: true, color: "from-blue-500 to-purple-500" },
                    { label: "UGC Health", score: demoDealer.scores.ugc, locked: true, color: "from-green-500 to-blue-500" },
                    { label: "Geo Trust", score: demoDealer.scores.geo, locked: true, color: "from-yellow-500 to-green-500" },
                    { label: "SGP Integrity", score: demoDealer.scores.sgp, locked: true, color: "from-pink-500 to-yellow-500" }
                  ].map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium group-hover:text-purple-400 transition-colors">{item.label}</span>
                        {item.locked ? (
                          <Lock className="w-4 h-4 text-gray-500" />
                        ) : (
                          <span className="font-semibold text-lg">{item.score}</span>
                        )}
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.locked ? 'bg-gray-600 blur-sm' : `bg-gradient-to-r ${item.color}`} transition-all`}
                          style={{ width: `${item.locked ? 60 : item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-red-950/50 to-orange-950/50 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                      <DollarSign className="w-10 h-10 text-red-400" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-400">
                        ${demoDealer.monthlyLoss.toLocaleString()}<span className="text-lg">/mo</span>
                      </div>
                      <p className="text-sm text-gray-400">Estimated revenue loss from AI invisibility</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Upgrade CTA */}
              <div className="p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-blue-500/50 rounded-2xl backdrop-blur-md flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 text-center mb-8">
                  <div className="inline-block p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-4">
                    <Lock className="w-16 h-16 text-blue-400" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">Unlock Full Analysis</h3>
                  <p className="text-gray-300 text-lg">See all 5 pillars + actionable fixes</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    "Detailed breakdown of each pillar",
                    "AI citability score (why you're being skipped)",
                    "Competitor comparison matrix",
                    "30-day action plan with ROI projections",
                    "Mystery shop transcript analysis"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2 group">
                  Create Free Account 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-center text-gray-400 mt-4">
                  No credit card • 14-day free trial • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 15: ENHANCED PRICING */}
      <section className="py-32 px-4 relative" id="pricing">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-semibold mb-6">
              PRICING
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Choose Your Arsenal</h2>
            <p className="text-xl text-gray-300">Start free, upgrade when you're hooked (you will be)</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "Free",
                price: "$0",
                period: "",
                sessions: "5 scans/month",
                description: "Perfect for trying us out",
                features: [
                  "Basic AI visibility score",
                  "Competitive leaderboard access",
                  "UGC health tracking",
                  "Email alerts",
                  "Limited historical data"
                ],
                cta: "Start Free",
                popular: false,
                gradient: "from-gray-500 to-slate-600"
              },
              {
                name: "Pro",
                price: "$499",
                period: "/month",
                sessions: "200 sessions/month",
                description: "For serious dealers",
                features: [
                  "Everything in Free, plus:",
                  "Full 5-pillar breakdown",
                  "E-E-A-T detailed scoring",
                  "Competitor intelligence",
                  "30-day action plans",
                  "Priority support",
                  "API access"
                ],
                cta: "Start 14-Day Trial",
                popular: true,
                gradient: "from-purple-600 to-pink-600"
              },
              {
                name: "Enterprise",
                price: "$999",
                period: "/month",
                sessions: "Unlimited sessions",
                description: "White-glove service",
                features: [
                  "Everything in Pro, plus:",
                  "Mystery Shop AI",
                  "Custom query library",
                  "Multi-location support",
                  "White-label reports",
                  "Dedicated success manager",
                  "Custom integrations"
                ],
                cta: "Book Demo",
                popular: false,
                gradient: "from-blue-600 to-purple-600"
              }
            ].map((tier, i) => (
              <div key={i} className={`relative group ${tier.popular ? 'md:scale-110 md:shadow-2xl' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <div className={`p-8 rounded-2xl backdrop-blur-md transition-all border-2 ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500 shadow-xl shadow-purple-500/50' 
                    : 'bg-slate-900/50 border-purple-500/20 hover:border-purple-500/50'
                }`}>
                  
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl font-bold">{tier.price}</span>
                      <span className="text-gray-400">{tier.period}</span>
                    </div>
                    <div className="text-sm text-gray-400">{tier.sessions}</div>
                  </div>
                  
                  <button className={`w-full px-6 py-3 rounded-xl font-semibold mb-6 transition-all ${
                    tier.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}>
                    {tier.cta}
                  </button>

                  <div className="space-y-3">
                    {tier.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-400">
              All plans include 14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER with Logo */}
      <footer className="py-16 px-4 border-t border-purple-500/20 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <DealershipAILogo size="default" />
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="hover:text-purple-400 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-purple-400 transition-colors">Terms</a>
              <a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400">
            © 2025 DealershipAI. All rights reserved. Making dealerships visible in the AI age.
          </div>
        </div>
      </footer>

    </div>
  );
}

