import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const key = process.env.STRIPE_SECRET_KEY;
    
    if (!key) {
      // Fallback: redirect to dashboard
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`,
        message: 'Stripe not configured',
      });
    }

    const stripe = new Stripe(key, {
      apiVersion: '2025-10-29.clover' as any,
    });

    const body = await req.json();
    const { priceId, mode = 'subscription' } = body;

    const session = await stripe.checkout.sessions.create({
      mode: mode as 'subscription' | 'payment',
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID || 'price_123',
          quantity: 1,
        },
      ],
      customer_email: undefined, // Will be filled from Clerk
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/landing`,
      metadata: {
        userId,
        source: 'plg_landing',
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

