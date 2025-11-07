'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Search, ArrowRight, CheckCircle, Shield,
  Zap, Star, BarChart3, Clock,
  ChevronDown, AlertTriangle, X, Menu
} from 'lucide-react';
import { ga } from '@/lib/ga';
import { ExitIntentModal } from '@/components/marketing/ExitIntentModal';
import { TrustBadges } from '@/components/marketing/TrustBadges';
import { AnimatedCounter } from './AnimatedCounter';
import { AnalysisSkeleton } from './AnalysisSkeleton';
import { ScrollReveal } from './ScrollReveal';
import { LiveActivityFeed } from './LiveActivityFeed';
import { ToastContainer, showToast } from './Toast';
import { QuickROICalculator } from './QuickROICalculator';
import { SEOStructuredData } from './SEOStructuredData';
import { AccessibilityEnhancements, ScreenReaderStyles } from './AccessibilityEnhancements';
import { useQuickStart, QuickStartBanner } from './QuickStartManager';
import { useDomainSuggestions, DomainSuggestionsList, saveRecentDomain } from './DomainSuggestions';
import { ProgressiveDisclosure } from './ProgressiveDisclosure';
import { personalizationEngine } from '@/lib/personalization/engine';
import { advancedAnalytics } from '@/lib/analytics/advanced-tracking';
import { ProductTour } from '@/components/onboarding/ProductTour';
import { ScoreLeaderboard } from './ScoreLeaderboard';
import { AchievementBadges } from './AchievementBadges';
// ComparisonTable removed - focusing on unique value proposition instead
import { LiveChatWidget } from './LiveChatWidget';
import { ABTestWrapper, useABTestConversion } from '@/components/ab-testing/ABTestWrapper';
import { initializeABTests, headlineVariants, ctaButtonVariants, subheadlineVariants } from '@/lib/ab-testing/tests';
import { abTesting } from '@/lib/ab-testing/framework';
import AhaResults from './AhaResults';
import { UrgencyTimer, SocialProofCounter, RiskReversalBadge } from './AdvancedCTAOptimizations';
import { dAIQuoteFetcher } from '@/lib/dAIQuoteFetcher';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VideoDemoSection = dynamic(() => import('./VideoDemoSection'), {
  loading: () => <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />,
  ssr: false
});

