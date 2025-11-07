// lib/adapters/visibility.ts
import { loadFormulaRegistry } from "@/lib/formulas/registry";

export type Pulse = {
  id: string;
  title: string;
  diagnosis: string;
  prescription: string;
  impactMonthlyUSD: number;
  etaSeconds: number;
  confidenceScore: number;
  recencyMinutes: number;
  kind: "visibility" | "seo" | "geo";
};

type EngineName = "ChatGPT" | "Perplexity" | "Gemini" | "Copilot";

export async function visibilityToPulses(domain?: string): Promise<Pulse[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/visibility/presence?domain=${encodeURIComponent(domain || "")}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const v = await res.json();

    const byName: Record<EngineName, number> = {} as any;
    for (const e of v.engines || []) byName[e.name as EngineName] = e.presencePct;

    const reg = await loadFormulaRegistry();
    const thr = reg.visibility_thresholds;

    const pulses: Pulse[] = [];
    (["ChatGPT", "Perplexity", "Gemini", "Copilot"] as EngineName[]).forEach((engine) => {
      const pct = byName[engine] ?? 0;
      if (pct <= (thr[engine]?.critical ?? 0)) {
        pulses.push(makePulse(engine, pct, "critical"));
      } else if (pct <= (thr[engine]?.warn ?? 0)) {
        pulses.push(makePulse(engine, pct, "warn"));
      }
    });

    return pulses;
  } catch {
    return [];
  }
}

function makePulse(engine: EngineName, pct: number, level: "warn" | "critical"): Pulse {
  const base = level === "critical" ? 2400 : 1600;
  const prescByEngine: Record<EngineName, string> = {
    ChatGPT: "Publish entity-rich FAQs and ensure AutoDealer schema is complete with NAP consistency.",
    Perplexity: "Add FAQPage schema and cite authoritative sources; ensure clean sitemap & crawl.",
    Gemini: "Embed FAQPage schema on Service pages; add Q&A anchors and revalidate with Rich Results.",
    Copilot: "Align GBP hours/address with site; provide review snippets; check AutoDealer schema."
  };

  return {
    id: `engine_${engine.toLowerCase()}_${level}`,
    title: `${engine} presence ${pct.toFixed(0)}%`,
    diagnosis: `${engine} presence below ${(level === "critical" ? "critical" : "warning")} threshold.`,
    prescription: prescByEngine[engine],
    impactMonthlyUSD: base,
    etaSeconds: 120,
    confidenceScore: level === "critical" ? 0.72 : 0.66,
    recencyMinutes: 15,
    kind: "visibility"
  };
}
