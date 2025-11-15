import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Skip if Stripe not configured (for local builds)
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    );
  }
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id') || undefined;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    });

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Invalid or unpaid session' },
        { status: 400 }
      );
    }

    // Get customer details
    const customer = session.customer as any;
    const subscription = session.subscription as any;

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        plan: session.metadata?.plan || 'professional',
        domain: session.metadata?.domain,
        company: session.metadata?.company,
        subscriptionId: subscription?.id,
        status: subscription?.status
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
