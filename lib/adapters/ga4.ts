// lib/adapters/ga4.ts

export type Pulse = {

  id: string;

  title: string;

  diagnosis: string;

  prescription: string;

  impactMonthlyUSD: number;

  etaSeconds: number;

  confidenceScore: number;

  recencyMinutes: number;

  kind: "traffic" | "funnel";

};



export async function ga4ToPulses(domain?: string): Promise<Pulse[]> {

  try {

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch(

      `${baseUrl}/api/ga4/summary?domain=${encodeURIComponent(domain || "")}`,

      { cache: "no-store" }

    );

    if (!res.ok) return [];

    const g = await res.json();



    // Example logic: if AI-assisted sessions < 15% of total, propose AEO/GEO play

    const aiShare = g.aiAssistedSessions / Math.max(1, g.sessions);

    const needsAEO = aiShare < 0.18;

    const pulses: Pulse[] = [];



    if (needsAEO) {

      pulses.push({

        id: "ga4_ai_assisted_low",

        title: "AI-assisted traffic share is low",

        diagnosis: `Only ${(aiShare * 100).toFixed(1)}% of sessions are AI-assisted.`,

        prescription:

          "Add FAQ schema to top service pages and publish entity-rich answers. Target +5–8% AI-assisted share.",

        impactMonthlyUSD: 1900, // rough; replace with model

        etaSeconds: 180,

        confidenceScore: 0.7,

        recencyMinutes: 10,

        kind: "traffic",

      });

    }



    // Optional funnel pulse: bounce too high

    if (g.bounceRatePct > 55) {

      pulses.push({

        id: "ga4_bounce_high",

        title: "High bounce rate reduces conversions",

        diagnosis: `Bounce rate is ${g.bounceRatePct.toFixed(1)}% over last ${g.rangeDays} days.`,

        prescription:

          "Compress hero images, defer non-critical scripts, and surface primary CTA higher on page.",

        impactMonthlyUSD: 1200,

        etaSeconds: 180,

        confidenceScore: 0.6,

        recencyMinutes: 10,

        kind: "funnel",

      });

    }



    return pulses;

  } catch {

    return [];

  }

}
