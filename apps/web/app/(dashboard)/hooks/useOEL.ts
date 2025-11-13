"use client";

import * as React from "react";
import { getApiBase } from "@/lib/apiConfig";

export type OELResponse = {
  domain: string;
  inputs: {
    adSpend: number;
    adWastePct: number;
    visitors: number;
    visibilityLossPct: number;
    leadConvRatePct: number;
    avgLeadValue: number;
    recovered: number;
  };
  wastedSpend: number;
  lostLeadsValue: number;
  oel: number;
  score: number; // 0..100 (higher is better)
  series: { period: string; oel: number }[];
};

export function useOEL(domain?: string) {
  const [data, setData] = React.useState<OELResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!domain) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/metrics/oel?domain=${encodeURIComponent(domain)}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load OEL");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [domain]);

  return { data, loading, err };
}
