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
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
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
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{result.dealership}</h3>
                  <p className="text-sm text-slate-400">{result.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-400">{result.overall}</div>
                  <div className="text-xs text-slate-400">Overall Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {result.platforms.map((platform: any) => (
                  <div
                    key={platform.name}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center"
                  >
                    <div className="text-xs text-slate-400">{platform.name}</div>
                    <div className="mt-1 text-xl font-bold text-emerald-400">{platform.score}</div>
                    <div className="mt-1 text-[10px] text-slate-500">{platform.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {result.issues && result.issues.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h4 className="mb-4 font-semibold text-white">Top Issues to Fix</h4>
                <div className="space-y-2">
                  {result.issues.map((issue: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{issue.title}</div>
                        <div className="text-xs text-slate-400">Est. effort: {issue.effort}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-rose-400">
                          -${issue.impact.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">revenue impact</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
