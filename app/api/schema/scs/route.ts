import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    scsPct: 91,
    errorsDetected: 3,
    authorityWeight: 0.78,
    missingFields: ["offers.availability"],
    malformedFields: ["aggregateRating.ratingValue"],
    lastCrawl: "2025-11-04T13:00:00Z"
  });
}

