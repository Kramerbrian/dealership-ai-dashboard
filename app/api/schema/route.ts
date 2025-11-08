import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.searchParams.get("origin") || "demo";

  // TODO: Wire to your schema validator
  // This should crawl the site and validate schema.org markup
  return NextResponse.json({
    origin,
    coverage: 0.76,
    types: {
      AutoDealer: true,
      LocalBusiness: true,
      Vehicle: true,
      Offer: true,
      FAQPage: false,
      Review: true,
    },
    errors: [
      "FAQPage missing acceptedAnswer",
      "Offer.price missing currency",
      "Vehicle missing @id",
    ],
    recommendations: [
      "Add FAQPage schema for common questions",
      "Include currency in all Offer prices",
      "Add unique @id to each Vehicle",
    ],
  });
}
