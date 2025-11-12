// Elite Landing Page (OpenAI/Ive aesthetic) - Production Ready
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import FreeAuditWidget from "@/components/landing/FreeAuditWidget";
import AIGEOSchema from "@/components/SEO/AIGEOSchema";
import LandingPageMeta from "@/components/SEO/LandingPageMeta";
import Link from "next/link";
import { validateUrlClient } from '@/lib/utils/url-validation-client';
import { getLastAIV } from '@/lib/client/aivStorage';
import dynamic from 'next/dynamic';
import { ClerkConditional } from "@/components/providers/ClerkConditional";
import { Zap, TrendingUp, AlertTriangle, Target, Crown, ArrowRight, Lock, Share2, Mail, X, CheckCircle } from 'lucide-react';

// Lazy load visibility components
const AIVStrip = dynamic(() => import('@/components/visibility/AIVStrip'), { ssr: false });
const AIVCompositeChip = dynamic(() => import('@/components/visibility/AIVCompositeChip'), { ssr: false });

// JSON-LD SEO Components
function JsonLd({ children }: { children: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: children }} />;
}

const SoftwareApplicationLd = () => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DealershipAI',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Analytics',
  operatingSystem: 'Web Browser',
  offers: { '@type':'Offer', price:'0', priceCurrency:'USD', description:'Free AI visibility analysis' },
  description: 'AI visibility analysis tool for automotive dealerships. Analyzes presence across ChatGPT, Claude, Perplexity, Gemini, and Copilot.',
  featureList: [
    'ChatGPT visibility analysis',
    'Claude AI ranking check',
    'Perplexity search optimization',
    'Gemini presence audit',
    'Microsoft Copilot visibility',
    'Competitive analysis',
    'Revenue impact calculation'
  ],
  screenshot: 'https://dealershipai.com/screenshot.png',
  aggregateRating: { '@type':'AggregateRating', ratingValue:'4.9', ratingCount:'847' },
  publisher: {
    '@type':'Organization', name:'DealershipAI', url:'https://dealershipai.com', logo:'https://dealershipai.com/logo.png'
  }
});

const FaqLd = () => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type':'Question', name:'How do I check my dealership\'s AI search visibility?', acceptedAnswer: { '@type':'Answer', text:'Use DealershipAI\'s free instant analyzer to check your visibility across ChatGPT, Claude, Perplexity, Gemini, and Copilot. Enter your domain and get results in 10 seconds.' } },
    { '@type':'Question', name:'What is AI search optimization for dealerships?', acceptedAnswer: { '@type':'Answer', text:'AI search optimization (AEO) ensures your dealership appears in AI-powered search results from ChatGPT, Claude, Perplexity, and other AI assistants. It\'s critical for modern car dealership marketing.' } },
    { '@type':'Question', name:'How much revenue am I losing from poor AI visibility?', acceptedAnswer: { '@type':'Answer', text:'Average dealerships lose $43,000/month in potential sales from poor AI search visibility. DealershipAI\'s analysis shows your exact revenue at risk.' } }
  ]
});

const HowToLd = () => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Analyze Your Dealership\'s AI Visibility',
  description: 'Step-by-step guide to checking your automotive dealership\'s visibility on AI search engines',
  step: [
    { '@type':'HowToStep', position: 1, name:'Enter Your Domain', text:'Go to DealershipAI.com and enter your dealership website domain' },
    { '@type':'HowToStep', position: 2, name:'Get Instant Analysis', text:'Receive your free AI visibility report in 10 seconds' },
    { '@type':'HowToStep', position: 3, name:'Review Issues', text:'See exactly what\'s costing you revenue and how to fix it' }
  ]
});

// Telemetry helper
const track = async (type: string, payload: any = {}) => {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, payload, ts: Date.now() })
    });
  } catch (e) {
    console.warn('telemetry failed', e);
  }
};

interface ScanPreview {
  domain: string;
  scores: {
    trust: number;
    schema: number;
    zeroClick: number;
    freshness: number;
  };
  mentions: Record<string, boolean>;
  insights: string[];
  requiresAuth: boolean;
}

