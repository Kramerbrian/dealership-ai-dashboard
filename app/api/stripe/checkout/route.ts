// @ts-nocheck
/**
 * Stripe Checkout API Route
 * Create checkout sessions for tier upgrades
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { createCheckoutSession, getPlanByTier } from '@/lib/stripe-config';
import { TierManager } from '@/lib/tier-manager';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tier, successUrl, cancelUrl } = body;

    if (!tier || !['PROFESSIONAL', 'ENTERPRISE'].includes(tier)) {
      return NextResponse.json({
        error: 'Invalid tier. Must be PROFESSIONAL or ENTERPRISE'
      }, { status: 400 });
    }

    // Get current user tier
    const currentTier = await (TierManager as any).getUserTier(userId);
    
    // Check if user is already on a higher tier
    const tierHierarchy = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
    if (tierHierarchy[currentTier] >= tierHierarchy[tier as keyof typeof tierHierarchy]) {
      return NextResponse.json({
        error: `You are already on ${currentTier} tier or higher`
      }, { status: 400 });
    }

    // Get plan configuration
    const plan = getPlanByTier(tier);
    if (!plan.priceId) {
      return NextResponse.json({
        error: 'Plan not available for checkout'
      }, { status: 400 });
    }

    // Create checkout session
    const session = await createCheckoutSession(
      plan.priceId,
      undefined, // No existing customer ID for now
      {
        userId,
        tier,
        currentTier
      }
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      plan: {
        name: plan.name,
        price: plan.price,
        sessionsLimit: plan.sessionsLimit,
        features: plan.features
      }
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}