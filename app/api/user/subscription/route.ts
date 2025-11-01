import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getUserSubscription } from '@/lib/db/integrations';

/**
 * GET /api/user/subscription
 * Get user's current subscription information
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await getAuth(req as any);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return NextResponse.json({
        tier: 'free',
        status: 'active',
        nextBillingDate: null,
        paymentMethod: null,
      });
    }

    return NextResponse.json({
      tier: subscription.tier || 'free',
      status: subscription.subscriptionStatus || 'active',
      nextBillingDate: subscription.subscriptionEndDate?.toISOString() || null,
      paymentMethod: subscription.stripeCustomerId ? {
        // Would fetch last4 from Stripe in production
        last4: '****',
      } : null,
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
