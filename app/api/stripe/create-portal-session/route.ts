/**
 * DealershipAI v2.0 - Stripe Customer Portal Session
 * 
 * Creates customer portal sessions for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, returnUrl } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // In production, you would look up the customer ID from your database
    // For now, we'll use the userId as a placeholder
    const customerId = `cus_${userId}`;

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe portal session creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
