import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe-billing';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = user.tenant?.billing_customer_id;
    
    if (!customerId) {
      const customer = await createStripeCustomer({
        name: user.tenant?.name || 'Dealership Customer',
        email: user.email,
        tenantId: user.tenant_id,
      });
      
      customerId = customer.id;
      
      // Update tenant with customer ID
      await supabaseAdmin
        .from('tenants')
        .update({ billing_customer_id: customerId })
        .eq('id', user.tenant_id);
    }

    // Create checkout session
    const session = await createCheckoutSession({
      tenantId: user.tenant_id,
      priceId,
      successUrl,
      cancelUrl,
      customerId,
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
