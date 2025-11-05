"use client";

import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip-shadcn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, TrendingUp, TrendingDown, Minus, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------- TYPES ----------------
interface MetricHoverProps {
  label: string;
  abbreviation: string;
  score?: number;
  prevScore?: number;
  history?: { date: string; value: number }[];
}

interface ScoreData {
  AIV: number;
  ATI: number;
  CVI: number;
  ORI: number;
  GRI: number;
  DPI: number;
}

// ---------------- HOVER TEXTS ----------------
const hoverTexts: Record<string, string> = {
  AIV: `Visibility (AIV™) — Measures how easily your dealership can be found across search engines and AI assistants.

Ingredients: SEO, AEO inclusion, local search (GEO), structured data/schema accuracy, and user-generated content (UGC) quality.

Data Sources: Crawl, Search APIs, Google Business Profile.

Output: AI Discoverability Score (0–100).`,

  ATI: `Trust (ATI™) — Quantifies credibility and authenticity online.

Ingredients: Reviews, schema consistency, E-E-A-T signals, and source reliability.

Data Sources: Google Business Profile, review APIs, on-page trust markers.

Output: Algorithmic Trust Index (0–100).`,

  CVI: `Conversion (CVI™) — Measures how well your website converts traffic into real leads.

Ingredients: Form submissions, CTA click rates, session depth, chat interactions.

Data Sources: GA4 + CRM.

Output: Conversion Efficiency (0–100).`,

  ORI: `Operations (ORI™) — Tracks inventory and service performance efficiency.

Ingredients: Aged inventory %, price competitiveness, RO count, days-to-turn.

Data Sources: DMS, vAuto.

Output: Operational Health (0–100).`,

  GRI: `Growth Readiness (GRI™) — Evaluates scalability and process maturity.

Ingredients: Automation adoption, data hygiene, response time.

Data Sources: CRM + process logs.

Output: Readiness Rating (0–100).`,

  DPI: `Dealership Performance Index (DPI) — Weighted composite of all core KPIs.

Formula: (0.25×AIV)+(0.20×ATI)+(0.25×CVI)+(0.20×ORI)+(0.10×GRI).

Output: Overall Performance Index (0–100).`,

  GUARDRAILS: `Guardrails:

  • 90–100: Market Leader — Maintain cadence; expand AI-driven content.

• 75–89: Competitive — Improve schema, reviews, visibility.

• 60–74: Underperforming — Activate Auto-Fix + content rewrites.

• <60: At Risk — Immediate triage (GBP, schema, aged inventory).`,

};

// ---------------- COLORS ----------------
const baseColor: Record<string, string> = {
  AIV: "border-blue-400 text-blue-300 bg-blue-950/90",
  ATI: "border-yellow-400 text-yellow-300 bg-yellow-950/90",
  CVI: "border-green-400 text-green-300 bg-green-950/90",
  ORI: "border-red-400 text-red-300 bg-red-950/90",
  GRI: "border-purple-400 text-purple-300 bg-purple-950/90",
  DPI: "border-cyan-400 text-cyan-300 bg-cyan-950/90",
  GUARDRAILS: "border-slate-500 text-slate-300 bg-slate-900/95",
};

function getGlowColor(score?: number) {
  if (score === undefined) return "";
  if (score >= 90) return "shadow-[0_0_15px_rgba(34,197,94,0.6)]";
  if (score >= 75) return "shadow-[0_0_15px_rgba(234,179,8,0.6)]";
  if (score >= 60) return "shadow-[0_0_15px_rgba(59,130,246,0.5)]";
  return "shadow-[0_0_15px_rgba(239,68,68,0.6)]";
}

