"use client";

import React, { useMemo, useState } from "react";

/**
 * DealershipAI — Pricing Page
 * Tiers: Ignition (Free), DIY Guide (Pro), Hyperdrive (Enterprise)
 *
 * Design goals
 * - Cupertino liquid-glass aesthetic with subtle motion
 * - Clear upsell path, drawer/feature gray-out logic
 * - Supabase-friendly telemetry hooks (POST /api/telemetry)
 * - Zero external deps beyond React + Tailwind
 *
 * Drop-in path suggestion: /app/(marketing)/pricing/page.tsx
 */

// ----------------------------- Types -----------------------------

type TierId = "tier1" | "tier2" | "tier3";

interface TierFeature {
  label: string;
  includedIn: TierId[]; // which tiers have it fully unlocked
  note?: string; // small helper copy
  visibilityGain?: string; // projected visibility gain badge
}

interface TierMeta {
  id: TierId;
  name: string;
  price: string; // display only; real prices live in Stripe settings
  tagline: string;
  color: "cyan" | "blue" | "neon";
  cta: string;
}

// --------------------------- Data Model --------------------------

const TIERS: TierMeta[] = [
  {
    id: "tier1",
    name: "Basic",
    price: "$0",
    tagline: "Basic features, foundational value, entry point.",
    color: "cyan",
    cta: "Start Free",
  },
  {
    id: "tier2",
    name: "Enhanced",
    price: "$599/mo",
    tagline: "Enhanced features and broader capabilities.",
    color: "blue",
    cta: "Upgrade to Enhanced",
  },
  {
    id: "tier3",
    name: "Premium",
    price: "$999/mo",
    tagline: "Premium features, maximum access, advanced automation.",
    color: "neon",
    cta: "Enable Premium",
  },
];

// Canonical feature list aligned to tier-gating rules
const FEATURES: TierFeature[] = [
  { label: "AI Visibility Scan (Google, ChatGPT, Perplexity)", includedIn: ["tier1", "tier2", "tier3"] },
  { label: "AI Platform Breakdown (Gemini, ChatGPT, Copilot, Perplexity)", includedIn: ["tier1", "tier2", "tier3"] },
  { label: "Zero‑Click Coverage % + Revenue‑at‑Risk snapshot", includedIn: ["tier1", "tier2", "tier3"] },
  { label: "Schema Health & SEO Scores (read‑only)", includedIn: ["tier1", "tier2", "tier3"] },
  { label: "E‑E‑A‑T scores visible (drawers locked in Tier 1)", includedIn: ["tier1", "tier2", "tier3"], note: "Tier 1 shows scores, drawers locked", visibilityGain: "+17% expected" },
  { label: "Business Identity Match (GBP / NAP)", includedIn: ["tier1", "tier2", "tier3"] },
  { label: "UGC sentiment snapshot (Google, DealerRater, Yelp)", includedIn: ["tier1", "tier2", "tier3"] },
  { label: "1 competitor preview", includedIn: ["tier1"] },
  { label: "Top‑5 Competitor Battle Plan", includedIn: ["tier2", "tier3"], visibilityGain: "+23% expected" },
  { label: "Interactive Zero‑Click Drawer + Recovery Playbook", includedIn: ["tier2", "tier3"], visibilityGain: "+31% expected" },
  { label: "Schema Auditor + JSON‑LD Fix Generator", includedIn: ["tier2", "tier3"], visibilityGain: "+19% expected" },
  { label: "E‑E‑A‑T detail drawers (E, E, A, T)", includedIn: ["tier2", "tier3"], visibilityGain: "+14% expected" },
  { label: "Mystery Shop Simulator (3 scenarios)", includedIn: ["tier2", "tier3"], visibilityGain: "+12% expected" },
  { label: "UGC Hub + Response Templates", includedIn: ["tier2", "tier3"], visibilityGain: "+8% expected" },
  { label: "Export CSV / API sync", includedIn: ["tier2", "tier3"] },
  { label: "Autonomous Fix Engine (Schema, GMB, FAQ, UGC) + PIQR merchandising", includedIn: ["tier3"], visibilityGain: "+42% expected" },
  { label: "Schema auditor injection (real‑time)", includedIn: ["tier3"], visibilityGain: "+28% expected" },
  { label: "Fleet & Geo Market Radar (auction + rental)", includedIn: ["tier3"], visibilityGain: "+15% expected" },
  { label: "Real‑time AI probe monitoring (Google AIO + ChatGPT mentions)", includedIn: ["tier3"], visibilityGain: "+35% expected" },
  { label: "Automation rules + Slack / Email alerts", includedIn: ["tier3"] },
  { label: "Multi‑location roll‑up dashboard", includedIn: ["tier3"], visibilityGain: "+21% expected" },
  { label: "Predictive Intelligence (next‑best‑action)", includedIn: ["tier3"], visibilityGain: "+38% expected" },
  { label: "Full API sync (CRM, GA4, OEM Ads)", includedIn: ["tier1", "tier2", "tier3"], note: "Included from Tier 1 per PLG strategy" },
  { label: "Autonomous reporting hub (no account manager)", includedIn: ["tier3"], visibilityGain: "+11% expected" },
];

