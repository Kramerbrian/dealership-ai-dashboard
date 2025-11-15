import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dealer = searchParams.get('dealer') || undefined || 'demo';

  return NextResponse.json({
    dealer,
    coverage: 0.78,
    errors: ['Missing Vehicle.offer.price on 12 VDPs', 'FAQPage missing acceptedAnswer on 2 entries'],
    types: { Organization: true, AutoDealer: true, Vehicle: true, Offer: true, FAQPage: true }
  });
}
