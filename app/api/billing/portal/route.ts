import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { getOrCreateStripeCustomer } from '@/lib/db/integrations';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * POST /api/billing/portal
 * Create Stripe Customer Portal session
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuth(req as any);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID from database
    const customerId = await getOrCreateStripeCustomer(userId);

    if (!customerId) {
      return NextResponse.json(
        { error: 'Could not retrieve customer information. Please ensure you have an active subscription.' },
        { status: 400 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing`,
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error: any) {
    console.error('Portal creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