// -------------------------- Utilities ----------------------------

const bgFor = (color: TierMeta["color"]) =>
  color === "cyan"
    ? "from-cyan-600/20 to-cyan-400/10"
    : color === "blue"
    ? "from-blue-600/20 to-blue-400/10"
    : "from-cyan-400/25 to-sky-300/10";

const ringFor = (color: TierMeta["color"]) =>
  color === "cyan" ? "ring-cyan-400/40" : color === "blue" ? "ring-blue-400/40" : "ring-cyan-300/40";

const badgeFor = (color: TierMeta["color"]) =>
  color === "cyan" ? "bg-cyan-500/20 text-cyan-300" : color === "blue" ? "bg-blue-500/20 text-blue-300" : "bg-cyan-300/20 text-cyan-200";

function Check({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/30">✓</span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-600/10 text-gray-400 ring-1 ring-gray-500/30">–</span>
  );
}

// -------------------------- ROI Calculation --------------------------
interface ROIProjection {
  raR: number; // Revenue at Risk (monthly)
  piqr: number; // PIQR score improvement
  visibilityGain: number; // Expected visibility gain %
  projectedRevenue: number; // Projected monthly revenue increase
  paybackPeriod: number; // Days to break even
}

async function calculateROI(tierId: TierId): Promise<ROIProjection | null> {
  try {
    // Fetch current RaR and PIQR data
    const [raRResponse, piqrResponse] = await Promise.all([
      fetch('/api/aiv/calculate?preview=true').catch(() => null),
      fetch('/api/piqr?dealerId=current&range=30d').catch(() => null),
    ]);

    const raRData = raRResponse?.ok ? await raRResponse.json() : null;
    const piqrData = piqrResponse?.ok ? await piqrResponse.json() : null;

    // Extract current metrics
    const currentRaR = raRData?.Revenue_at_Risk_USD || 25000; // Default fallback
    const currentPIQR = piqrData?.piqr_overall || 75; // Default fallback

    // Tier-based multipliers
    const tierMultipliers = {
      tier1: { raR: 0.1, piqr: 0.05, visibility: 0.08 },
      tier2: { raR: 0.35, piqr: 0.15, visibility: 0.25 },
      tier3: { raR: 0.65, piqr: 0.30, visibility: 0.45 },
    };

    const multiplier = tierMultipliers[tierId];
    const monthlyPrice = tierId === "tier2" ? 599 : tierId === "tier3" ? 999 : 0;

    // Calculate projections
    const projectedRaRRecovery = currentRaR * multiplier.raR;
    const projectedPIQRGain = currentPIQR * multiplier.piqr;
    const projectedVisibilityGain = multiplier.visibility * 100;
    const projectedRevenue = projectedRaRRecovery + (currentRaR * projectedVisibilityGain / 100);
    const paybackPeriod = monthlyPrice > 0 ? Math.ceil(monthlyPrice / (projectedRevenue / 30)) : 0;

    return {
      raR: projectedRaRRecovery,
      piqr: projectedPIQRGain,
      visibilityGain: projectedVisibilityGain,
      projectedRevenue,
      paybackPeriod,
    };
  } catch {
    return null;
  }
}

// ---------------------------- Modal ------------------------------