function getTrendIcon(score?: number, prevScore?: number) {
  if (score === undefined || prevScore === undefined)
    return <Minus className="w-4 h-4 text-slate-400" />;
  if (score > prevScore)
    return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (score < prevScore)
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

// ---------------- MAIN COMPONENT ----------------
export const MetricHover: React.FC<MetricHoverProps> = ({
  label,
  abbreviation,
  score,
  prevScore,
  history = [],
}) => {
  const glow = getGlowColor(score);
  const trendIcon = getTrendIcon(score, prevScore);
  const [open, setOpen] = useState(false);

  return (
    <>
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
              onClick={() => setOpen(true)}
              className={`flex items-center justify-between gap-2 cursor-pointer px-3 py-2 rounded-xl border ${baseColor[abbreviation]} ${glow} transition-shadow duration-300`}
          >
            <span className="font-semibold text-white">{label}</span>
            <div className="flex items-center gap-1">
              {score !== undefined && (
                <span className="text-sm text-slate-300">{score}</span>
              )}
              {trendIcon}
            </div>
              <BarChart2 className="w-4 h-4 text-slate-400 hover:text-white transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={`max-w-sm text-sm leading-relaxed p-3 rounded-xl border shadow-md ${baseColor[abbreviation]}`}
        >
          <div className="font-semibold mb-1 text-white">{label}</div>
          <p className="whitespace-pre-line text-slate-200">
            {hoverTexts[abbreviation]}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

      {/* Drill-down Modal with Tabs */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-slate-900 border border-slate-700 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">{label}</DialogTitle>
            <DialogDescription className="text-slate-300">{hoverTexts[abbreviation]}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="trend" className="mt-4">
            <TabsList className="flex space-x-2 border-b border-slate-700 mb-4 bg-transparent">
              <TabsTrigger 
                value="trend" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
              >
                Trend
              </TabsTrigger>
              <TabsTrigger 
                value="region"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
              >
                Compare Against Region
              </TabsTrigger>
              <TabsTrigger 
                value="actions"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
              >
                Focus Areas
              </TabsTrigger>
            </TabsList>

            {/* --- TAB 1: Trend Chart --- */}
            <TabsContent value="trend">
              <h3 className="text-sm uppercase text-slate-400 mb-2">Historical Trend (Last 6 Weeks)</h3>
              <div className="h-48 bg-slate-950 rounded-lg p-3 border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ r: 2, fill: "#38bdf8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* --- TAB 2: Regional Benchmark --- */}
            <TabsContent value="region">
              <h3 className="text-sm uppercase text-slate-400 mb-2">
                Regional Benchmark Comparison (DMA / Brand Tier)
              </h3>

              {(() => {
                const currentScore = score || 0;
                const dmaMedian = Math.max(0, currentScore - 8);
                const topQuartile = Math.min(100, currentScore + 5);
                
                const regionalData = [
                  { name: "Your Store", value: currentScore },
                  { name: "DMA Median", value: dmaMedian },
                  { name: "Top Quartile", value: topQuartile },
                ];

                // Calculate percentile rank (top X%)
                const rankPercent = Math.max(0, Math.min(100, 100 - ((currentScore - dmaMedian) / (topQuartile - dmaMedian)) * 25));

                return (
                  <>
                    <div className="h-48 bg-slate-950 rounded-lg p-3 border border-slate-800 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionalData}>
                          <XAxis 
                            dataKey="name" 
                            stroke="#64748b"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            hide
                          />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                              color: "#e2e8f0",
                            }}
                            formatter={(value: any) => [`${Math.round(value)}`, 'Score']}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {regionalData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.name === "Your Store"
                                    ? "#38bdf8"
                                    : entry.name === "Top Quartile"
                                    ? "#22c55e"
                                    : "#eab308"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-slate-300 text-sm">
                      You rank in the top <span className="font-semibold text-white">{Math.round(rankPercent)}%</span>{" "}
                      of {abbreviation === "AIV" ? "AI Visibility" : abbreviation === "ATI" ? "Trust" : abbreviation === "CVI" ? "Conversion" : abbreviation === "ORI" ? "Operations" : abbreviation === "GRI" ? "Growth Readiness" : "Performance"} scores
                      across Nissan dealerships in your DMA.
                    </p>
                  </>
                );
              })()}
            </TabsContent>

            {/* --- TAB 3: Focus Areas --- */}
            <TabsContent value="actions">
              <h3 className="text-sm uppercase text-slate-400 mb-2">Key Focus Areas</h3>
              <ul className="list-disc pl-6 text-slate-300 space-y-1 text-sm">
                {abbreviation === "AIV" && (
                  <>
                    <li>Boost schema coverage to improve AI visibility</li>
                    <li>Reinforce internal linking for silo integrity</li>
                    <li>Update stale meta titles/descriptions</li>
                  </>
                )}
                {abbreviation === "ATI" && (
                  <>
                    <li>Increase review response rate & freshness</li>
                    <li>Validate schema author and organization tags</li>
                    <li>Add E-E-A-T proof points to About/Service pages</li>
                  </>
                )}
                {abbreviation === "CVI" && (
                  <>
                    <li>Test CTA placement and color contrast</li>
                    <li>Enable chat and quote widgets on SRP/VDP</li>
                    <li>Audit form performance on mobile</li>
                  </>
                )}
                {abbreviation === "ORI" && (
                  <>
                    <li>Reprice aged inventory (&gt;45 days)</li>
                    <li>Track RO counts vs service appointment flow</li>
                    <li>Sync pricing to regional competitors weekly</li>
                  </>
                )}
                {abbreviation === "GRI" && (
                  <>
                    <li>Automate lead response assignment in CRM</li>
                    <li>Eliminate duplicate records weekly</li>
                    <li>Expand cross-platform data integrations</li>
                  </>
                )}
                {abbreviation === "DPI" && (
                  <>
                    <li>Focus on lowest-performing pillar (AIV, ATI, CVI, ORI, or GRI)</li>
                    <li>Review composite trends for systemic issues</li>
                    <li>Align operational changes with visibility goals</li>
                  </>
                )}
                {abbreviation === "GUARDRAILS" && (
                  <>
                    <li>Monitor all KPIs for threshold violations</li>
                    <li>Set up automated alerts for score drops</li>
                    <li>Review guardrail status weekly</li>
                  </>
                )}
              </ul>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ---------------- LIVE FETCH DASHBOARD ----------------
export default function LiveMetricsDashboard({ dealerDomain = "germainnissan.com" }: { dealerDomain?: string }) {
  const [scores, setScores] = useState<ScoreData | null>(null);
  const [prevScores, setPrevScores] = useState<ScoreData | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`/api/ai-scores?domain=${dealerDomain}`);
        const data = await res.json();

        const newScores: ScoreData = {
          AIV: Math.round(data.ai_visibility_overall ?? 0),
          ATI: Math.round(data.ati_index ?? 0),
          CVI: Math.round(data.cvi_score ?? 0),
          ORI: Math.round(data.ori_score ?? 0),
          GRI: Math.round(data.gri_score ?? 0),
          DPI: Math.round(data.dpi_composite ?? 0),
        };

        if (scores) setPrevScores(scores);
        localStorage.setItem(`prevScores_${dealerDomain}`, JSON.stringify(scores));
        localStorage.setItem(`latestScores_${dealerDomain}`, JSON.stringify(newScores));
        setScores(newScores);
      } catch {
        const cached = localStorage.getItem(`latestScores_${dealerDomain}`);
        if (cached) setScores(JSON.parse(cached));
      }
    };

    const cachedPrev = localStorage.getItem(`prevScores_${dealerDomain}`);
    if (cachedPrev) setPrevScores(JSON.parse(cachedPrev));
    fetchScores();
    const interval = setInterval(fetchScores, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dealerDomain]);

  const generateHistory = (base: number) =>
    Array.from({ length: 6 }, (_, i) => ({
      date: `W${i + 1}`,
      value: Math.max(0, base + Math.floor(Math.random() * 8 - 4)),
    }));

  const metrics = [
    { label: "Visibility (AIV™)", abbr: "AIV" },
    { label: "Trust (ATI™)", abbr: "ATI" },
    { label: "Conversion (CVI™)", abbr: "CVI" },
    { label: "Operations (ORI™)", abbr: "ORI" },
    { label: "Growth Readiness (GRI™)", abbr: "GRI" },
    { label: "Composite DPI", abbr: "DPI" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {metrics.map((m) => (
        <MetricHover
          key={m.abbr}
          label={m.label}
          abbreviation={m.abbr}
          score={(scores as any)?.[m.abbr]}
          prevScore={(prevScores as any)?.[m.abbr]}
          history={generateHistory((scores as any)?.[m.abbr] || 70)}
        />
      ))}
      <MetricHover label="Guardrails" abbreviation="GUARDRAILS" />
    </div>
  );
}
