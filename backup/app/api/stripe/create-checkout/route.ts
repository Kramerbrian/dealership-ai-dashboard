import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICING_TIERS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, phone, domain, plan } = await req.json();

    // Validate required fields
    if (!email || !name || !company || !domain || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate plan
    if (!PRICING_TIERS[plan.toUpperCase() as keyof typeof PRICING_TIERS]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const pricingTier = PRICING_TIERS[plan.toUpperCase() as keyof typeof PRICING_TIERS];

    // Create or retrieve customer
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
          name,
          phone,
          metadata: {
            company,
            domain,
            source: 'dealershipai_web'
          }
        });
      }
    } catch (error) {
      console.error('Customer creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: pricingTier.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/signup?plan=${plan}&domain=${encodeURIComponent(domain)}`,
      metadata: {
        plan,
        domain,
        company,
        source: 'dealershipai_web'
      },
      subscription_data: {
        metadata: {
          plan,
          domain,
          company,
          source: 'dealershipai_web'
        },
        trial_period_days: 14, // 14-day free trial
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