function UpgradeModal({ 
  open, 
  onClose, 
  tier, 
  currentTier 
}: { 
  open: boolean; 
  onClose: () => void; 
  tier: TierMeta | null;
  currentTier?: TierId;
}) {
  const [loading, setLoading] = useState(false);
  const [roi, setROI] = useState<ROIProjection | null>(null);
  const [showTrialOption, setShowTrialOption] = useState(false);

  // Fetch ROI on open
  React.useEffect(() => {
    if (open && tier && tier.id !== "tier1") {
      calculateROI(tier.id).then(setROI);
    }
  }, [open, tier]);

  // Show trial option for Tier-1 users
  React.useEffect(() => {
    if (open && tier && currentTier === "tier1" && tier.id !== "tier1") {
      setShowTrialOption(true);
    } else {
      setShowTrialOption(false);
    }
  }, [open, tier, currentTier]);

  if (!open || !tier) return null;

  const handleContinue = async () => {
    setLoading(true);

    try {
      // Log telemetry
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "pricing_upgrade_click",
          tier: tier.id,
          at: new Date().toISOString(),
          surface: "pricing-page",
          metadata: {
            roi: roi ? {
              raR: roi.raR,
              piqr: roi.piqr,
              visibilityGain: roi.visibilityGain,
            } : null,
          },
        }),
      });

      // Route to Stripe checkout or upgrade flow
      if (tier.id === "tier1") {
        // Free tier - redirect to signup/onboarding
        window.location.href = "/onboarding";
      } else {
        // Map tier IDs to plan names expected by API
        const planMap: Record<TierId, string> = {
          tier1: "FREE",
          tier2: "PROFESSIONAL",
          tier3: "ENTERPRISE",
        };

        const response = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: planMap[tier.id],
            email: "", // Will be collected in Stripe checkout
            successUrl: `${window.location.origin}/dashboard?upgraded=true`,
            cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          }),
        });

        const data = await response.json();
        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || "Failed to create checkout session");
        }
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  const handleTrialFeature = async () => {
    setLoading(true);

    try {
      // Determine which feature to grant based on tier
      const featureMap: Record<TierId, string> = {
        tier1: 'schema_fix',
        tier2: 'zero_click_drawer',
        tier3: 'autonomous_fix_engine',
      };
      
      const feature_id = featureMap[tier.id] || 'schema_fix';

      const response = await fetch('/api/trial/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store in localStorage for client-side checks
        if (typeof window !== 'undefined' && data.data) {
          localStorage.setItem(`dai:trial:${feature_id}`, JSON.stringify({
            feature_id: data.data.feature_id,
            unlocked_at: new Date().toISOString(),
            expires_at: data.data.expires_at,
          }));
        }
        
        alert(`Pro feature "${feature_id}" enabled for 24 hours. Check your dashboard drawers.`);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to grant trial');
      }
    } catch (error) {
      console.error("Trial feature error:", error);
      alert("Failed to enable trial feature. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur-xl">
        <div className="mb-3 text-lg font-semibold">{tier.name}: {tier.tagline}</div>
        <p className="mb-4 text-sm text-white/80">
          You're about to enable <span className="font-semibold">{tier.name}</span>. 
          {roi && (
            <span className="block mt-2 text-emerald-400">
              Projected ROI: ${roi.projectedRevenue.toLocaleString()}/mo revenue increase, 
              {roi.paybackPeriod > 0 && ` ${roi.paybackPeriod} days to break even`}
            </span>
          )}
        </p>

        {/* ROI Projections */}
        {roi && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">Projected Impact</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-white/60">Revenue at Risk Recovery</div>
                <div className="text-lg font-semibold text-emerald-400">${roi.raR.toLocaleString()}/mo</div>
              </div>
              <div>
                <div className="text-white/60">PIQR Improvement</div>
                <div className="text-lg font-semibold text-cyan-400">+{roi.piqr.toFixed(1)} pts</div>
              </div>
              <div>
                <div className="text-white/60">Visibility Gain</div>
                <div className="text-lg font-semibold text-blue-400">+{roi.visibilityGain.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-white/60">Total Monthly Value</div>
                <div className="text-lg font-semibold text-white">${roi.projectedRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          {showTrialOption && (
            <button
              onClick={handleTrialFeature}
              disabled={loading}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-50 transition-colors"
            >
              Borrow for 24h
            </button>
          )}
          <button 
            onClick={onClose} 
            className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------- Page -------------------------------

export default function PricingPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TierMeta | null>(null);
  const [currentTier, setCurrentTier] = useState<TierId>("tier1"); // TODO: Get from auth/session
  const [rarMonthly, setRarMonthly] = useState(25000); // Default fallback
  const [tier2Gain, setTier2Gain] = useState({ percent: 25, revenue: 8 });
  const [tier3Gain, setTier3Gain] = useState({ percent: 45, revenue: 15 });

  // Toast listener
  React.useEffect(() => {
    function onToast(e: any) {
      const el = document.createElement("div");
      el.className = "fixed bottom-4 right-4 px-3 py-2 rounded bg-white text-black text-sm shadow-lg z-50";
      el.textContent = e.detail?.text || "Done";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
    document.addEventListener("dai:toast", onToast as any);
    return () => document.removeEventListener("dai:toast", onToast as any);
  }, []);

  // Fetch RaR data on mount
  React.useEffect(() => {
    fetch('/api/aiv/calculate?preview=true')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.Revenue_at_Risk_USD) {
          setRarMonthly(data.Revenue_at_Risk_USD);
          // Calculate tier gains based on RaR
          setTier2Gain({
            percent: 25,
            revenue: Math.round(data.Revenue_at_Risk_USD * 0.35 / 1000),
          });
          setTier3Gain({
            percent: 45,
            revenue: Math.round(data.Revenue_at_Risk_USD * 0.65 / 1000),
          });
        }
      })
      .catch(() => {
        // Use defaults
      });
  }, []);

  const onCTA = (tier: TierMeta) => {
    setSelected(tier);
    setOpen(true);
  };

  const onTrialFeature = async () => {
    try {
      // Default to a common feature like 'schema_fix' or let user choose
      const feature_id = 'schema_fix'; // TODO: Make this dynamic based on user selection
      
      const response = await fetch('/api/trial/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store in localStorage for client-side checks
        if (typeof window !== 'undefined' && data.data) {
          localStorage.setItem(`dai:trial:${feature_id}`, JSON.stringify({
            feature_id: data.data.feature_id,
            unlocked_at: new Date().toISOString(),
            expires_at: data.data.expires_at,
          }));
        }
        
        // Show success toast/notification
        alert(`Pro feature "${feature_id}" enabled for 24 hours. Check your dashboard drawers.`);
      } else {
        alert('Failed to enable trial feature. Please try again.');
      }
    } catch (error) {
      console.error('Trial feature error:', error);
      alert('Failed to enable trial feature. Please try again.');
    }
  };

  const tiers = useMemo(() => TIERS, []);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-14 text-white">
      <header className="mx-auto mb-10 max-w-5xl text-center">
        <div className="mb-2 text-xs uppercase tracking-widest text-white/50">dealershipAI</div>
        <h1 className="bg-gradient-to-r from-sky-300 via-cyan-200 to-white bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Where signal replaces noise
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm text-white/70">
          dealershipAI reveals how discoverable, trusted, and visible your dealership really is — across Google, ChatGPT,
          Perplexity, and every surface that now decides who wins the click.
        </p>
        
        {/* ROI Projection Pill */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span className="text-xs text-white/60">Revenue at Risk:</span>
          <span className="text-sm font-semibold text-cyan-300">
            ${(rarMonthly / 1000).toFixed(0)}K/mo
          </span>
        </div>
      </header>

      {/* Cards */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <article
            key={t.id}
            className={`relative rounded-2xl border border-white/10 bg-gradient-to-br ${bgFor(t.color)} p-6 ring-1 ${ringFor(
              t.color
            )} shadow-2xl backdrop-blur-sm`}
          >
            <div className="mb-3 inline-flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeFor(t.color)}`}>{t.name}</span>
              <span className="text-white/60">{t.price}</span>
              {/* Visibility Gain Badges for Tier 2 and 3 */}
              {t.id === 'tier2' && (
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  +{tier2Gain.percent}% visibility
                </span>
              )}
              {t.id === 'tier3' && (
                <span className="ml-auto rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-300/30">
                  +{tier3Gain.percent}% visibility
                </span>
              )}
            </div>
            <div className="mb-2 text-lg font-semibold">{t.tagline}</div>
            {/* Recovery copy for Tier 2 and 3 */}
            {t.id === 'tier2' && (
              <p className="mb-2 text-xs text-emerald-300/80">
                Recover +${tier2Gain.revenue}K/mo in lost visibility
              </p>
            )}
            {t.id === 'tier3' && (
              <p className="mb-2 text-xs text-cyan-200/80">
                Recover +${tier3Gain.revenue}K/mo in lost visibility
              </p>
            )}
            <p className="mb-5 text-sm text-white/70">
              {t.id === "tier1" && "Basic features, foundational value, entry point."}
              {t.id === "tier2" && "Enhanced features and broader capabilities."}
              {t.id === "tier3" && "Premium features, maximum access, advanced automation."}
            </p>

            <ul className="mb-6 space-y-2">
              {FEATURES.map((f) => {
                const active = f.includedIn.includes(t.id);
                const muted = !active && (t.id === "tier1" || t.id === "tier2");

                return (
                  <li key={`${t.id}-${f.label}`} className="flex items-start gap-2">
                    <Check active={active} />
                    <span
                      className={`text-sm ${active ? "text-white/90" : "text-white/35"} ${muted ? "line-through/0" : ""}`}
                      title={f.note || (active ? "Included" : "Upgrade to unlock")}
                    >
                      {f.label}
                      {!active && f.visibilityGain && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-xs font-semibold text-emerald-400">
                          {f.visibilityGain}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={() => onCTA(t)}
              className={`w-full rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition-colors mb-2 ${
                t.id === "tier1"
                  ? "bg-white text-slate-900 hover:bg-white/90"
                  : t.id === "tier2"
                  ? "bg-blue-400 text-slate-900 hover:bg-blue-300"
                  : "bg-cyan-300 text-slate-900 hover:bg-cyan-200"
              }`}
            >
              {t.cta}
            </button>

            {/* "Borrow a Pro feature" multi-option chooser for Tier 1 */}
            {t.id === "tier1" && (
              <div className="w-full rounded-xl border border-white/15 bg-white/5 p-3">
                <div className="mb-2 text-xs font-semibold text-white/80">Borrow a Pro feature for 24h</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    { key: "schema_fix", label: "Schema Fix" },
                    { key: "zero_click_drawer", label: "Zero-Click Drawer" },
                    { key: "mystery_shop", label: "Mystery Shop" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={async () => {
                        try {
                          await fetch("/api/trial/grant", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ feature: opt.key, hours: 24 })
                          });
                          await fetch("/api/telemetry", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              event: "trial_feature_enable",
                              tier: t.id,
                              surface: "pricing-page",
                              feature: opt.key,
                              at: new Date().toISOString()
                            })
                          });
                          // Fire client event for guards and toasts
                          window.dispatchEvent(new Event("dai:trial_granted"));
                          // Optional: basic toast
                          document.dispatchEvent(new CustomEvent("dai:toast", { detail: { text: "24h trial enabled." } }));
                        } catch (error) {
                          console.error("Trial feature error:", error);
                          alert("Failed to enable trial feature. Please try again.");
                        }
                      }}
                      className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/90 hover:bg-white/15 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Aesthetic glow bar */}
            <div className="pointer-events-none absolute inset-x-6 bottom-2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </article>
        ))}
      </section>

      {/* Conversion helpers */}
      <section className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
          <div className="mb-1 font-semibold">Neural Scoring Ribbon</div>
          <p className="text-white/70">Real‑time AI Confidence index appears on dashboards for all tiers.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
          <div className="mb-1 font-semibold">Visibility Economy Meter</div>
          <p className="text-white/70">Revenue‑at‑Risk reframed as daily dollars leaking to competitors.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-sm">
          <div className="mb-1 font-semibold">Agentic Tooltips</div>
          <p className="text-white/70">Locked drawers offer guided demos that tee up the upsell.</p>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-5xl text-center text-xs text-white/50">
        © DealershipAI — Where signal replaces noise
      </footer>

      <UpgradeModal open={open} onClose={() => setOpen(false)} tier={selected} currentTier={currentTier} />
    </main>
  );
}
