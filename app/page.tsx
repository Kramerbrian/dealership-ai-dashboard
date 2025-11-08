"use client";

import { useState, useEffect } from "react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import FreeAuditWidget from "@/components/landing/FreeAuditWidget";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function Page() {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<ScanPreview | null>(null);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    
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
    if (!mobileMenuOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Exit-intent detection (high-impact enhancement)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown && !preview) {
        setExitIntentShown(true);
      }
    };

    // Also trigger on 45s inactivity
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

  /**
   * Client-side URL validation helper
   */
  function validateUrlClient(input: string): { valid: boolean; error?: string; normalized?: string } {
    if (!input || input.trim().length === 0) {
      return { valid: false, error: 'URL is required' };
    }

    if (input.length > 2048) {
      return { valid: false, error: 'URL is too long (max 2048 characters)' };
    }

    try {
      let normalized = input.trim().toLowerCase();
      
      // Add protocol if missing
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = `https://${normalized}`;
      }

      const urlObj = new URL(normalized);
      const hostname = urlObj.hostname.toLowerCase();

      // Basic validation
      if (hostname.length === 0 || hostname.length > 253) {
        return { valid: false, error: 'Invalid domain name' };
      }

      // Block localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return { valid: false, error: 'Please enter a valid website URL' };
      }

      return { valid: true, normalized: urlObj.origin };
    } catch {
      return { valid: false, error: 'Invalid URL format. Please enter a valid website URL' };
    }
  }

  async function onScan(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate URL before sending request
    const validation = validateUrlClient(url.trim());
    if (!validation.valid) {
      setMsg(validation.error || 'Invalid URL');
      return;
    }

    setSubmitting(true);
    setMsg(null);
    setPreview(null);

    try {
      // Use validated/normalized URL
      const urlToSend = validation.normalized || url.trim();
      const response = await fetch('/api/scan/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToSend }),
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Scan failed');
      }

      const data = await response.json();
      setPreview(data);
      setMsg("Preview ready! Sign in to view your full report.");
      
      // Auto-scroll to preview results
      setTimeout(() => {
        const previewElement = document.querySelector('[data-preview-results]');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (error: any) {
      // Enhanced error messages
      let errorMessage = "Scan failed. Please try again.";
      
      if (error?.message) {
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (error.message.includes('invalid') || error.message.includes('Invalid URL')) {
          errorMessage = "Please enter a valid website URL (e.g., exampledealer.com)";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setMsg(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="wrapper" style={{paddingBottom: 0}}>
        {/* Exit-Intent Modal */}
        {exitIntentShown && (
          <div 
            className="exit-modal-overlay" 
            onClick={() => setExitIntentShown(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
          >
            <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="exit-close" 
                onClick={() => setExitIntentShown(false)} 
                aria-label="Close exit intent modal"
              >
                ×
              </button>
              <h3 id="exit-modal-title">Wait! Before you go...</h3>
              <p>Get your first AI visibility report 100% free. No credit card required.</p>
              <button 
                className="cta" 
                onClick={() => {
                  setExitIntentShown(false);
                  document.querySelector<HTMLElement>('.input')?.focus();
                }}
              >
                Get Free Report
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="nav" aria-label="Main navigation">
          <Link href="/" className="logo" aria-label="DealershipAI Home">
            <span className="logo-dot" aria-hidden="true" />
            DealershipAI
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            aria-controls="mobile-menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how-it-works">How it works</a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="ghost">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="cta">Get Your Free Report</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="ghost">Dashboard</Link>
              <Link href="/onboarding" className="cta">Complete Setup</Link>
            </SignedIn>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div 
          id="mobile-menu"
          className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="ghost" onClick={() => setMobileMenuOpen(false)}>Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="cta" onClick={() => setMobileMenuOpen(false)}>Get Your Free Report</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="ghost">Dashboard</Link>
            <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)} className="cta">Complete Setup</Link>
          </SignedIn>
        </div>
      </header>

      <main id="main-content" className="wrapper">

      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <div className="badge" aria-label="Status badge"><span className="dot" aria-hidden="true" /> Agent-Ready • Real KPIs</div>
          <h1 id="hero-title" className="h-title">See how trusted your dealership looks to AI.</h1>
          <p className="h-kicker">Run a free scan, view your Trust Score, and get instant, fix-ready insights for schema, content freshness, and zero-click visibility.</p>

          {/* Preview Results */}
          {preview && (
            <div className="panel" style={{marginBottom: 16, animation: "fadeIn 0.3s"}} data-preview-results>
              <h4 style={{margin: "0 0 12px"}}>Preview Results</h4>
              <div className="gauges" style={{position: "static", margin: 0}}>
                <div className="g">
                  <p className="g-title">Trust Score</p>
                  <div className="g-num">{preview.scores.trust}</div>
                </div>
                <div className="g">
                  <p className="g-title">Schema</p>
                  <div className="g-num">{preview.scores.schema}%</div>
                </div>
                <div className="g">
                  <p className="g-title">Zero-Click</p>
                  <div className="g-num">{preview.scores.zeroClick}%</div>
                </div>
              </div>
              {preview.insights.length > 0 && (
                <div style={{marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a1a1a"}}>
                  <p className="small" style={{margin: "0 0 6px"}}>Key Insights:</p>
                  <ul style={{margin: 0, paddingLeft: 18, color: "var(--muted)", fontSize: 13}}>
                    {preview.insights.slice(0, 3).map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{marginTop: 12}}>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="cta">
                      Get Your Free Report
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="cta">
                  View Full Report
                </Link>
              </div>
            </div>
          )}

          {/* New Free Audit Widget - PLG Integration */}
          <div style={{ marginBottom: '24px' }}>
            <FreeAuditWidget />
          </div>

          {/* Legacy scan form (kept for fallback) */}
          <form className="panel" onSubmit={onScan} aria-label="Free scan" style={{ display: 'none' }}>
            <div className="scan">
              <input
                className="input"
                placeholder="Enter your website (e.g., germaintoyotaofnaples.com)"
                value={url}
                onChange={e=>setUrl(e.target.value)}
                aria-label="Website URL"
                disabled={submitting}
              />
              <button className="cta" aria-label="Run scan" disabled={submitting || !url}>
                {submitting ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    <span>Scanning…</span>
                  </>
                ) : "Run Free Scan"}
              </button>
            </div>
            <div className="kpis">
              <span className="k">Trust Score</span>
              <span className="k">Freshness</span>
              <span className="k">Schema Coverage</span>
              <span className="k">AI Mention Rate</span>
            </div>
            <div className="note">{msg ?? "No spam. We show a preview, then ask to sign in for the full report."}</div>
          </form>

          <div className="trustbar" aria-label="Trusted by">
            <img className="tlogo" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='18'><rect width='96' height='18' rx='3' fill='%23cfd8e3'/><text x='6' y='13' font-family='Arial' font-size='11' fill='%23222'>SEMRush-style</text></svg>" alt="Press" />
            <img className="tlogo" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='76' height='18'><rect width='76' height='18' rx='3' fill='%23dbe2ea'/><text x='6' y='13' font-family='Arial' font-size='11' fill='%23222'>AutoTrade</text></svg>" alt="AutoTrade" />
            <img className="tlogo" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='86' height='18'><rect width='86' height='18' rx='3' fill='%23dbe2ea'/><text x='6' y='13' font-family='Arial' font-size='11' fill='%23222'>Retail Bench</text></svg>" alt="Retail Bench" />
          </div>
        </div>

        {/* Visual KPI card */}
        <div className="hero-visual">
          <div className="gauges" aria-hidden="true">
            <div className="g">
              <p className="g-title">Trust Score</p>
              <div className="g-num">84</div>
            </div>
            <div className="g">
              <p className="g-title">Schema</p>
              <div className="g-num">78%</div>
            </div>
            <div className="g">
              <p className="g-title">Zero-Click</p>
              <div className="g-num">42%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="grid" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Features</h2>
        <article className="card">
          <h4>Clarity, not guesswork</h4>
          <p>We score what AI actually reads: schema, freshness, and entity trust—no vanity metrics.</p>
        </article>
        <article className="card">
          <h4>Fix-ready insights</h4>
          <p>Each issue ships with a one-click, parse-safe fix. No PDFs. No homework.</p>
        </article>
        <article className="card">
          <h4>Agent-ready checkout</h4>
          <p>Make units transactable inside chat with Stripe's agentic rails.</p>
        </article>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="panel" aria-labelledby="how-it-works-heading" style={{marginTop: 48}}>
        <h2 id="how-it-works-heading" style={{margin:"0 0 12px"}}>How it works</h2>
        <div className="grid" style={{gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginTop: 20}}>
          <div className="card">
            <h4 style={{margin:"0 0 8px"}}>1. Enter your website</h4>
            <p style={{margin:0, color:"var(--muted)", fontSize:14}}>Paste your dealership website URL to get started</p>
          </div>
          <div className="card">
            <h4 style={{margin:"0 0 8px"}}>2. Get instant analysis</h4>
            <p style={{margin:0, color:"var(--muted)", fontSize:14}}>Our AI scans your site and provides a comprehensive Trust Score</p>
          </div>
          <div className="card">
            <h4 style={{margin:"0 0 8px"}}>3. View your report</h4>
            <p style={{margin:0, color:"var(--muted)", fontSize:14}}>See detailed insights on schema, freshness, and AI visibility</p>
          </div>
          <div className="card">
            <h4 style={{margin:"0 0 8px"}}>4. Take action</h4>
            <p style={{margin:0, color:"var(--muted)", fontSize:14}}>Get fix-ready recommendations to improve your AI visibility</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="panel" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" style={{margin:"0 0 6px"}}>Simple pricing</h2>
        <p className="small">Free scan. Tier 2 from $499/mo. Tier 3 from $999/mo. Cancel anytime.</p>
        <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap"}}>
          <Link href="/onboarding" className="cta">Get Your Free Report</Link>
          <a href="#how-it-works" className="ghost">See how it works</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="small">© {new Date().getFullYear()} DealershipAI</div>
        <nav className="links" aria-label="Footer navigation">
          <Link href="/legal">Legal</Link>
          <Link href="/status">Status</Link>
          <Link href="/sign-in">Sign in</Link>
        </nav>
      </footer>
    </main>
    </>
  );
}
