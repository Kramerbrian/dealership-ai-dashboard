'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { AIAssistantQuery } from './ai-assistant-query';

/* --- UI Primitives ---------------------------------------------------- */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ${className}`} />
);

const KPI = ({
  title, value, sub, tone = 'default', onClick,
}: { title: string; value: React.ReactNode; sub?: string; tone?: 'default'|'critical'|'ok'; onClick?: () => void }) => (
  <button
    onClick={onClick}
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

  // AI assistant context
  const aiContext = useMemo(() => ({
    revenueAtRisk,
    aiVisibility,
    impressionsTrend: impressions,
    criticalAlerts: revenueAtRisk > 300000
  }), [revenueAtRisk, aiVisibility, impressions]);

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
        />
        <KPI
          title="AI Visibility"
          value={loading ? <Skeleton h={32} /> : `${aiVisibility}%`}
          sub="Composite of Google/ChatGPT/Perplexity/Claude"
          tone="ok"
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
            Hick's: only two choices (Upper/Lower). Tesler's: system computes leakage.
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
            Miller's: cap categories ≤5 to avoid overload.
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs text-white/60">Live Intelligence Feed</div>
            <button className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white/70 hover:border-white/40">
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
                ⚠️ Critical: Revenue at Risk +$12K vs last week — <button className="underline">Fix Now</button>
              </li>
              <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                ✅ AI Overviews inclusion up 6% for "oil change naples fl"
              </li>
              <li className="rounded-lg border border-white/10 bg-white/5 p-3">
                💬 Respond to 12 new Google reviews <button className="underline">Open Queue</button>
              </li>
            </ul>
          )}
          <div className="mt-2 text-[11px] text-white/50">
            Zeigarnik: incomplete tasks ("Fix Now") maintain tension. Jakob's: feed patterns mimic familiar tools.
          </div>
        </Card>

        <Card>
          <div className="mb-3 text-xs text-white/60">AI Assistant</div>
          <AIAssistantQuery
            context="dealership-overview"
            data={aiContext}
            theme="dark"
            placeholder="Ask about your AI visibility metrics..."
            onQuery={(query) => {
              // Context-aware responses based on current metrics
              if (query.includes('revenue')) {
                return `Your $${(revenueAtRisk/1000).toFixed(0)}K revenue at risk is ${revenueAtRisk > 300000 ? 'critically high' : 'manageable'}. Focus on AI visibility optimization.`;
              }
              if (query.includes('visibility')) {
                return `Your AI visibility is ${aiVisibility}%, which is ${aiVisibility >= 80 ? 'excellent' : aiVisibility >= 60 ? 'good' : 'needs improvement'}. ${aiVisibility < 80 ? 'Focus on E-E-A-T optimization.' : 'Great job maintaining visibility!'}`;
              }
              if (query.includes('trend')) {
                const latest = impressions[impressions.length - 1]?.impressions || 0;
                const previous = impressions[impressions.length - 2]?.impressions || 0;
                const growth = latest > previous ? 'increasing' : 'decreasing';
                return `Your impressions trend is ${growth} to ${latest.toLocaleString()}. This indicates ${latest > previous ? 'positive momentum' : 'optimization opportunities'} in AI search visibility.`;
              }
              return `Based on your current metrics (${aiVisibility}% AI visibility, $${(revenueAtRisk/1000).toFixed(0)}K revenue at risk), I can help you understand trends and optimization opportunities. What would you like to explore?`;
            }}
          />
          <div className="mt-2 text-[11px] text-white/50">
            AI-powered insights for your dealership's digital presence and optimization opportunities.
          </div>
        </Card>
      </div>

      {/* Von Restorff — optional global alert (use sparingly) */}
      <div className="rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-sm">
        🔴 Alert: Revenue at Risk is trending upward. <button className="underline">View mitigation plan</button>
      </div>
    </div>
  );
}
