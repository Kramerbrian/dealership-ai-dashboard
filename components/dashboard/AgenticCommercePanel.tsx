"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AgenticKPIs {
  acr: number; // Agentic Conversion Rate
  trustPass: number; // Trust Pass Rate (ATI ≥ 85)
  latencyMs: number; // VIN→Intent Latency
  zeroClick: number; // Zero-Click Coverage
}

export default function AgenticCommercePanel({ dealerId }: { dealerId: string }) {
  const [kpi, setKpi] = useState<AgenticKPIs>({
    acr: 0.0,
    trustPass: 0.0,
    latencyMs: 0,
    zeroClick: 0.0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: pull from /api/metrics/agentic/reads or aggregated endpoint
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);

        // For now, use stub data
        // In production, fetch from: /api/metrics/agentic?dealerId=${dealerId}
        const mockData: AgenticKPIs = {
          acr: 0.18,
          trustPass: 0.84,
          latencyMs: 420,
          zeroClick: 0.56,
        };

        setKpi(mockData);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch agentic metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [dealerId]);

  async function enableCheckout() {
    try {
      setLoading(true);
      const response = await fetch("/api/agentic/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerId, source: "dashboard" }),
      });

      if (!response.ok) {
        throw new Error(`Failed to enable checkout: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Open checkout URL if provided
      if (data.ai_checkout_url && data.ai_checkout_url !== "https://stripe.example/checkout/session/demo") {
        window.open(data.ai_checkout_url, "_blank");
      } else {
        alert("Checkout enabled! Next step: " + data.next);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to enable checkout:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-slate-900/80 border border-slate-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white">Agentic Commerce</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-slate-300">
        {error && (
          <div className="p-2 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm mb-2">
            Error: {error}
          </div>
        )}

        {loading && !kpi.acr && (
          <div className="text-sm text-slate-500">Loading metrics...</div>
        )}

        {!loading && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Agentic Conversion Rate (ACR):</span>
                <span className="text-white font-semibold">{Math.round(kpi.acr * 100)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Trust Pass Rate (ATI ≥ 85):</span>
                <span className="text-white font-semibold">{Math.round(kpi.trustPass * 100)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>VIN→Intent Latency:</span>
                <span className="text-white font-semibold">{kpi.latencyMs} ms</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Zero-Click Coverage:</span>
                <span className="text-white font-semibold">{Math.round(kpi.zeroClick * 100)}%</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <Button
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                onClick={enableCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Enable Instant Checkout"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

