import { NextRequest, NextResponse } from 'next/server';
import { canAccessFeature, getTierFeatures, type Tier } from '@/config/tier-features';
import { eeatCalculator } from '@/core/eeat-calculator';
import { mysteryShop } from '@/integrations/mystery-shop';

// Mock data - replace with real database queries
const mockDealers = {
  'dealer_123': {
    id: 'dealer_123',
    name: 'Terry Reid Hyundai',
    domain: 'terryreidhyundai.com',
    city: 'Naples',
    state: 'FL',
    brand: 'Hyundai',
    tier: 'pro' as Tier,
    locations: 1
  }
};

const mockScores = {
  'dealer_123': {
    seo_visibility: 87,
    aeo_visibility: 92,
    geo_visibility: 78,
    overall: 86,
    confidence: 94
  }
};

const mockEEAT = {
  'dealer_123': {
    experience: 85,
    expertise: 78,
    authoritativeness: 82,
    trustworthiness: 91,
    overall: 84
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealer_id');
    const action = searchParams.get('action');

    if (!dealerId) {
      return NextResponse.json({ error: 'Missing dealer_id parameter' }, { status: 400 });
    }

    const dealer = mockDealers[dealerId as keyof typeof mockDealers];
    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    const tierFeatures = getTierFeatures(dealer.tier);

    switch (action) {
      case 'scores':
        return handleGetScores(dealer, tierFeatures);
      case 'eeat':
        return handleGetEEAT(dealer, tierFeatures);
      case 'mystery_shops':
        return handleGetMysteryShops(dealer, tierFeatures);
      case 'action_items':
        return handleGetActionItems(dealer, tierFeatures);
      case 'usage':
        return handleGetUsage(dealer, tierFeatures);
      default:
        return handleGetDashboard(dealer, tierFeatures);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, dealer_id, ...data } = body;

    if (!dealer_id) {
      return NextResponse.json({ error: 'Missing dealer_id' }, { status: 400 });
    }

    const dealer = mockDealers[dealer_id as keyof typeof mockDealers];
    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    const tierFeatures = getTierFeatures(dealer.tier);

    switch (action) {
      case 'deploy_mystery_shop':
        return handleDeployMysteryShop(dealer, tierFeatures, data);
      case 'score_mystery_shop':
        return handleScoreMysteryShop(dealer, tierFeatures, data);
      case 'update_action_item':
        return handleUpdateActionItem(dealer, tierFeatures, data);
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGetDashboard(dealer: any, tierFeatures: any) {
  const scores = mockScores[dealer.id as keyof typeof mockScores];
  const eeat = mockEEAT[dealer.id as keyof typeof mockEEAT];

  return NextResponse.json({
    dealer,
    scores,
    eeat,
    tier_features: tierFeatures,
    action_items: [
      {
        category: 'Experience',
        priority: 'high',
        action: 'Add customer testimonials with photos',
        impact: '+15 points',
        effort: '2 hours',
        cost: '$0'
      },
      {
        category: 'Expertise',
        priority: 'medium',
        action: 'Publish educational blog content',
        impact: '+12 points',
        effort: '4 hours/week',
        cost: '$200/month'
      }
    ],
    usage: {
      chat_sessions: 23,
      monthly_scans: 1,
      mystery_shops: 0
    }
  });
}

async function handleGetScores(dealer: any, tierFeatures: any) {
  const scores = mockScores[dealer.id as keyof typeof mockScores];
  
  return NextResponse.json({
    dealer: {
      name: dealer.name,
      location: `${dealer.city}, ${dealer.state}`,
      brand: dealer.brand,
      tier: dealer.tier
    },
    scores: {
      seo_visibility: scores.seo_visibility,
      aeo_visibility: scores.aeo_visibility,
      geo_visibility: scores.geo_visibility,
      overall: scores.overall,
      confidence: scores.confidence
    },
    analysis: {
      last_updated: new Date().toISOString(),
      scan_type: 'full_scan'
    }
  });
}

async function handleGetEEAT(dealer: any, tierFeatures: any) {
  if (!canAccessFeature(dealer.tier, 'eeat_metrics')) {
    return NextResponse.json({ 
      error: 'E-E-A-T metrics require Professional or Enterprise tier',
      upgrade_required: true 
    }, { status: 403 });
  }

  const eeat = mockEEAT[dealer.id as keyof typeof mockEEAT];
  
  return NextResponse.json({
    dealer_id: dealer.id,
    eeat,
    grade: eeatCalculator.getEEATGrade(eeat.overall),
    action_items: await eeatCalculator.generateActionItems(eeat)
  });
}

async function handleGetMysteryShops(dealer: any, tierFeatures: any) {
  if (!canAccessFeature(dealer.tier, 'mystery_shop')) {
    return NextResponse.json({ 
      error: 'Mystery Shop requires Enterprise tier',
      upgrade_required: true 
    }, { status: 403 });
  }

  const shops = await mysteryShop.getShopResults(dealer.id);
  
  return NextResponse.json({
    dealer_id: dealer.id,
    mystery_shops: shops,
    limit: tierFeatures.limits.mystery_shops,
    used: shops.length
  });
}

async function handleGetActionItems(dealer: any, tierFeatures: any) {
  const actionItems = [
    {
      id: 'ai_1',
      category: 'Experience',
      priority: 'high',
      action: 'Add customer testimonials with photos',
      impact: '+15 points',
      effort: '2 hours',
      cost: '$0',
      status: 'pending'
    },
    {
      id: 'ai_2',
      category: 'Expertise',
      priority: 'medium',
      action: 'Publish educational blog content',
      impact: '+12 points',
      effort: '4 hours/week',
      cost: '$200/month',
      status: 'pending'
    }
  ];
  
  return NextResponse.json({
    dealer_id: dealer.id,
    action_items: actionItems
  });
}

async function handleGetUsage(dealer: any, tierFeatures: any) {
  const usage = {
    chat_sessions: {
      used: 23,
      limit: tierFeatures.limits.chat_sessions,
      remaining: tierFeatures.limits.chat_sessions - 23
    },
    monthly_scans: {
      used: 1,
      limit: tierFeatures.limits.scans_per_month,
      remaining: tierFeatures.limits.scans_per_month - 1
    },
    mystery_shops: {
      used: 0,
      limit: tierFeatures.limits.mystery_shops,
      remaining: tierFeatures.limits.mystery_shops
    }
  };
  
  return NextResponse.json({
    dealer_id: dealer.id,
    tier: dealer.tier,
    usage
  });
}

async function handleDeployMysteryShop(dealer: any, tierFeatures: any, data: any) {
  if (!canAccessFeature(dealer.tier, 'mystery_shop')) {
    return NextResponse.json({ 
      error: 'Mystery Shop requires Enterprise tier',
      upgrade_required: true 
    }, { status: 403 });
  }

  const shopId = await mysteryShop.deployShop(dealer.id, data);
  
  return NextResponse.json({
    success: true,
    shop_id: shopId,
    message: 'Mystery shop deployed successfully'
  });
}

async function handleScoreMysteryShop(dealer: any, tierFeatures: any, data: any) {
  if (!canAccessFeature(dealer.tier, 'mystery_shop')) {
    return NextResponse.json({ 
      error: 'Mystery Shop requires Enterprise tier',
      upgrade_required: true 
    }, { status: 403 });
  }

  const score = await mysteryShop.scoreResponse(data.shop_id, data.response_data);
  
  return NextResponse.json({
    success: true,
    shop_id: data.shop_id,
    score,
    grade: mysteryShop.getScoreGrade(score)
  });
}

async function handleUpdateActionItem(dealer: any, tierFeatures: any, data: any) {
  // Mock update - in production, update database
  return NextResponse.json({
    success: true,
    action_item_id: data.action_item_id,
    status: data.status,
    message: 'Action item updated successfully'
  });
}