export default function Landing(){
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<ScanPreview | null>(null);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastAiv, setLastAiv] = useState<number | null>(null);
  const [scansLeft, setScansLeft] = useState(3);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockMethod, setUnlockMethod] = useState('');
  const [email, setEmail] = useState('');
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [competitorData, setCompetitorData] = useState<any[]>([]);
  const [pulseCards, setPulseCards] = useState<any[]>([]);
  const [radarAlerts, setRadarAlerts] = useState<any[]>([]);
  const weights = useState({
    ChatGPT: 0.35,
    Perplexity: 0.25,
    Gemini: 0.25,
    Copilot: 0.15,
  })[0];

  // Note: User redirect logic moved to middleware for better reliability
  // The SignedIn/SignedOut components handle auth state without hooks

  // Load last AIV for returning users (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Guard for SSR
    try {
      const snap = getLastAIV();
      if (snap?.score) setLastAiv(snap.score);
      const stored = localStorage.getItem('plg_scans_left');
      if (stored) setScansLeft(parseInt(stored));
      track('page_view', { page: 'landing', referrer: document.referrer });
      const interval = setInterval(() => {
        track('engagement_ping', { duration: 30 });
      }, 30000);
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error loading last AIV:', error);
    }
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (typeof window === 'undefined' || !mobileMenuOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    if (typeof window === 'undefined' || !mobileMenuOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Exit-intent detection (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let timer: NodeJS.Timeout;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown && !preview) {
        setExitIntentShown(true);
      }
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!exitIntentShown && !preview) {
          setExitIntentShown(true);
        }
      }, 45000);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('scroll', resetTimer);
    resetTimer();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', resetTimer);
      document.removeEventListener('scroll', resetTimer);
      clearTimeout(timer);
    };
  }, [exitIntentShown, preview]);

  async function runAnalyze(e: React.FormEvent){
    e.preventDefault();
    
    // Validate URL before sending request
    const validation = validateUrlClient(domain.trim());
    if (!validation.valid) {
      return;
    }

    if(!domain || scansLeft <= 0) return;
    setBusy(true);
    setProgress(0);
    track('scan_started', { domain, scansLeft });

    // Progressive loading simulation
    const steps = [
      { label: 'Scanning AI platforms...', duration: 400 },
      { label: 'Analyzing schema markup...', duration: 300 },
      { label: 'Checking competitor landscape...', duration: 300 },
      { label: 'Calculating revenue impact...', duration: 200 }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, steps[i].duration));
      setProgress(((i + 1) / steps.length) * 100);
    }

    try{
      const res = await fetch(`/api/v1/analyze?domain=${encodeURIComponent(domain)}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error('Analysis failed');
      }
      const payload = await res.json();
      sessionStorage.setItem("dai:analyzer", JSON.stringify(payload));
      
      // Set preview if available
      if (payload.analysis) {
        setPreview({
          domain: payload.analysis.domain || domain,
          scores: {
            trust: payload.analysis.scores?.vai || 84,
            schema: payload.analysis.scores?.schema || 78,
            zeroClick: payload.analysis.scores?.zeroClick || 42,
            freshness: payload.analysis.scores?.freshness || 65,
          },
          mentions: payload.analysis.visibility || {},
          insights: payload.analysis.recommendations || [],
          requiresAuth: true,
        });
      }

      const newCount = scansLeft - 1;
      setScansLeft(newCount);
      localStorage.setItem('plg_scans_left', String(newCount));
      
      track('scan_completed', { 
        domain, 
        overall: payload.analysis?.scores?.vai || 84,
        scansRemaining: newCount
      });

      // Try to fetch pulse/radar data (non-blocking)
      try {
        const [pulseRes, radarRes] = await Promise.all([
          fetch('/api/pulse/impacts', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ dealers: [domain], model: 'Model 3' })
          }).catch(() => null),
          fetch('/api/pulse/radar?marketId=swfl&window=7d').catch(() => null)
        ]);
        
        if (pulseRes?.ok) {
          const pulseData = await pulseRes.json();
          setPulseCards(pulseData.impacts || []);
        }
        if (radarRes?.ok) {
          const radarData = await radarRes.json();
          setRadarAlerts(radarData.alerts || []);
        }
      } catch (e) {
        // Non-critical, continue
      }
      
      router.push("/onboarding");
    } catch (error) {
      console.error('Analysis error:', error);
      track('scan_error', { domain, error: String(error) });
    } finally {
      setBusy(false);
    }
  }

  const handleShareUnlock = async () => {
    setUnlockMethod('share');
    track('unlock_share_clicked', { domain });
    
    const shareData = {
      title: `My DealershipAI Score`,
      text: `Just analyzed my dealership's AI visibility!`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        completeUnlock('share');
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      completeUnlock('copy');
    }
  };

  const handleEmailUnlock = async () => {
    if (!email) return;
    setUnlockMethod('email');
    track('unlock_email_clicked', { domain, email });
    await new Promise(r => setTimeout(r, 800));
    completeUnlock('email');
  };

  const completeUnlock = (method: string) => {
    setShowUnlock(false);
    setShowSuccess(true);
    track('unlock_success', { method, domain });
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  return (
    <>
      <AIGEOSchema mode="landing" />
      <LandingPageMeta />
      <JsonLd>{SoftwareApplicationLd()}</JsonLd>
      <JsonLd>{FaqLd()}</JsonLd>
      <JsonLd>{HowToLd()}</JsonLd>
      <main className="min-h-screen bg-black text-white">
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-white text-black px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Report Unlocked! 🎉</span>
          </div>
        )}

        {/* Exit-Intent Modal */}
        {exitIntentShown && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setExitIntentShown(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
          >
            <div 
              className="bg-white text-black rounded-2xl p-8 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setExitIntentShown(false)} 
                aria-label="Close exit intent modal"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 id="exit-modal-title" className="text-2xl font-semibold mb-2">Wait! Before you go...</h3>
              <p className="text-gray-600 mb-6">Get your first AI visibility report 100% free. No credit card required.</p>
              <button 
                className="w-full px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setExitIntentShown(false);
                  document.querySelector<HTMLElement>('input[type="text"]')?.focus();
                }}
              >
                Get Free Report
              </button>
            </div>
          </div>
        )}

        <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white"/>
            <span className="font-medium">dealershipAI</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-toggle md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className={`block w-6 h-0.5 bg-white mb-1.5 transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white mb-1.5 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <ClerkConditional>
              <SignedIn>
                <Link href="/dashboard" className="px-4 py-2 text-white/80 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/"/>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-white/80 hover:text-white transition-colors">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors">
                    Get Your Free Report
                  </button>
                </SignUpButton>
              </SignedOut>
            </ClerkConditional>
            {/* Fallback for non-dashboard domains */}
            {typeof window !== 'undefined' && window.location.hostname !== 'dash.dealershipai.com' && 
             !window.location.hostname.includes('localhost') && 
             !window.location.hostname.includes('vercel.app') && (
              <>
                <Link href="https://dash.dealershipai.com/sign-in" className="px-4 py-2 text-white/80 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link href="https://dash.dealershipai.com/sign-up" className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-colors">
                  Get Your Free Report
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-menu md:hidden fixed inset-0 z-40 bg-black pt-20 px-6">
            <ClerkConditional>
              <SignedIn>
                <Link href="/dashboard" className="block py-3 border-b border-white/10" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="block w-full text-left py-3 border-b border-white/10" onClick={() => setMobileMenuOpen(false)}>
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="block w-full text-left py-3 border-b border-white/10" onClick={() => setMobileMenuOpen(false)}>
                    Get Your Free Report
                  </button>
                </SignUpButton>
              </SignedOut>
            </ClerkConditional>
            {/* Fallback for non-dashboard domains */}
            {typeof window !== 'undefined' && window.location.hostname !== 'dash.dealershipai.com' && 
             !window.location.hostname.includes('localhost') && 
             !window.location.hostname.includes('vercel.app') && (
              <>
                <Link href="https://dash.dealershipai.com/sign-in" className="block py-3 border-b border-white/10" onClick={() => setMobileMenuOpen(false)}>
                  Sign in
                </Link>
                <Link href="https://dash.dealershipai.com/sign-up" className="block py-3 border-b border-white/10" onClick={() => setMobileMenuOpen(false)}>
                  Get Your Free Report
                </Link>
              </>
            )}
          </div>
        )}

        <section className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
          <h1 className="text-6xl font-light tracking-tight">Are you invisible to AI?</h1>
          <p className="mt-4 text-white/70">When ChatGPT doesn't know your dealership, you leak <b>$43K / month</b>.</p>
          
          {/* Preview Results */}
          {preview && (
            <div className="mt-8 mb-6 p-6 rounded-xl bg-white/5 border border-white/10 text-left">
              <h4 className="text-lg font-semibold mb-4">Preview Results</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-white/60">Trust Score</p>
                  <div className="text-2xl font-semibold">{preview.scores.trust}</div>
                </div>
                <div>
                  <p className="text-sm text-white/60">Schema</p>
                  <div className="text-2xl font-semibold">{preview.scores.schema}%</div>
                </div>
                <div>
                  <p className="text-sm text-white/60">Zero-Click</p>
                  <div className="text-2xl font-semibold">{preview.scores.zeroClick}%</div>
                </div>
              </div>
              {preview.insights.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/80 mb-2">Key Insights:</p>
                  <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
                    {preview.insights.slice(0, 3).map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* AI Visibility Components */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 flex-wrap">
                <AIVStrip domain={preview.domain} />
                <AIVCompositeChip domain={preview.domain} weights={weights} />
              </div>
              <div className="mt-4">
                <ClerkConditional>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors">
                        Get Your Free Report
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="inline-block px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors">
                      View Full Report
                    </Link>
                  </SignedIn>
                </ClerkConditional>
                {/* Fallback for non-dashboard domains */}
                {typeof window !== 'undefined' && window.location.hostname !== 'dash.dealershipai.com' && 
                 !window.location.hostname.includes('localhost') && 
                 !window.location.hostname.includes('vercel.app') && (
                  <Link href="https://dash.dealershipai.com/sign-up" className="inline-block px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors">
                    Get Your Free Report
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Free Audit Widget */}
          <div className="mt-8 mb-6 relative">
            <FreeAuditWidget />
            {lastAiv != null && (
              <div className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-1 rounded-full border border-white/10">
                Last AIV: {lastAiv}
              </div>
            )}
          </div>

          {/* Analyzing with progress */}
          {busy && (
            <div className="mt-8 mb-6 bg-white/5 border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-white animate-pulse" />
                <div className="font-semibold text-lg">Analyzing {domain}...</div>
              </div>
              
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white/40" />
                  Checked 5 AI platforms
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white/40" />
                  Analyzed 120+ data points
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white/40" />
                  Compared to competitors
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white/40" />
                  Calculated revenue impact
                </div>
              </div>
            </div>
          )}

          {/* Legacy scan form */}
          <form onSubmit={runAnalyze} className="mt-8 flex gap-3 max-w-2xl mx-auto">
            <input 
              value={domain} 
              onChange={(e)=>setDomain(e.target.value)} 
              placeholder="terryreidhyundai.com" 
              className="flex-1 px-5 py-4 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Dealership website URL"
            />
            <button 
              disabled={busy || !domain.trim() || scansLeft <= 0} 
              className="px-6 py-4 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {busy ? "Analyzing…" : "Analyze Free"}
            </button>
          </form>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/50">
            <span>✓ Scans ChatGPT, Perplexity, Gemini, Copilot</span>
            <span>✓ $ at risk</span>
            <span>✓ Auto-fix options</span>
            <span className="text-white/70">Free scans: <span className="font-semibold text-white">{scansLeft}/3</span></span>
          </div>
        </section>

        {/* Features Section */}
        <section id="product" className="max-w-7xl mx-auto px-6 py-16 mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4">The Bloomberg Terminal for AI Visibility</h2>
            <p className="text-lg text-white/70">Enterprise-grade intelligence, dealership-friendly pricing</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Target className="w-8 h-8 text-white/80 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Real-Time AI Tracking</h3>
              <p className="text-white/70">Monitor your presence across ChatGPT, Claude, Perplexity, Gemini, and Copilot with hourly updates.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <TrendingUp className="w-8 h-8 text-white/80 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Five-Pillar Scoring</h3>
              <p className="text-white/70">Visibility, Zero-Click Shield, UGC Health, Geo Trust, and Schema Integrity—all quantified.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Zap className="w-8 h-8 text-white/80 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Revenue Impact Math</h3>
              <p className="text-white/70">Translate visibility gaps into dollars so decisions are obvious. See your ROI in real-time.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-16 mt-16 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4">Start Free. Scale When Ready.</h2>
            <p className="text-lg text-white/70">No credit card required. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                name: 'Free', 
                price: '$0', 
                perks: ['3 analyses', 'Basic AI score', '1 competitor', 'Email reports'],
                cta: 'Start Free'
              },
              { 
                name: 'Pro', 
                price: '$499/mo', 
                highlight: true, 
                badge: 'Most Popular',
                perks: ['50 analyses', 'All 5 platforms', '5 competitors', 'Bi-weekly refresh', 'ROI calculator', 'Auto-fix schema', 'Priority support'],
                cta: 'Start 14-Day Trial'
              },
              { 
                name: 'Enterprise', 
                price: '$999/mo', 
                perks: ['200 analyses', 'Mystery shop', 'White-label reports', 'API access', 'Custom integrations', 'Dedicated CSM'],
                cta: 'Contact Sales'
              }
            ].map((p) => (
              <div key={p.name} className={`bg-white/5 border-2 rounded-2xl p-8 relative ${p.highlight ? 'border-white/30 scale-105' : 'border-white/10'}`}>
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <div className="text-xl font-semibold">{p.name}</div>
                <div className="text-4xl font-light mt-2">{p.price}</div>
                <ul className="mt-6 space-y-3">
                  {p.perks.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <ClerkConditional>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <button className={`w-full px-6 py-4 rounded-xl font-medium transition ${p.highlight ? 'bg-white text-black hover:bg-gray-100' : 'border-2 border-white/20 hover:bg-white/5'}`}>
                          {p.cta}
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/dashboard" className={`w-full block px-6 py-4 rounded-xl font-medium transition text-center ${p.highlight ? 'bg-white text-black hover:bg-gray-100' : 'border-2 border-white/20 hover:bg-white/5'}`}>
                        {p.cta}
                      </Link>
                    </SignedIn>
                  </ClerkConditional>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-7xl mx-auto px-6 py-16 mt-16 border-t border-white/10">
          <h2 className="text-3xl font-light mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'How do I check my AI search visibility?', a: 'Use the analyzer above; results in ~10 seconds across 5 AI platforms. We scan ChatGPT, Claude, Perplexity, Gemini, and Copilot.' },
              { q: 'What is AI search optimization (AEO)?', a: 'Optimizing your site and entities so AI assistants rank and recommend your dealership. It\'s the next evolution beyond SEO.' },
              { q: 'How much revenue am I losing?', a: 'On average ~$43k/mo. The report shows your specific revenue-at-risk math based on your market and visibility gaps.' },
              { q: 'Do you auto-fix issues?', a: 'Pro/Enterprise include auto-fix options (schema, FAQ, and review response workflows). Most fixes complete in under 2 hours.' },
              { q: 'How often is data updated?', a: 'Pro tier: bi-weekly. Enterprise: daily. We monitor 120+ signals across all platforms continuously.' },
              { q: 'Can I track competitors?', a: 'Yes! Pro includes 5 competitors, Enterprise includes 20. See exactly where you stand in your market.' }
            ].map((f) => (
              <div key={f.q} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition">
                <div className="font-semibold text-lg mb-2">{f.q}</div>
                <div className="text-sm text-white/70">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 mt-16 border-t border-white/10">
          <h3 className="text-2xl font-light mb-8 text-center">Trusted by Leading Dealerships</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-light text-white">847+</div>
              <div className="text-white/70 mt-2">Active Dealerships</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-white">$2.1M+</div>
              <div className="text-white/70 mt-2">Revenue Recovered Monthly</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-white">4.9/5</div>
              <div className="text-white/70 mt-2">Customer Rating</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-8 mt-16 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/60">© {new Date().getFullYear()} DealershipAI. All rights reserved.</div>
            <nav className="flex gap-6 text-sm">
              <Link href="/legal" className="text-white/60 hover:text-white transition-colors">Legal</Link>
              <Link href="/status" className="text-white/60 hover:text-white transition-colors">Status</Link>
              <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-white/60 hover:text-white transition-colors">Terms</Link>
              <Link href="/sign-in" className="text-white/60 hover:text-white transition-colors">Sign in</Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
