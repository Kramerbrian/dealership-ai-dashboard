// app/api/ga4/summary/route.ts

import { NextResponse } from "next/server";



type GA4Summary = {

  rangeDays: number;

  sessions: number;

  pageviews: number;

  avgSessionDurationSec: number;

  bounceRatePct: number;

  // Optional "AI assisted" proxy until GA4 dims are wired (replace with real labels/attribution)

  aiAssistedSessions: number;

  organicSessions: number;

  directSessions: number;

  lastUpdatedISO: string;

};



export async function GET(req: Request) {

  try {

    const url = new URL(req.url);

    const domain = url.searchParams.get("domain") || "example.com";



    // TODO: if GA4 is connected for tenant, call Google Analytics Data API:

    // - properties/runReport with dateRanges, dimensions, metrics.

    // - Parse sessions, screenPageViews, averageSessionDuration, bounceRate, etc.

    // - When ready, remove synthetic.



    const synthetic: GA4Summary = {

      rangeDays: 7,

      sessions: 4821,

      pageviews: 9133,

      avgSessionDurationSec: 138,

      bounceRatePct: 47.3,

      aiAssistedSessions: 612,   // Replace with real GA4 label-based count

      organicSessions: 2894,

      directSessions: 1315,

      lastUpdatedISO: new Date().toISOString(),

    };



    return NextResponse.json(synthetic, {

      headers: {

        "Cache-Control": "s-maxage=60, stale-while-revalidate=600",

      },

    });

  } catch (e: any) {

    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });

  }

}
