// @ts-nocheck
/**
 * Mystery Shop API Route
 * Integrates Mystery Shop AI agent into command center
 * Based on: https://gist.github.com/Kramerbrian/502efbcafd7175cebc6ca2e25b92e3a1
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeMysteryShop, generateScript, type MysteryShopConfig } from '@/lib/agents/mystery-shop';
import { auth } from '@clerk/nextjs/server';
import { trackEvent } from '@/lib/monitoring/analytics';

export const dynamic = 'force-dynamic';
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

    const body = await req.json();
    const { dealerId, scenario, modelCategory, storePersona, competitorDomain, includePricing } = body;

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Missing required field: dealerId' },
        { status: 400 }
      );
    }

    const config: MysteryShopConfig = {
      dealerId,
      scenario: scenario || 'full',
      modelCategory,
      storePersona,
      competitorDomain,
      includePricing
    };

    // Execute mystery shop
    const result = await executeMysteryShop(config);

    // Track event
    if (typeof window === 'undefined') {
      // Server-side tracking would be done via API
      trackEvent('mystery_shop_executed', {
        dealerId,
        scenario: config.scenario,
        overallScore: (result as any).scores.overall
      });
    }

    const response = NextResponse.json({
      success: true,
      data: result
    });
    
    response.headers.set('X-Orchestrator-Role', 'AI_CSO');
    response.headers.set('X-Trace-Id', `mystery-shop-${(result as any).shopId}`);

    return response;
  } catch (error) {
    console.error('Mystery Shop API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || undefined;
    const scenario = searchParams.get('scenario') || undefined as MysteryShopConfig['scenario'];

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Missing dealerId parameter' },
        { status: 400 }
      );
    }

    // Return script for preview
    const script = generateScript({
      dealerId,
      scenario: scenario || 'full'
    });

    return NextResponse.json({
      success: true,
      script
    });
  } catch (error) {
    console.error('Mystery Shop script error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

