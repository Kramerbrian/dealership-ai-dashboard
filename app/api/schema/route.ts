import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/schema
 * Returns schema.org markup coverage, types, errors, and recommendations
 * TODO: Wire to schema validator that crawls the site and validates schema.org markup
 */
export async function GET(req: NextRequest) {
  const dealerId = req.nextUrl.searchParams.get('dealerId') || 'demo';
  const origin = req.nextUrl.searchParams.get('origin') || 'demo';

  return NextResponse.json({
    dealerId,
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
      'FAQPage missing acceptedAnswer',
      'Offer.price missing currency',
      'Vehicle missing @id',
    ],
    recommendations: [
      'Add FAQPage schema for common questions',
      'Include currency in all Offer prices',
      'Add unique @id to each Vehicle',
    ],
  });
}
