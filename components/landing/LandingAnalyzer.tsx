"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function LandingAnalyzer() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/clarity/stack?domain=${encodeURIComponent(domain)}&light=true`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          Instant AI Visibility Check
        </h2>
        <p className="mb-6 text-center text-sm text-slate-400">
          Enter your dealership domain to see how you appear across ChatGPT, Claude, Perplexity, and more
        </p>

        <form onSubmit={handleAnalyze} className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="yourdealership.com"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              disabled={loading || !domain}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze Now"}
            </button>
          </div>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Clarity Stack Scores */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{result.domain}</h3>
                  <p className="text-sm text-slate-400">
                    {result.location?.city}, {result.location?.state}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-400">{result.scores?.avi || 0}</div>
                  <div className="text-xs text-slate-400">AI Visibility Index</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <div className="text-xs text-slate-400">SEO</div>
                  <div className="mt-1 text-xl font-bold text-emerald-400">{result.scores?.seo || 0}</div>
                  <div className="mt-1 text-[10px] text-slate-500">Searchability</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <div className="text-xs text-slate-400">AEO</div>
                  <div className="mt-1 text-xl font-bold text-blue-400">{result.scores?.aeo || 0}</div>
                  <div className="mt-1 text-[10px] text-slate-500">AI Answers</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <div className="text-xs text-slate-400">GEO</div>
                  <div className="mt-1 text-xl font-bold text-purple-400">{result.scores?.geo || 0}</div>
                  <div className="mt-1 text-[10px] text-slate-500">AI Entity</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <div className="text-xs text-slate-400">Revenue Risk</div>
                  <div className="mt-1 text-xl font-bold text-rose-400">
                    ${Math.round((result.revenue_at_risk?.monthly || 0) / 1000)}K
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">per month</div>
                </div>
              </div>

              {/* PLG Insights */}
              {result.insights && result.insights.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.insights.map((insight: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-lg border border-amber-900/30 bg-amber-950/20 p-3"
                    >
                      <span className="text-amber-400">⚠️</span>
                      <p className="text-sm text-amber-200">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Intro Card */}
            {result.ai_intro_current && result.ai_intro_improved && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h4 className="mb-4 font-semibold text-white">How You Appear to AI Search Engines</h4>

                <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-400">
                      Current
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{result.ai_intro_current}</p>
                </div>

                <div className="rounded-lg border border-emerald-800 bg-emerald-950/30 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      With DealershipAI
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{result.ai_intro_improved}</p>
                </div>

                <div className="mt-4">
                  <a
                    href={`/onboarding?dealer=${encodeURIComponent(result.domain)}`}
                    className="block rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-center font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-400"
                  >
                    Unlock Full Dashboard →
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
