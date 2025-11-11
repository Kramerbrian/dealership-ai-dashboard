import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Wire to your UGC/Reviews aggregator
  // This should pull from Google, Yelp, Facebook, DealerRater
  return NextResponse.json({
    summary: {
      mentions7d: 38,
      positive: 0.7,
      avgResponseHrs: 16,
      platforms: {
        google: { reviews: 1240, avgRating: 4.3 },
        yelp: { reviews: 340, avgRating: 4.1 },
        facebook: { reviews: 890, avgRating: 4.5 },
      },
    },
  });
}
