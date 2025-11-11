import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dealer = url.searchParams.get("dealer") || "demo";

  // TODO: Wire to your Google Search Console / Pulse analyzer
  // This should return actual zero-click data from GSC
  return NextResponse.json({
    dealer,
    inclusionRate: 0.62,
    details: [
      { intent: "oil change near me", score: 0.7, impressions: 1240, clicks: 340 },
      { intent: "best toyota dealer", score: 0.55, impressions: 890, clicks: 210 },
      { intent: "used cars [city]", score: 0.48, impressions: 2100, clicks: 450 },
    ],
  });
}
