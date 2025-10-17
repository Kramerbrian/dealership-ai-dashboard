import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { userManager } from '@/lib/user-management';
import { billingManager } from '@/lib/stripe-billing';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await userManager.getUserSubscription(session.user.id);
    
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    
    if (!plan || !['professional', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create checkout session
    const checkoutResult = await billingManager.createCheckoutSession(
      session.user.id,
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
