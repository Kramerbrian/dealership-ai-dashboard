"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SchemaStatus {
  dealerId: string;
  last: {
    page: string;
    rich_results: boolean;
    gpt4_parse_score: number;
    gemini_parse_score?: number | null;
    claude_parse_score?: number | null;
    deltas: {
      AIV: number;
      ATI: number;
    };
    updatedAt: string;
  } | null;
}

export default function SchemaKingPanel({ 
  dealerId, 
  domain 
}: { 
  dealerId: string; 
  domain: string;
}) {
  const [status, setStatus] = useState<SchemaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/schema/status?dealerId=${encodeURIComponent(dealerId)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to refresh schema status:", err);
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    try {
      setLoading(true);
      setError(null);
      await fetch("/api/schema/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId,
          domain,
          pageType: "service",
          intent: "oil change",
        }),
      });
      await refresh();
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to generate schema:", err);
    } finally {
      setLoading(false);
    }
  }

  async function validate() {
    try {
      setLoading(true);
      setError(null);
      
      // First generate a draft
      const draftResponse = await fetch("/api/schema/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId,
          domain,
          pageType: "service",
          intent: "oil change",
        }),
      });
      
      if (!draftResponse.ok) {
        throw new Error("Failed to generate draft");
      }
      
      const draft = await draftResponse.json();
      
      // Then validate it
      await fetch("/api/schema/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId,
          jsonld: draft.jsonld,
          simulate_engines: ["richresults", "gpt4", "gemini"],
        }),
      });
      
      await refresh();
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to validate schema:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [dealerId]);

  return (
    <Card className="bg-slate-900/80 border border-slate-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white">Schema King · Orchestrator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-slate-300">
        <div>
          Dealer: <span className="text-white font-medium">{dealerId}</span> • Domain:{" "}
          <span className="text-slate-400">{domain}</span>
        </div>

        {error && (
          <div className="p-2 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm">
            Error: {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={generate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Generate Draft"}
          </Button>
          <Button
            onClick={validate}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "..." : "Validate & Score"}
          </Button>
          <Button
            onClick={refresh}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          >
            Refresh
          </Button>
        </div>

        {status?.last && (
          <div className="mt-3 text-sm space-y-1">
            <div>
              Last Page: <span className="text-white font-medium">{status.last.page}</span>
            </div>
            <div>
              Rich Results:{" "}
              <span className={status.last.rich_results ? "text-green-400" : "text-red-400"}>
                {String(status.last.rich_results)}
              </span>{" "}
              • GPT-4 Parse:{" "}
              <span className="text-white">
                {(status.last.gpt4_parse_score * 100).toFixed(1)}%
              </span>
            </div>
            {status.last.gemini_parse_score !== null && status.last.gemini_parse_score !== undefined && (
              <div>
                Gemini Parse:{" "}
                <span className="text-white">
                  {(status.last.gemini_parse_score * 100).toFixed(1)}%
                </span>
              </div>
            )}
            <div>
              ΔAIV:{" "}
              <span className={status.last.deltas.AIV >= 0 ? "text-green-400" : "text-red-400"}>
                {status.last.deltas.AIV >= 0 ? "+" : ""}
                {status.last.deltas.AIV.toFixed(2)}
              </span>{" "}
              • ΔATI:{" "}
              <span className={status.last.deltas.ATI >= 0 ? "text-green-400" : "text-red-400"}>
                {status.last.deltas.ATI >= 0 ? "+" : ""}
                {status.last.deltas.ATI.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Updated: {new Date(status.last.updatedAt).toLocaleString()}
            </div>
          </div>
        )}

        {!status?.last && !loading && (
          <div className="text-sm text-slate-500">No validation history yet. Generate and validate a schema to get started.</div>
        )}
      </CardContent>
    </Card>
  );
}

