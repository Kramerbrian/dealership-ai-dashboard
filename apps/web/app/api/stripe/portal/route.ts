/**
 * Stripe Billing Portal API Route
 * Create customer portal sessions for billing management
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { createPortalSession } from '@/lib/stripe-config';
import { prisma } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({
        error: 'No billing information found. Please contact support.'
      }, { status: 404 });
    }

    // Create portal session
    const session = await createPortalSession(user.stripeCustomerId);

    return NextResponse.json({
      success: true,
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
