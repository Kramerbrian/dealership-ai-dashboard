import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealerId = searchParams.get('dealerId');

  // In production, fetch from database
  const metrics = {
    aiVisibility: 72,
    reviewHealth: 4.6,
    localRank: 3,
    monthlyLeads: 47,
    trends: {
      aiVisibility: 8,
      reviewHealth: 0.3,
      localRank: 0,
      monthlyLeads: 12,
    },
  };

  return NextResponse.json(metrics);
}