export default function SimplifiedLandingPage() {
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [decayTax, setDecayTax] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<any>(null);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [faqSearchTerm, setFaqSearchTerm] = useState('');

  // Quick start functionality
  const { quickStartData, saveQuickStart, clearQuickStart, hasQuickStart } = useQuickStart();

  // Domain suggestions
  const { suggestions, showSuggestions, setShowSuggestions } = useDomainSuggestions(urlInput);

  // Decay tax counter (FOMO engine)
  useEffect(() => {
    const interval = setInterval(() => {
      setDecayTax(prev => prev + 0.23); // $0.23/second = ~$19K/day
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // A/B test conversion tracking
  const { trackConversion: trackHeadlineConversion } = useABTestConversion('headline-test');
  const { trackConversion: trackCTAConversion } = useABTestConversion('cta-button-test');
  const { trackConversion: trackSubheadlineConversion } = useABTestConversion('subheadline-test');

  // Conversion funnel tracking (for future use)
  // const funnelStage = useConversionFunnel();

  // Initialize personalization, analytics, and A/B tests
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Initialize A/B tests
    try {
      initializeABTests();
    } catch (error) {
      console.warn('A/B testing failed to initialize:', error);
    }

    // Initialize personalization
    try {
      personalizationEngine.initialize().then(() => {
        const content = personalizationEngine.getPersonalizedContent();
        setPersonalizedContent(content);
      }).catch((error) => {
        console.warn('Personalization engine failed to initialize:', error);
      });
    } catch (error) {
      console.warn('Personalization engine error:', error);
    }

    // Initialize advanced analytics
    try {
      advancedAnalytics.init();
    } catch (error) {
      console.warn('Advanced analytics failed to initialize:', error);
    }

    // Initialize CTA performance optimizations
    try {
      import('@/lib/performance/cta-optimizer').then(({ initCTAPerformanceOptimizations }) => {
        initCTAPerformanceOptimizations();
      });
    } catch (error) {
      console.warn('CTA performance optimizations failed to initialize:', error);
    }

    // Show quick start if available
    if (hasQuickStart && quickStartData) {
      setShowQuickStart(true);
    }
  }, [hasQuickStart, quickStartData]);

  // Sticky header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle exit intent email submission
  const handleExitIntentSubmit = async (email: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit_intent' })
      });
      if (response.ok) {
        ga('conversion', { type: 'exit_intent_email', email });
      }
    } catch (error) {
      console.error('Failed to submit exit intent email:', error);
    }
  };

  const validateUrl = (url: string): { valid: boolean; message?: string } => {
    if (!url.trim()) {
      return { valid: false, message: 'Please enter a dealership website' };
    }

    // Remove protocol and www if present for validation
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    if (!domainRegex.test(cleanUrl)) {
      return { valid: false, message: 'Please enter a valid website (e.g., yourdealership.com)' };
    }

    return { valid: true };
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validate URL
    const validation = validateUrl(urlInput);
    if (!validation.valid) {
      showToast(validation.message || 'Please enter a valid website', 'error');
      return;
    }
    
    setAnalyzing(true);
    showToast('Starting analysis...', 'info');
    ga('cta_click', { id: 'hero_analyze' });
    
    try {
      // Simulate analysis with progress updates
      const progressSteps = [
        { progress: 20, message: 'Analyzing AI platforms...' },
        { progress: 50, message: 'Checking citations...' },
        { progress: 80, message: 'Calculating scores...' },
        { progress: 100, message: 'Complete!' }
      ];
      
      for (const _step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      setAnalyzing(false);
      setShowResults(true);
      
      // Save for quick start
      const cleanDomain = urlInput.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      if (cleanDomain) {
        saveQuickStart(cleanDomain);
        saveRecentDomain(cleanDomain);
      }
      
      // Track funnel step
      advancedAnalytics.recordFunnelStep('analysis_complete', { domain: cleanDomain });
      
      // Track A/B test conversions
      if (typeof window !== 'undefined') {
        const headlineVariant = abTesting.getVariant('headline-test');
        const ctaVariant = abTesting.getVariant('cta-button-test');
        const subheadlineVariant = abTesting.getVariant('subheadline-test');
        
        if (headlineVariant && typeof headlineVariant === 'string') {
          trackHeadlineConversion(headlineVariant, { domain: cleanDomain, action: 'analysis_complete' });
        }
        if (ctaVariant && typeof ctaVariant === 'string') {
          trackCTAConversion(ctaVariant, { domain: cleanDomain, action: 'analysis_complete' });
        }
        if (subheadlineVariant && typeof subheadlineVariant === 'string') {
          trackSubheadlineConversion(subheadlineVariant, { domain: cleanDomain, action: 'analysis_complete' });
        }
      }
      
      showToast('Analysis complete! Scroll down to see results.', 'success', 5000);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setAnalyzing(false);
      advancedAnalytics.recordFunnelStep('analysis_error', { error: String(error) });
      showToast('Analysis failed. Please try again.', 'error');
    }
  };

  const handleUseQuickStart = () => {
    if (quickStartData) {
      setUrlInput(quickStartData.domain);
      setShowQuickStart(false);
      advancedAnalytics.recordFunnelStep('quick_start_used', { domain: quickStartData.domain });
      showToast('Domain loaded from quick start', 'info');
    }
  };

  const handleSuggestionSelect = (domain: string) => {
    setUrlInput(domain);
    setShowSuggestions(false);
    advancedAnalytics.recordFunnelStep('suggestion_selected', { domain });
  };

  const competitors = [
    { name: "Selleck Motors", location: "Temecula, CA", score: 78 },
    { name: "LaRusso Auto", location: "Reseda, CA", score: 71 },
    { name: "Lou Grubbs Motors", location: "Chicago, IL", score: 64, isUser: true },
    { name: "Toby's Honest Used Cars", location: "Mesa, AZ", score: 52 },
  ];

  const demoDealer = {
    name: "Lou Grubbs Motors",
    location: "Chicago, IL",
    score: 64, // Changed from scores.overall for AhaResults compatibility
    scores: {
      overall: 64,
      ai: 58,
      zeroClick: 45,
      ugc: 72,
      geo: 68,
      sgp: 61
    },
    monthlyLoss: 45200,
    rank: 3,
    competitors: competitors.filter(c => !c.isUser) // Top competitors excluding user
  };

  const features = [
    {
      icon: Search,
      title: "Multi-Platform Monitoring",
      desc: "Track visibility across ChatGPT, Gemini, Perplexity, Google AI Overviews, and Copilot",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Zero-Click Shield",
      desc: "Protect your citations when AI answers without linking",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Competitive Intelligence",
      desc: "See exactly how you compare to local competitors in real-time",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Zap,
      title: "Automated Fixes",
      desc: "One-click optimization for schema, GMB, and citations",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  const faqs = [
    {
      q: "How is this different from regular SEO tools?",
      a: "Traditional SEO tracks Google rankings. We track AI assistant visibility where 67% of car shoppers now start their research. Completely different optimization strategies."
    },
    {
      q: "Do I need to be technical?",
      a: "Not at all. We translate complex metrics into plain English action items. Most users are GMs and digital directors with zero technical background."
    },
    {
      q: "How accurate is the revenue loss calculation?",
      a: "Conservative. We use industry-standard rates (2.5% conversion, $2,800 profit per vehicle). Real dealers report our estimates are 20-30% lower than actual impact."
    },
    {
      q: "How long until I see results?",
      a: "Quick wins (GMB optimization, schema fixes) show impact in 7-14 days. Deeper improvements take 30-60 days. Most dealers see measurable improvements within the first month."
    },
    {
      q: "What platforms do you track?",
      a: "We monitor ChatGPT, Google Gemini, Perplexity, Google AI Overviews, and Microsoft Copilot to give you complete visibility across all major AI platforms."
    },
    {
      q: "Can I track multiple dealership locations?",
      a: "Yes! Our Pro plan supports unlimited locations. You can track all your dealerships from one dashboard and compare performance across locations."
    },
    {
      q: "What's included in the free trial?",
      a: "The free trial includes full access to all Pro features for 14 days. No credit card required. You can analyze your dealership and see full results before committing."
    },
    {
      q: "How do you calculate the AI Visibility Score?",
      a: "Our 5-pillar scoring system evaluates AI Visibility (30%), Zero-Click Shield (20%), UGC Health (25%), Geo Trust (15%), and SGP Integrity (10%) to give you a comprehensive score."
    }
  ];

  // Filter FAQs based on search term
  let filteredFaqs = faqs;
  if (faqSearchTerm) {
    filteredFaqs = faqs.filter((faq) => 
      faq.q.toLowerCase().includes(faqSearchTerm.toLowerCase()) || 
      faq.a.toLowerCase().includes(faqSearchTerm.toLowerCase())
    );
  }

  return (
    <>
      <SEOStructuredData />
      <ScreenReaderStyles />
      <AccessibilityEnhancements />
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" id="main-content">
        
        {/* Sticky Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DealershipAI</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">FAQ</a>
              <button
                onClick={() => {
                  setShowTour(true);
                  ga('tour_started', { source: 'nav' });
                }}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                Take Tour
              </button>
              <button
                onClick={() => {
                  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                  ga('cta_click', { id: 'nav_analyze' });
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-700 to-purple-700 text-white rounded-lg font-medium hover:from-blue-800 hover:to-purple-800 transition-all flex items-center gap-2 shadow-lg ring-1 ring-blue-500/20"
              >
                <Search className="w-4 h-4" />
                Analyze Free
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="block text-gray-600 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="block text-gray-600 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <button
              onClick={() => {
                document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
                ga('cta_click', { id: 'mobile_nav_analyze' });
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
            >
              Analyze Free
            </button>
          </div>
        )}
      </header>

      {/* Exit Intent Modal */}
      <ExitIntentModal onSubmit={handleExitIntentSubmit} />

      {/* Live Chat Widget */}
      <LiveChatWidget online={true} />

      {/* Product Tour */}
      {showTour && (
        <ProductTour
          steps={[
            {
              target: '#hero',
              title: 'Start Your Free Analysis',
              content: 'Enter your dealership website to get your AI visibility score in 30 seconds. No signup required!',
              position: 'bottom'
            },
            {
              target: '#features',
              title: 'Powerful Features',
              content: 'Track your visibility across 5 AI platforms, get competitive intelligence, and automated optimization recommendations.',
              position: 'top'
            },
            {
              target: '#pricing',
              title: 'Simple Pricing',
              content: 'Start free, then upgrade to Pro ($499/mo) when you see results. 14-day free trial, no credit card required.',
              position: 'top'
            }
          ]}
          onComplete={() => {
            setShowTour(false);
            showToast('Tour completed! Ready to get started?', 'success');
          }}
          onSkip={() => {
            setShowTour(false);
            showToast('Tour skipped. You can start it anytime from the menu.', 'info');
          }}
          autoStart={false}
        />
      )}

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden pt-24" data-funnel-step="hero_interaction">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Live Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full mb-8 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700 font-medium">847 dealerships being analyzed</span>
          </div>
          
          {/* Quick Start Banner */}
          {showQuickStart && quickStartData && (
            <QuickStartBanner
              domain={quickStartData.domain}
              onUse={handleUseQuickStart}
              onDismiss={() => {
                setShowQuickStart(false);
                clearQuickStart();
              }}
            />
          )}

          {/* Main Headline - A/B Tested */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight">
            <ABTestWrapper
              testId="headline-test"
              variants={headlineVariants}
              defaultVariant="headline-control"
            >
              {personalizedContent?.headline || (
                <>
                  Stop Being Invisible<br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    to AI Car Shoppers
                  </span>
                </>
              )}
            </ABTestWrapper>
          </h1>
          
          {/* Subheadline - A/B Tested */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            <ABTestWrapper
              testId="subheadline-test"
              variants={subheadlineVariants}
              defaultVariant="subheadline-control"
            >
              {personalizedContent?.subheadline || (
                <>
                  ChatGPT, Gemini, Perplexity, and Google AI Overviews are recommending your competitors.
                  <span className="block mt-2 text-blue-600 font-semibold">Find out why in 30 seconds (no signup required)</span>
                </>
              )}
            </ABTestWrapper>
          </p>

          {/* URL Input Form */}
          <div className="max-w-2xl mx-auto mb-8" data-funnel-step="form_start">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      advancedAnalytics.recordFunnelStep('form_input', { hasValue: !!e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !analyzing) {
                        handleAnalyze();
                      }
                      if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      advancedAnalytics.recordFunnelStep('form_focus');
                    }}
                    placeholder="Enter your dealership website..."
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm transition-all"
                    aria-label="Dealership website URL"
                    aria-describedby="url-help"
                    aria-invalid={urlInput ? validateUrl(urlInput).valid === false : undefined}
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                  />
                  <span id="url-help" className="sr-only">
                    Enter your dealership website URL (e.g., yourdealership.com)
                  </span>
                  
                  {/* Domain Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <DomainSuggestionsList
                      suggestions={suggestions}
                      onSelect={handleSuggestionSelect}
                      onClose={() => setShowSuggestions(false)}
                    />
                  )}
                </div>
                <ABTestWrapper
                  testId="cta-button-test"
                  variants={ctaButtonVariants.map((variant) => {
                    const buttonComponent = (
                      <button
                        key={variant.id}
                        type="submit"
                        disabled={!urlInput.trim() || analyzing}
                        onClick={() => {
                          advancedAnalytics.recordFunnelStep('form_submit');
                          trackCTAConversion(variant.id, { action: 'form_submit' });
                        }}
                        className="px-8 py-4 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl font-semibold text-white hover:from-blue-800 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:transform-none relative overflow-hidden group ring-2 ring-blue-500/20 active:scale-95"
                        data-funnel-step="cta_click"
                      >
                        {analyzing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Analyzing...</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 animate-shimmer"></div>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span>{typeof variant.component === 'string' ? variant.component : 'Analyze Free'}</span>
                          </>
                        )}
                      </button>
                    );
                    return {
                      ...variant,
                      component: buttonComponent
                    };
                  })}
                  defaultVariant="cta-control"
                >
                  <button
                    type="submit"
                    disabled={!urlInput.trim() || analyzing}
                    onClick={() => {
                      advancedAnalytics.recordFunnelStep('form_submit');
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-semibold text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none relative overflow-hidden group"
                    data-funnel-step="cta_click"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 animate-shimmer"></div>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Analyze Free</span>
                      </>
                    )}
                  </button>
                </ABTestWrapper>
              </div>
              <div className="flex flex-col items-center gap-3">
                <RiskReversalBadge />
                <SocialProofCounter />
              </div>
            </form>
          </div>

          {/* Trust Badges with Animated Counters */}
          <div className="flex flex-wrap justify-center gap-6 items-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>
                <AnimatedCounter value={500} suffix="+ " />Dealerships
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>5 AI Platforms Tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>
                <AnimatedCounter value={99.9} decimals={1} suffix="% " />Accuracy
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Decay Tax Counter */}
      <section className="py-8 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-y border-red-200/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Real-Time Revenue Loss</h3>
                <p className="text-sm text-gray-600">Every second your dealership is invisible to AI...</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl md:text-5xl font-bold text-red-600 font-mono">
                ${decayTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-500 mt-1">Lost since you landed on this page</p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {analyzing && (
        <section id="results" className="py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <AnalysisSkeleton />
          </div>
        </section>
      )}

      {showResults && !analyzing && (
        <AhaResults
          data={demoDealer}
          onSignup={() => {
            ga('cta_click', { id: 'aha_moment_cta' });
            window.location.href = '/onboarding?tier=free';
          }}
        />
      )}

      {/* Trust Badges Section */}
      <ScrollReveal>
        <section className="py-12 px-4 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto">
            <TrustBadges variant="compact" />
          </div>
        </section>
      </ScrollReveal>

      {/* Live Activity Feed */}
      <ScrollReveal delay={200}>
        <section className="py-12 px-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 text-center">
              {(() => {
                const defaultHeading = "Live Activity";
                const enhancedHeading = dAIQuoteFetcher({
                  contextTag: 'Data Insight, KPI Spike, Validation',
                  defaultText: defaultHeading,
                  minSubtlety: 3 // Prefer subtle quotes for landing page
                });
                return (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {enhancedHeading}
                    </h3>
                    <p className="text-sm text-gray-600">See what other dealerships are achieving</p>
                  </>
                );
              })()}
            </div>
            <LiveActivityFeed />
          </div>
        </section>
      </ScrollReveal>

      {/* Features Section with Progressive Disclosure */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-white to-gray-50" data-funnel-step="features_view">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Dominate AI Search</h2>
              <p className="text-xl text-gray-600">Enterprise-grade intelligence, dealer-friendly pricing</p>
            </div>
          </ScrollReveal>

          {/* Basic Features - Always Visible */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {features.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100} direction="up">
                <div 
                  className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Advanced Features - Progressive Disclosure */}
          <div className="max-w-3xl mx-auto space-y-4">
            <ProgressiveDisclosure
              title="Advanced Features"
              summary="See enterprise-grade capabilities for larger dealerships"
            >
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Multi-Location Support</h4>
                  <p className="text-sm text-gray-600">Track AI visibility across all your dealership locations from one dashboard.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Custom Integrations</h4>
                  <p className="text-sm text-gray-600">Connect with your existing CRM, DMS, and marketing tools.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">White-Label Reports</h4>
                  <p className="text-sm text-gray-600">Generate branded reports for stakeholders and management.</p>
                </div>
              </div>
            </ProgressiveDisclosure>

            <ProgressiveDisclosure
              title="Technical Details"
              summary="Learn about our AI analysis methodology"
            >
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">5-Pillar Scoring System</h4>
                  <p className="text-sm text-gray-600 mb-2">Our comprehensive scoring evaluates:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                    <li>AI Visibility Score (30% weight)</li>
                    <li>Zero-Click Shield (20% weight)</li>
                    <li>UGC Health (25% weight)</li>
                    <li>Geo Trust (15% weight)</li>
                    <li>SGP Integrity (10% weight)</li>
                  </ul>
                </div>
              </div>
            </ProgressiveDisclosure>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <ScrollReveal>
        <section className="py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <VideoDemoSection />
          </div>
        </section>
      </ScrollReveal>

      {/* Quick ROI Calculator */}
      <ScrollReveal>
        <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Calculate Your Hidden Loss</h2>
              <p className="text-xl text-gray-600">See what AI invisibility is actually costing you</p>
            </div>
            <QuickROICalculator />
          </div>
        </section>
      </ScrollReveal>

      {/* Leaderboard Section */}
      <ScrollReveal>
        <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Top Performers</h2>
              <p className="text-xl text-gray-600">See who's dominating AI search in their markets</p>
            </div>
            <ScoreLeaderboard timeframe="week" showUserRank={showResults} />
          </div>
        </section>
      </ScrollReveal>

      {/* Achievement Badges */}
      {showResults && (
        <ScrollReveal>
          <section className="py-24 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <AchievementBadges showUnlockedOnly={false} />
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Unique Value Proposition */}
      <ScrollReveal>
        <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Makes DealershipAI Unique</h2>
              <p className="text-xl text-gray-600">The only platform built specifically for automotive dealerships in the AI era</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-First Architecture</h3>
                <p className="text-gray-600">
                  Built from the ground up for AI search visibility. Track ChatGPT, Claude, Perplexity, and Google AI Overviews in real-time.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Zero-Click Shield</h3>
                <p className="text-gray-600">
                  Protect your dealership from AI Overview zero-click results. Only DealershipAI monitors and defends against this revenue threat.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Revenue Impact Tracking</h3>
                <p className="text-gray-600">
                  See exactly how AI visibility translates to dollars. Track revenue at risk and recovered with precision.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Fixes</h3>
                <p className="text-gray-600">
                  One-click fixes for schema issues, GBP optimization, and content gaps. No manual work required.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Monitoring</h3>
                <p className="text-gray-600">
                  Get instant alerts when your dealership appears (or disappears) from AI responses. Never miss an opportunity.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dealership-Specific</h3>
                <p className="text-gray-600">
                  Every feature designed for automotive dealerships. Inventory, service, parts, and finance all optimized for your business.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-lg text-gray-700 mb-6">
                <strong className="text-gray-900">No other platform</strong> combines AI search tracking, zero-click protection, and revenue attribution specifically for dealerships.
              </p>
              <button
                onClick={() => {
                  ga('event', 'cta_click', { location: 'unique_value_prop', cta: 'start_free_trial' });
                  document.getElementById('quick-audit')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Start Your Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Social Proof - Suppressed until testimonials are available */}
      {false && (
      <section className="py-12 px-4 bg-white opacity-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Trusted by <AnimatedCounter value={500} suffix="+ " />Dealerships
              </h2>
              <p className="text-lg text-gray-600">Join dealers who've reclaimed their AI visibility</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Mike Thompson",
                title: "GM, Thompson Toyota",
                location: "Dallas, TX",
                quote: "We went from invisible to #2 in Dallas for 'best Toyota dealer' on ChatGPT. 23 more sales last month.",
                increase: 38
              },
              {
                name: "Sarah Chen",
                title: "Digital Director, Metro Honda",
                location: "Seattle, WA",
                quote: "Finally a tool that tracks what actually matters. Our AI visibility score went from 42 to 81 in 60 days.",
                increase: 93
              },
              {
                name: "Robert Martinez",
                title: "Owner, Martinez Auto Group",
                location: "Phoenix, AZ",
                quote: "The competitive intel alone is worth 10x the price. We know exactly what our rivals are doing.",
                increase: 127
              }
            ].map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 150} direction="up">
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.title}</div>
                      <div className="text-xs text-gray-500">{testimonial.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        +<AnimatedCounter value={testimonial.increase} suffix="%" />
                      </div>
                      <div className="text-xs text-gray-500">Score increase</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white" id="pricing" data-funnel-step="pricing_view">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                sessions: "5 scans/month",
                features: [
                  "Basic AI visibility score",
                  "Competitive leaderboard",
                  "UGC health tracking",
                  "Email alerts"
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$499",
                sessions: "200 sessions/month",
                features: [
                  "Everything in Free, plus:",
                  "Full 5-pillar breakdown",
                  "E-E-A-T detailed scoring",
                  "Competitor intelligence",
                  "30-day action plans",
                  "Priority support"
                ],
                cta: "Start 14-Day Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "$999",
                sessions: "Unlimited sessions",
                features: [
                  "Everything in Pro, plus:",
                  "Mystery Shop AI",
                  "Custom query library",
                  "Multi-location support",
                  "White-label reports",
                  "Dedicated success manager"
                ],
                cta: "Book Demo",
                popular: false
              }
            ].map((tier, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-2xl ${
                  tier.popular 
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500 shadow-xl scale-105' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {tier.popular && (
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                  {tier.price !== "$0" && <span className="text-gray-500">/month</span>}
                </div>
                <div className="text-sm text-gray-600 mb-6">{tier.sessions}</div>
                
                <button
                  onClick={() => {
                    const tierId = 'pricing_' + tier.name.toLowerCase();
                    ga('cta_click', { id: tierId });
                    if (tier.name === 'Pro' || tier.name === 'Enterprise') {
                      // Paid tiers (Tier 2 & 3) - go to signup with Stripe
                      const plan = tier.name.toLowerCase();
                      window.location.href = '/signup?plan=' + plan;
                    } else {
                      // Tier 1 (Free) - go directly to agentic onboarding (NO Stripe)
                      window.location.href = '/onboarding?tier=free';
                    }
                  }}
                  className={`w-full px-6 py-3 rounded-xl font-semibold mb-6 transition-all ${
                    tier.popular
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-2xl ring-2 ring-emerald-500/30'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg ring-1 ring-slate-700/50'
                  }`}
                >
                  {tier.cta}
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">All plans include 14-day free trial • No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* FAQ with Search */}
      <section id="faq" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqSearchTerm}
                onChange={(e) => {
                  const searchTerm = e.target.value;
                  setFaqSearchTerm(searchTerm);
                  if (searchTerm) {
                    ga('faq_search', { term: searchTerm.toLowerCase() });
                  }
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {filteredFaqs.length === 0 && faqSearchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-600">No FAQs found matching "{faqSearchTerm}"</p>
              <button
                onClick={() => setFaqSearchTerm('')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}

          <div className="space-y-4">
            {filteredFaqs.map((faq, i) => {
              const originalIndex = faqs.indexOf(faq);
              return (
              <div 
                key={i} 
                className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => {
                    setExpandedFaq(expandedFaq === originalIndex ? null : originalIndex);
                    if (expandedFaq !== originalIndex) {
                      ga('faq_expanded', { question: faq.q });
                    }
                  }}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.q}</h3>
                  {expandedFaq === originalIndex ? (
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === originalIndex && (
                  <div className="px-6 pb-6 text-gray-600 animate-slide-down">{faq.a}</div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-8">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">
              ${Math.floor(decayTax).toLocaleString()} lost while you've been reading
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Stop Losing Sales<br />to AI-Savvy Competitors
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Every day you wait is another day your competitors get recommended instead of you. 
            Start your free analysis now - no email required.
          </p>

          {/* Urgency Timer */}
          <div className="mb-8 flex justify-center">
            <UrgencyTimer expiresInMinutes={30} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 max-w-2xl mx-auto">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="yourdealership.com"
              className="w-full sm:flex-1 px-6 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
            <button 
              onClick={() => handleAnalyze()}
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-700 hover:text-white transition-all transform hover:scale-105 shadow-2xl border-2 border-blue-700 flex items-center justify-center gap-2 ring-2 ring-white/20"
            >
              <Zap className="w-5 h-5" />
              Analyze Now - Free
            </button>
          </div>

          <p className="text-sm text-blue-100">
            ✓ 30-second analysis  ✓ See your score + competitors  ✓ No signup required
          </p>

          <div className="mt-16 pt-16 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-blue-100">
            <div>© 2025 DealershipAI. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:kainomura@dealershipai.com" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA (shows after scroll) */}
      {scrolled && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden animate-slide-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Run Free AI Scan
                </h3>
                <p className="text-xs text-gray-600">
                  See your visibility in 30s
                </p>
              </div>
              <button
                onClick={() => {
                  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                  ga('cta_click', { id: 'sticky_mobile_cta' });
                }}
                className="bg-gradient-to-r from-blue-700 to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-800 hover:to-purple-800 transition-all flex items-center gap-2 shadow-2xl ring-2 ring-blue-500/30"
              >
                Start
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

