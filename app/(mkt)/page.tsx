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

// Lazy load visibility components
const AIVStrip = dynamic(() => import('@/components/visibility/AIVStrip'), { ssr: false });
const AIVCompositeChip = dynamic(() => import('@/components/visibility/AIVCompositeChip'), { ssr: false });

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
  const [weights] = useState({
    ChatGPT: 0.35,
    Perplexity: 0.25,
    Gemini: 0.25,
    Copilot: 0.15,
  });

  // Note: User redirect logic moved to middleware for better reliability
  // The SignedIn/SignedOut components handle auth state without hooks

  // Load last AIV for returning users (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Guard for SSR
    try {
      const snap = getLastAIV();
      if (snap?.score) setLastAiv(snap.score);
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

    if(!domain) return;
    setBusy(true);
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
      
      router.push("/onboarding");
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setBusy(false);
    }
  }
  
  return (
    <>
      <AIGEOSchema mode="landing" />
      <LandingPageMeta />
      <main className="min-h-screen bg-black text-white">
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
                ×
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
          </div>
        </header>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-menu md:hidden fixed inset-0 z-40 bg-black pt-20 px-6">
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
              disabled={busy || !domain.trim()} 
              className="px-6 py-4 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? "Analyzing…" : "Analyze Free"}
            </button>
          </form>
          
          <div className="mt-6 text-sm text-white/50">
            ✓ Scans ChatGPT, Perplexity, Gemini, Copilot • ✓ $ at risk • ✓ Auto-fix options
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 mt-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold mb-3">Clarity, not guesswork</h3>
              <p className="text-white/70">We score what AI actually reads: schema, freshness, and entity trust—no vanity metrics.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold mb-3">Fix-ready insights</h3>
              <p className="text-white/70">Each issue ships with a one-click, parse-safe fix. No PDFs. No homework.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold mb-3">Agent-ready checkout</h3>
              <p className="text-white/70">Make units transactable inside chat with Stripe's agentic rails.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-8 mt-16 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/60">© {new Date().getFullYear()} DealershipAI</div>
            <nav className="flex gap-6 text-sm">
              <Link href="/legal" className="text-white/60 hover:text-white transition-colors">Legal</Link>
              <Link href="/status" className="text-white/60 hover:text-white transition-colors">Status</Link>
              <Link href="/sign-in" className="text-white/60 hover:text-white transition-colors">Sign in</Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
