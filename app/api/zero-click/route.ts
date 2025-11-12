import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dealer = searchParams.get('dealer') || 'demo';

  return NextResponse.json({
    dealer,
    inclusionRate: 0.64,
    details: [
      { intent: 'oil change near me', inclusion: true },
      { intent: 'best honda dealer', inclusion: false },
      { intent: 'service coupons', inclusion: true }
    ]
  });
}

