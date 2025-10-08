import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getCurrentUserWithTenant } from '@/lib/clerk';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserWithTenant();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const session = await createCheckoutSession(
      user.tenant.id,
      priceId,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
