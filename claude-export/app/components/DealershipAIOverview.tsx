'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend,
  ResponsiveContainer,
} from 'recharts';

/* --- UI Primitives ---------------------------------------------------- */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ${className}`}>
    {children}
  </div>
);

const KPI = ({
  title, value, sub, tone = 'default', onClick, ariaLabel,
}: { title: string; value: React.ReactNode; sub?: string; tone?: 'default'|'critical'|'ok'; onClick?: () => void; ariaLabel?: string }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel || title}
    className={`w-full text-left rounded-2xl border p-5 transition ${
      tone === 'critical'
        ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/15'
        : tone === 'ok'
          ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
    }`}
  >
    <div className="text-xs text-white/60">{title}</div>
    <div className="mt-1 text-3xl font-semibold text-white">{value}</div>
    {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
  </button>
);

const Skeleton = ({ h = 20 }: { h?: number }) => (
  <div className="animate-pulse rounded-lg bg-white/10" style={{ height: h }} />
);

/* --- Data (stubs; Tesler's Law → system shoulders math) -------------- */
type Trend = { date: string; impressions: number };
type Traffic = { name: string; value: number };
type Funnel = { stage: 'Upper'|'Lower'; value: number };

export default function DealershipAIOverview() {
  const [loading, setLoading] = useState(true);

  // Serial Position: top-left & bottom-most KPIs are most important
  const [revenueAtRisk, setRevenueAtRisk] = useState<number>(367000);
  const [aiVisibility, setAiVisibility] = useState<number>(92);

  // Accuracy metrics (realistic, transparent)
  const [accuracyMetrics] = useState({
    issueDetection: 87,        // 85-90% accurate
    rankingCorrelation: 72,    // 70-75%
    consensusReliability: 92,  // 92% (when all 3 AIs agree)
    voiceSearch: 65            // 65% accuracy
  });

  // Impressions Trend (derived visibility proxy)
  const impressions: Trend[] = useMemo(
    () => [
      { date: 'W1', impressions: 12800 },
      { date: 'W2', impressions: 14250 },
      { date: 'W3', impressions: 13620 },
      { date: 'W4', impressions: 15110 },
      { date: 'W5', impressions: 16440 },
      { date: 'W6', impressions: 15930 },
    ],
    [],
  );

  // Hick's/Miller's: minimize categories + chunks
  const traffic: Traffic[] = useMemo(
    () => [
      { name: 'Organic', value: 48 },
      { name: 'AI Overviews', value: 22 },
      { name: 'Direct', value: 18 },
      { name: 'Paid', value: 8 },
      { name: 'Social', value: 4 },
    ],
    [],
  );

  const funnel: Funnel[] = useMemo(
    () => [
      { stage: 'Upper', value: 100 }, // impressions/mentions/citations normalized
      { stage: 'Lower', value: 37 },  // leads/replies/conversions normalized
    ],
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600); // Doherty: show skeleton <400ms; else quick fallback
    return () => clearTimeout(t);
  }, []);

  /* --- Panels (mapped to laws) --------------------------------------- */
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 text-white">

      {/* TOP ROW — Von Restorff + Fitts's + Serial Position */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPI
          title="Revenue at Risk"
          value={loading ? <Skeleton h={32} /> : `$${(revenueAtRisk / 1000).toFixed(0)}K`}
          sub="Estimated monthly exposure"
          tone="critical"
          onClick={() => {/* open details */}}
          ariaLabel="View revenue at risk details: $367K estimated monthly exposure"
        />
        <KPI
          title="AI Visibility"
          value={loading ? <Skeleton h={32} /> : `${aiVisibility}%`}
          sub="Composite of Google/ChatGPT/Perplexity/Claude"
          tone="ok"
          ariaLabel="AI Visibility score: 92% across Google, ChatGPT, Perplexity, and Claude"
        />
        <Card>
          <div className="mb-2 text-xs text-white/60">Impressions Trend</div>
          <div className="h-36">
            {loading ? (
              <Skeleton h={144} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={impressions} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#CBD5E1" />
                  <YAxis stroke="#CBD5E1" />
                  <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid #334155' }} />
                  <Line type="monotone" dataKey="impressions" stroke="#60A5FA" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 text-[11px] text-white/50">
            First Principles: impressions = visibility proxy derived from AI citations & mentions.
          </div>
        </Card>
      </div>

      {/* SECOND ROW — Hick's + Miller's + Tesler's */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 text-xs text-white/60">Upper vs Lower Funnel (Leakage)</div>
          <div className="h-40">
            {loading ? (
              <Skeleton h={160} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="stage" stroke="#CBD5E1" />
                  <YAxis stroke="#CBD5E1" />
                  <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid #334155' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#A78BFA" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 text-[11px] text-white/50">
            Hick&apos;s: only two choices (Upper/Lower). Tesler&apos;s: system computes leakage.
          </div>
        </Card>

        <Card>
          <div className="mb-2 text-xs text-white/60">Traffic Sources Breakdown</div>
          <div className="h-40">
            {loading ? (
              <Skeleton h={160} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={traffic} margin={{ right: 10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#CBD5E1" />
                  <YAxis stroke="#CBD5E1" />
                  <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid #334155' }} />
                  <Legend />
                  <Bar dataKey="value" name="% of sessions" radius={[8, 8, 0, 0]} fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 text-[11px] text-white/50">
            Miller&apos;s: cap categories ≤5 to avoid overload.
          </div>
        </Card>
      </div>

      {/* THIRD ROW — Gestalt + Aesthetic-Usability + Pareto */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 text-xs text-white/60">UGC / Review Health</div>
          {loading ? (
            <Skeleton h={120} />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <KPI title="Avg Rating" value="4.2 ★" sub="All platforms" />
              <KPI title="Response Rate" value="58%" sub="last 30d" />
              <KPI title="New Reviews" value="97" sub="last 30d" />
            </div>
          )}
          <div className="mt-2 text-[11px] text-white/50">
            Gestalt: reputation signals grouped. Aesthetic-Usability: calm visuals build trust.
          </div>
        </Card>

        <Card>
          <div className="mb-2 text-xs text-white/60">Zero-Click Visibility</div>
          {loading ? (
            <Skeleton h={120} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <KPI title="AI Overviews" value="64%" sub="query inclusion" />
              <KPI title="Featured Snippets" value="22%" sub="eligible queries" />
              <KPI title="Citations / mo" value="31" sub="multiplatform" />
              <KPI title="Answer Coverage" value="77%" sub="FAQ/How-to" />
            </div>
          )}
          <div className="mt-2 text-[11px] text-white/50">
            Pareto: the few zero-click KPIs that move 80% of outcomes.
          </div>
        </Card>
      </div>

      {/* BOTTOM ROW — Zeigarnik + Doherty + Jakob's */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs text-white/60">Live Intelligence Feed</div>
          <button
            className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white/70 hover:border-white/40"
            aria-label="Open AI recommendations panel"
          >
            Open Recommendations
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton h={16} />
            <Skeleton h={16} />
            <Skeleton h={16} />
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            <li className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
              ⚠️ Critical: Revenue at Risk +$12K vs last week — <button className="underline" aria-label="Fix revenue at risk issue now">Fix Now</button>
            </li>
            <li className="rounded-lg border border-white/10 bg-white/5 p-3">
              ✅ AI Overviews inclusion up 6% for &quot;oil change naples fl&quot;
            </li>
            <li className="rounded-lg border border-white/10 bg-white/5 p-3">
              💬 Respond to 12 new Google reviews <button className="underline" aria-label="Open review response queue with 12 pending reviews">Open Queue</button>
            </li>
          </ul>
        )}
        <div className="mt-2 text-[11px] text-white/50">
          Zeigarnik: incomplete tasks (&quot;Fix Now&quot;) maintain tension. Jakob&apos;s: feed patterns mimic familiar tools.
        </div>
      </Card>

      {/* TRANSPARENCY ROW — System Accuracy & Trust */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs text-white/60">AI System Accuracy & Transparency</div>
          <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
            Triple-Verified
          </span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Skeleton h={80} />
            <Skeleton h={80} />
            <Skeleton h={80} />
            <Skeleton h={80} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50">Issue Detection</div>
              <div className="mt-1 text-2xl font-semibold text-white">{accuracyMetrics.issueDetection}%</div>
              <div className="mt-1 text-[10px] text-white/40">85-90% range</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50">Ranking Correlation</div>
              <div className="mt-1 text-2xl font-semibold text-white">{accuracyMetrics.rankingCorrelation}%</div>
              <div className="mt-1 text-[10px] text-white/40">70-75% range</div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="text-xs text-emerald-300">Consensus Reliability</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-200">{accuracyMetrics.consensusReliability}%</div>
              <div className="mt-1 text-[10px] text-emerald-300/70">All 3 AIs agree</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50">Voice Search</div>
              <div className="mt-1 text-2xl font-semibold text-white">{accuracyMetrics.voiceSearch}%</div>
              <div className="mt-1 text-[10px] text-white/40">Emerging tech</div>
            </div>
          </div>
        )}
        <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">
          <strong>What we promise:</strong> Triple-verified recommendations using Google, ChatGPT, and Perplexity AI.
          <br />
          <strong>What we don&apos;t promise:</strong> Guaranteed #1 rankings. SEO involves many factors beyond our control.
        </div>
        <div className="mt-2 text-[11px] text-white/50">
          Trust Through Transparency: We share real accuracy metrics, not marketing promises.
        </div>
      </Card>

      {/* Von Restorff — optional global alert (use sparingly) */}
      <div className="rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-sm" role="alert" aria-live="polite">
        🔴 Alert: Revenue at Risk is trending upward. <button className="underline" aria-label="View revenue mitigation plan">View mitigation plan</button>
      </div>
    </div>
  );
}
