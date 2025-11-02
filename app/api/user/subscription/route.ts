import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userManager } from '@/lib/user-management';
import { billingManager } from '@/lib/stripe-billing';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await userManager.getUserSubscription(userId);
    
    if (!subscription.success) {
      return NextResponse.json({ error: subscription.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: subscription.data
    });
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    
    if (!plan || !['professional', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create checkout session
    const checkoutResult = await billingManager.createCheckoutSession(
      userId,
      plan
    );

    if (!checkoutResult.success) {
      return NextResponse.json({ error: checkoutResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutResult.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
