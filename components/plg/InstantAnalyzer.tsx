"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2, CheckCircle, Zap, AlertTriangle } from "lucide-react";

type AIScore = { platform: string; score: number; latencyMs?: number };
type Result = {
  inclusion: number;
  ai: AIScore[];
  risk: number;
  schema?: { coverage: number; errors: string[] };
  ugc?: { mentions7d: number; positive: number };
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-xl p-3 bg-gradient-to-br from-white to-gray-50">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        {value}
      </div>
    </div>
  );
}

export default function InstantAnalyzer({
  dealer,
  onClose,
}: {
  dealer: string;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"loading" | "ready" | "locked">("loading");
  const [email, setEmail] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const [health, zeroClick, schema, ugc] = await Promise.all([
          fetch("/api/ai/health").then((r) => r.json()),
          fetch(`/api/zero-click?dealer=${encodeURIComponent(dealer)}`).then(
            (r) => r.json()
          ),
          fetch(`/api/schema?origin=${encodeURIComponent(dealer)}`).then((r) =>
            r.json()
          ),
          fetch("/api/ugc").then((r) => r.json()),
        ]);

        const inclusion = zeroClick.inclusionRate || 0.6;
        const ai = (health.aiHealth || []).map((x: any) => ({
          platform: x.platform,
          score: Math.round(x.visibility * 100),
          latencyMs: x.latencyMs,
        }));
        const risk = Math.round((1 - inclusion) * 70000);

        setRes({
          inclusion,
          ai,
          risk,
          schema: schema
            ? {
                coverage: schema.coverage,
                errors: schema.errors || [],
              }
            : undefined,
          ugc: ugc.summary,
        });
        setStage("ready");
      } catch (err: any) {
        console.error("[InstantAnalyzer] Error:", err);
        setError(err.message || "Failed to load data");
        setStage("ready");
      }
    })();
  }, [dealer]);

  const unlock = async () => {
    if (!email) {
      setStage("locked");
      return;
    }

    try {
      // Prepare scan results for storage
      const scanResults = res
        ? {
            zeroClick: Math.round(res.inclusion * 100),
            aiVisibility: Math.round(
              res.ai.reduce((a, c) => a + c.score, 0) / res.ai.length
            ),
            schemaCoverage: res.schema
              ? Math.round(res.schema.coverage * 100)
              : null,
            revenueAtRisk: res.risk,
            chatgptScore: res.ai.find((a) => a.platform === "ChatGPT")?.score,
            claudeScore: res.ai.find((a) => a.platform === "Claude")?.score,
            perplexityScore: res.ai.find((a) => a.platform === "Perplexity")
              ?.score,
            geminiScore: res.ai.find((a) => a.platform === "Gemini")?.score,
          }
        : null;

      // Extract UTM parameters from URL if available
      const searchParams = new URLSearchParams(window.location.search);
      const utm = {
        source: searchParams.get("utm_source") || undefined,
        medium: searchParams.get("utm_medium") || undefined,
        campaign: searchParams.get("utm_campaign") || undefined,
        term: searchParams.get("utm_term") || undefined,
        content: searchParams.get("utm_content") || undefined,
      };

      // Use active email capture endpoint
      await fetch("/api/landing/email-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          dealerName: dealer,
          revenueAtRisk: scanResults?.revenueAtRisk || 0
        }),
      });
    } catch (err) {
      console.error("[Email Capture]", err);
    }

    setStage("ready");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <div>
            <div className="font-bold text-lg">Instant Analysis</div>
            <div className="text-sm text-gray-600">{dealer}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {stage === "loading" && (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin w-10 h-10 text-blue-600 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-700">
              Crunching signals…
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Analyzing AI visibility, zero-click coverage, and schema health
            </div>
          </div>
        )}

        {/* Ready State */}
        {stage === "ready" && res && (
          <div className="p-6 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900">
                    Error loading data
                  </div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                </div>
              </div>
            )}

            {/* Top Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Stat
                label="Zero-Click Inclusion"
                value={`${Math.round(res.inclusion * 100)}%`}
              />
              <Stat
                label="Avg AI Visibility"
                value={`${Math.round(
                  res.ai.reduce((a, c) => a + c.score, 0) / res.ai.length
                )}%`}
              />
              <Stat
                label="Est. Revenue at Risk"
                value={`$${res.risk.toLocaleString()}`}
              />
            </div>

            {/* AI Platform Scores */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                AI Platform Visibility
              </h3>
              <div className="grid md:grid-cols-4 gap-3">
                {res.ai.map((a) => (
                  <div
                    key={a.platform}
                    className="border rounded-xl p-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="text-sm text-gray-500">{a.platform}</div>
                    <div className="text-xl font-bold">{a.score}%</div>
                    {a.latencyMs && (
                      <div className="text-xs text-gray-400 mt-1">
                        {a.latencyMs}ms
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Schema Coverage */}
            {res.schema && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Schema Coverage
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      Overall Coverage
                    </span>
                    <span className="text-lg font-bold">
                      {Math.round(res.schema.coverage * 100)}%
                    </span>
                  </div>
                  {res.schema.errors.length > 0 && (
                    <div className="space-y-1">
                      {res.schema.errors.slice(0, 3).map((err, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-red-600 flex items-start gap-2"
                        >
                          <span className="text-red-400">•</span>
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* UGC Summary */}
            {res.ugc && (
              <div className="grid md:grid-cols-3 gap-3">
                <div className="border rounded-xl p-3">
                  <div className="text-xs text-gray-500">Mentions (7d)</div>
                  <div className="text-xl font-bold">{res.ugc.mentions7d}</div>
                </div>
                <div className="border rounded-xl p-3">
                  <div className="text-xs text-gray-500">Sentiment</div>
                  <div className="text-xl font-bold">
                    {Math.round(res.ugc.positive * 100)}%
                  </div>
                </div>
                <div className="border rounded-xl p-3">
                  <div className="text-xs text-gray-500">Avg Response</div>
                  <div className="text-xl font-bold">
                    {res.ugc.avgResponseHrs}h
                  </div>
                </div>
              </div>
            )}

            {/* Unlock Full Report */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    Unlock full report
                  </div>
                  <div className="text-xs text-gray-600">
                    Get trends, UGC risks, schema gaps, and actionable fixes
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@dealership.com"
                    className="px-3 py-2 rounded-lg border text-sm"
                  />
                  <button
                    onClick={unlock}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Get Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locked State */}
        {stage === "locked" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-lg font-semibold mb-2">
              We just need your email to reveal the details.
            </div>
            <div className="text-sm text-gray-600 mb-4">
              No spam, just your full AI visibility report
            </div>
            <div className="flex gap-2 justify-center">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg border"
                placeholder="you@dealership.com"
              />
              <button
                onClick={unlock}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                <Zap className="w-4 h-4" />
                Continue
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
