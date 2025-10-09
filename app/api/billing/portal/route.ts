import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createBillingPortalSession } from '@/lib/stripe-billing';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { returnUrl } = await req.json();

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Missing returnUrl' },
        { status: 400 }
      );
    }

    if (!user.tenant?.billing_customer_id) {
      return NextResponse.json(
        { error: 'No billing customer found' },
        { status: 400 }
      );
    }

    // Create billing portal session
    const session = await createBillingPortalSession({
      customerId: user.tenant.billing_customer_id,
      returnUrl,
    });

    return NextResponse.json({ 
      url: session.url 
    });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
