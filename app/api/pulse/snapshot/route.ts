// app/api/pulse/snapshot/route.ts

import { NextResponse } from "next/server";

// Local adapters

import { schemaToPulses } from "@/lib/adapters/schema";

import { ga4ToPulses } from "@/lib/adapters/ga4";



// Pulse type shared with dashboard

type Pulse = {

  id: string;

  title: string;

  diagnosis: string;

  prescription: string;

  impactMonthlyUSD: number;

  etaSeconds: number;

  confidenceScore: number; // 0..1

  recencyMinutes: number;

  kind: "schema" | "faq" | "reviews" | "visibility" | "traffic" | "funnel" | "geo" | "seo";

};



// --- Synthetic Adapters (replace with real sources) ---

// Each adapter returns 0..N pulses for its pillar.



async function reviewsAdapter(gbpId?: string): Promise<Pulse[]> {

  // TODO: wire to Reviews API / GBP

  return [{

    id: "reviews_latency_72h",

    title: "12 reviews unanswered > 72h",

    diagnosis: "Reply latency dropped Trust (ATI) by 6 points.",

    prescription: "Batch-respond using approved tone pack; enable alerts.",

    impactMonthlyUSD: 3100,

    etaSeconds: 60,

    confidenceScore: 0.78,

    recencyMinutes: 35,

    kind: "reviews"

  }];

}



async function visibilityAdapter(domain?: string): Promise<Pulse[]> {

  // TODO: call your ai_visibility_minimal / platform presence service

  return [{

    id: "gemini_citations_service",

    title: "Gemini citations missing for Service",

    diagnosis: "Service FAQs aren't in structured Q&A format.",

    prescription: "Generate 8 Q&As and add FAQPage schema on Service page.",

    impactMonthlyUSD: 2400,

    etaSeconds: 120,

    confidenceScore: 0.72,

    recencyMinutes: 18,

    kind: "visibility"

  }];

}



// --- Handler ---

export async function GET(req: Request) {

  try {

    const url = new URL(req.url);

    const domain = url.searchParams.get("domain") || undefined;

    const gbpId = url.searchParams.get("gbpId") || undefined;



    // Pull in parallel (fast)

    const [schemaP, ga4P, reviewsP, visP] = await Promise.all([

      schemaToPulses(domain),

      ga4ToPulses(domain),

      reviewsAdapter(gbpId),

      visibilityAdapter(domain)

    ]);



    // Merge → simple array; the client ranks via PulseEngine

    const feed: Pulse[] = [

      ...schemaP,

      ...ga4P,

      ...reviewsP,

      ...visP

    ];



    return NextResponse.json(feed);

  } catch (e: any) {

    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });

  }

}
