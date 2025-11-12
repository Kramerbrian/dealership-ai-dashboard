import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { domain, kinds } = (await req.json()) as {
    domain?: string;
    kinds?: ("schema" | "review" | "cwv" | "nap")[];
  };
  if (!kinds?.length) return NextResponse.json({ error: "No fixes selected" }, { status: 400 });

  const LIFTS = { schema: 2800, review: 2200, cwv: 1800, nap: 1200 };
  const breakdown = kinds.map((k) => ({
    kind: k,
    lift: LIFTS[k as keyof typeof LIFTS] ?? 1000,
    notes:
      k === "schema"
        ? "FAQ/HowTo/Offer/Product coverage improves AEO/AVI."
        : k === "review"
        ? "Faster responses lift Trust & UGC."
        : k === "cwv"
        ? "LCP/INP/CLS improvements raise crawl rate."
        : "Citation cleanup improves Map Pack consistency."
  }));

  const weights = [1, 0.75, 0.5, 0.25];
  const estimatedRecovery = Math.round(
    breakdown.reduce((s, b, i) => s + b.lift * (weights[i] ?? 0.15), 0)
  );
  const confidence = Math.max(0.6, Math.min(0.95, 0.65 + breakdown.length * 0.07));

  return NextResponse.json({ ok: true, domain: domain || null, estimatedRecovery, confidence, breakdown });
}
