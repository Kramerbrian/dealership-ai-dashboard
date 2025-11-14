"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, RefreshCw, Activity, CheckCircle2, XCircle } from "lucide-react";

/**
 * DealershipAI – Orchestrator Console
 * ----------------------------------------------------------
 * - Displays orchestrator job statuses (from /public/system-state.json)
 * - Allows manual orchestrator run (admin only)
 * - Shows last 10 orchestration events
 * - Uses Clerk role check for access gating
 */

export default function OrchestratorConsole({ user }: { user: any }) {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Clerk user metadata -> determine admin role
  useEffect(() => {
    const role = user?.publicMetadata?.role || "dealer";
    setIsAdmin(role === "admin");
  }, [user]);

  async function fetchState() {
    try {
      const res = await fetch("/system-state.json?ts=" + Date.now());
      const data = await res.json();
      setState(data);
    } catch (err) {
      setError("Failed to load orchestrator state.");
    }
  }

  async function runOrchestrator() {
    setLoading(true);
    try {
      const res = await fetch("/api/orchestrator-background");
      if (!res.ok) throw new Error("Run failed");
      await fetchState();
    } catch (err) {
      setError("Manual run failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchState();
  }, []);

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-slate-400">
        <Shield className="w-10 h-10 mb-3" />
        <p>Access restricted to admin users.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 p-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Orchestrator Console
        </h1>
        <Button
          onClick={runOrchestrator}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`}
          />
          {loading ? "Running..." : "Run Now"}
        </Button>
      </header>

      {error && (
        <div className="bg-red-800/40 border border-red-700 text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state &&
          Object.entries(state.results || {}).map(([job, result]: any) => (
            <Card
              key={job}
              className={`backdrop-blur-xl border ${
                result.success
                  ? "border-green-600/40"
                  : "border-red-600/40"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  {job}
                </CardTitle>
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-1">
                <p>Duration: {result.duration}s</p>
                <p>
                  Last Run:{" "}
                  {new Date(result.lastRun).toLocaleString(undefined, {
                    hour12: false
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Recent Orchestration Events
        </h2>
        <div className="mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4 text-slate-300 text-sm max-h-96 overflow-y-auto">
          {state && state.results
            ? Object.entries(state.results)
                .slice(-10)
                .map(([id, r]: any) => (
                  <div key={id} className="border-b border-slate-700/40 py-2">
                    <span
                      className={`font-medium ${
                        r.success ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {r.success ? "Success" : "Failed"}
                    </span>{" "}
                    – {id} – {r.duration}s at{" "}
                    {new Date(r.lastRun).toLocaleTimeString(undefined, {
                      hour12: false
                    })}
                  </div>
                ))
            : "No orchestration events logged yet."}
        </div>
      </section>
    </div>
  );
}

