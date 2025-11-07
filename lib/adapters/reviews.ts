// lib/adapters/reviews.ts
export type Pulse = {
  id: string;
  title: string;
  diagnosis: string;
  prescription: string;
  impactMonthlyUSD: number;
  etaSeconds: number;
  confidenceScore: number;
  recencyMinutes: number;
  kind: "reviews" | "ugc";
};

export async function reviewsToPulses(params: { placeId?: string; domain?: string }): Promise<Pulse[]> {
  try {
    const q = new URLSearchParams();
    if (params.placeId) q.set("placeId", params.placeId);
    if (params.domain) q.set("domain", params.domain);
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reviews/summary?${q.toString()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const r = await res.json();

    const pulses: Pulse[] = [];
    // 1) Reply latency pulse
    if (r.replyLatencyHours > 48 || r.recentUnanswered > 5) {
      pulses.push({
        id: "reviews_latency_high",
        title: `${r.recentUnanswered} reviews unanswered • Avg reply ${r.replyLatencyHours}h`,
        diagnosis: `Slow replies erode Trust (ATI). Current reply rate ${r.replyRatePct}%`,
        prescription: "Batch-respond last 30 days; enable alerts; schedule daily 10am replies.",
        impactMonthlyUSD: 3100,
        etaSeconds: 120,
        confidenceScore: 0.78,
        recencyMinutes: 20,
        kind: "reviews",
      });
    }
    // 2) Cadence/volume pulse
    if (r.last30New < 40 && r.avgRating < 4.4) {
      pulses.push({
        id: "reviews_cadence_low",
        title: "Low review cadence may cap visibility",
        diagnosis: `Only ${r.last30New} new reviews in 30 days at ${r.avgRating.toFixed(1)}★`,
        prescription: "Activate post-service SMS ask; target +2/day; add QR at cashier.",
        impactMonthlyUSD: 1500,
        etaSeconds: 90,
        confidenceScore: 0.65,
        recencyMinutes: 20,
        kind: "ugc",
      });
    }

    return pulses;
  } catch {
    return [];
  }
}
