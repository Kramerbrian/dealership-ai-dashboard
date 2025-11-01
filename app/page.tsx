"use client";

import { useState, useEffect } from "react";
import "./globals.lean.css";
import FreeAuditWidget from "@/components/landing/FreeAuditWidget";

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

  async function onScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;

    setSubmitting(true);
    setMsg(null);
    setPreview(null);

    try {
      const response = await fetch('/api/scan/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      const data = await response.json();
      setPreview(data);
      setMsg("Preview ready! Sign in to view your full report.");
    } catch (error) {
      setMsg("Scan failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="wrapper">
      {/* Exit-Intent Modal */}
      {exitIntentShown && (
        <div className="exit-modal-overlay" onClick={() => setExitIntentShown(false)}>
          <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="exit-close" onClick={() => setExitIntentShown(false)} aria-label="Close">×</button>
            <h3>Wait! Before you go...</h3>
            <p>Get your first AI visibility report 100% free. No credit card required.</p>
            <button className="cta" onClick={() => {
              setExitIntentShown(false);
              document.querySelector<HTMLElement>('.input')?.focus();
            }}>Get Free Report</button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="nav">
        <div className="logo">
          <span className="logo-dot" />
          DealershipAI
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#learn">Learn</a>
          <button className="ghost" onClick={() => (window.location.href = "/sign-in")}>Sign in</button>
          <button className="cta" onClick={() => (window.location.href = "/onboarding")}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div>
          <div className="badge"><span className="dot" /> Agent-Ready • Real KPIs</div>
          <h1 className="h-title">See how trusted your dealership looks to AI.</h1>
          <p className="h-kicker">Run a free scan, view your Trust Score, and get instant, fix-ready insights for schema, content freshness, and zero-click visibility.</p>

          {/* Preview Results */}
          {preview && (
            <div className="panel" style={{marginBottom: 16, animation: "fadeIn 0.3s"}}>
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
                <div style={{marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a2430"}}>
                  <p className="small" style={{margin: "0 0 6px"}}>Key Insights:</p>
                  <ul style={{margin: 0, paddingLeft: 18, color: "var(--muted)", fontSize: 13}}>
                    {preview.insights.slice(0, 3).map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{marginTop: 12}}>
                <button className="cta" onClick={() => (window.location.href = "/sign-in")}>
                  View Full Report
                </button>
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
                {submitting ? "Scanning…" : "Run Free Scan"}
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

      {/* Benefits */}
      <section id="features" className="grid">
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

      {/* Slim pricing teaser */}
      <section id="pricing" className="panel">
        <h3 style={{margin:"0 0 6px"}}>Simple pricing</h3>
        <p className="small">Free scan. Tier 2 from $499/mo. Tier 3 from $999/mo. Cancel anytime.</p>
        <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap"}}>
          <button className="cta" onClick={()=>(window.location.href = "/onboarding")}>Start free</button>
          <button className="ghost" onClick={()=>(window.location.href = "/learn")}>See how it works</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="small">© {new Date().getFullYear()} DealershipAI</div>
        <div className="links">
          <a href="/legal">Legal</a>
          <a href="/status">Status</a>
          <a href="/sign-in">Sign in</a>
        </div>
      </footer>
    </main>
  );
}
