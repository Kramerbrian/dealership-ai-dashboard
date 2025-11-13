import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get("domain") || "example.com";

  // Inputs (defaults are safe placeholders; replace with orchestrator data as you wire it)
  const adSpend = Number(url.searchParams.get("adSpend") || 12000);         // USD/month
  const adWastePct = Number(url.searchParams.get("adWastePct") || 0.45);    // 0..1
  const visitors = Number(url.searchParams.get("visitors") || 2500);
  const visibilityLossPct = Number(url.searchParams.get("visibilityLossPct") || 0.25); // ((100 - AIV)/100)
  const leadConvRatePct = Number(url.searchParams.get("leadConvPct") || 0.05);           // 0..1
  const avgLeadValue = Number(url.searchParams.get("leadValue") || 450);    // USD per closed deal
  const recovered = Number(url.searchParams.get("recovered") || 3800);      // Recovered $
  const months = Number(url.searchParams.get("months") || 6);

  const wastedSpend = adSpend * adWastePct;
  const lostLeadsValue = visitors * visibilityLossPct * (leadConvRatePct) * avgLeadValue;
  const oel = Math.max(0, wastedSpend + Math.max(0, lostLeadsValue) - Math.max(0, recovered));

  // Normalize efficiency score: higher is better
  const baseline = Math.max(1, adSpend * 1.5); // naive baseline for normalization
  const score = Number(Math.max(0, 100 - (oel / baseline) * 100).toFixed(1));

  // Synthetic trailing months (replace with real series when available)
  const now = new Date();
  const series = Array.from({length: months}).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const noise = (Math.sin(i) + Math.random() * 0.3) * 0.1; // small variation
    const mOel = Math.max(0, oel * (1 + noise - 0.05 * (months - 1 - i) / months));
    return {
      period: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
      oel: Math.round(mOel),
    };
  });

  return NextResponse.json({
    domain,
    inputs: {
      adSpend, adWastePct, visitors, visibilityLossPct, leadConvRatePct, avgLeadValue, recovered
    },
    wastedSpend: Math.round(wastedSpend),
    lostLeadsValue: Math.round(lostLeadsValue),
    oel: Math.round(oel),
    score,
    series
  });
}
