/**
 * Example: Using Tier-Based Feature Access Control
 *
 * This file demonstrates how to use the tier-features utility
 * in your API routes to enforce subscription-based access control.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  canAccessFeature,
  enforceFeatureAccess,
  getRemainingUsage,
  getUpgradeMessage,
  getTierLimits,
  type SubscriptionTier,
} from '../tier-features';

// Example 1: Basic Feature Check in API Route
export async function exampleChatSessionAPI(req: NextRequest) {
  // Get user's subscription tier from database/session
  const userTier: SubscriptionTier = 'pro'; // In real code, fetch from DB
  const currentUsage = 15; // Fetch current usage from DB

  // Check if user can create a new chat session
  if (!canAccessFeature(userTier, 'chat_sessions', currentUsage)) {
    return NextResponse.json(
      {
        error: 'Feature not available',
        message: getUpgradeMessage(userTier, 'chat_sessions'),
        remaining: getRemainingUsage(userTier, 'chat_sessions', currentUsage),
      },
      { status: 403 }
    );
  }

  // User has access, proceed with creating chat session
  return NextResponse.json({
    success: true,
    remaining: getRemainingUsage(userTier, 'chat_sessions', currentUsage),
  });
}

// Example 2: Using enforceFeatureAccess (throws error if denied)
export async function exampleMarketScanAPI(req: NextRequest) {
  const userTier: SubscriptionTier = 'free';
  const currentUsage = 0;

  try {
    // This will throw an error if access is denied
    enforceFeatureAccess(userTier, 'market_scans', currentUsage);

    // If we get here, user has access
    return NextResponse.json({
      success: true,
      message: 'Starting market scan...',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Access denied',
        message: error instanceof Error ? error.message : 'Unknown error',
        upgradeMessage: getUpgradeMessage(userTier, 'market_scans'),
      },
      { status: 403 }
    );
  }
}

// Example 3: Boolean Feature Check
export async function exampleDataExportAPI(req: NextRequest) {
  const userTier: SubscriptionTier = 'pro';

  // Check boolean feature (no usage counting)
  if (!canAccessFeature(userTier, 'data_export')) {
    return NextResponse.json(
      {
        error: 'Feature not available',
        message: getUpgradeMessage(userTier, 'data_export'),
      },
      { status: 403 }
    );
  }

  // User has access to data export
  return NextResponse.json({
    success: true,
    message: 'Generating export...',
  });
}

// Example 4: Middleware for Feature Gating
export function createFeatureMiddleware(
  feature: Parameters<typeof canAccessFeature>[1]
) {
  return async (
    req: NextRequest,
    { params }: { params: { userId: string } }
  ) => {
    // Fetch user's tier from database
    const userTier = await getUserTier(params.userId);

    if (!canAccessFeature(userTier, feature)) {
      return NextResponse.json(
        {
          error: 'Upgrade required',
          message: getUpgradeMessage(userTier, feature),
        },
        { status: 403 }
      );
    }

    // Continue to route handler
    return null;
  };
}

// Example 5: Get Feature Limits for UI Display
export async function exampleGetUserLimits(userId: string) {
  const userTier = await getUserTier(userId);
  const limits = getTierLimits(userTier);

  // Get current usage from database
  const currentUsage = {
    chatSessions: await getChatSessionCount(userId),
    marketScans: await getMarketScanCount(userId),
    mysteryShops: await getMysteryShopCount(userId),
    competitorTracking: await getCompetitorCount(userId),
  };

  return {
    tier: userTier,
    limits,
    usage: currentUsage,
    remaining: {
      chatSessions: getRemainingUsage(userTier, 'chat_sessions', currentUsage.chatSessions),
      marketScans: getRemainingUsage(userTier, 'market_scans', currentUsage.marketScans),
      mysteryShops: getRemainingUsage(userTier, 'mystery_shops', currentUsage.mysteryShops),
      competitorTracking: getRemainingUsage(userTier, 'competitor_tracking', currentUsage.competitorTracking),
    },
    features: {
      dataExport: canAccessFeature(userTier, 'data_export'),
      apiAccess: canAccessFeature(userTier, 'api_access'),
      customBranding: canAccessFeature(userTier, 'custom_branding'),
      prioritySupport: canAccessFeature(userTier, 'priority_support'),
      advancedAnalytics: canAccessFeature(userTier, 'advanced_analytics'),
      realTimeAlerts: canAccessFeature(userTier, 'real_time_alerts'),
      multiLocationSupport: canAccessFeature(userTier, 'multi_location_support'),
      whiteLabel: canAccessFeature(userTier, 'white_label'),
    },
  };
}

// Example 6: Complete API Route with Database Integration
export async function POST(req: NextRequest) {
  try {
    // 1. Get user from session/auth
    const { userId } = await req.json();

    // 2. Fetch user's subscription tier from database
    const userTier = await getUserTier(userId);

    // 3. Get current usage
    const currentChatSessions = await getChatSessionCount(userId);

    // 4. Check if user can access feature
    if (!canAccessFeature(userTier, 'chat_sessions', currentChatSessions)) {
      return NextResponse.json(
        {
          error: 'Limit reached',
          message: getUpgradeMessage(userTier, 'chat_sessions'),
          limits: getTierLimits(userTier),
          currentUsage: currentChatSessions,
          remaining: getRemainingUsage(userTier, 'chat_sessions', currentChatSessions),
        },
        { status: 403 }
      );
    }

    // 5. Create the resource (chat session, scan, etc.)
    const chatSession = await createChatSession(userId);

    // 6. Return success with updated limits
    return NextResponse.json({
      success: true,
      data: chatSession,
      remaining: getRemainingUsage(userTier, 'chat_sessions', currentChatSessions + 1),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions (implement these based on your database)
async function getUserTier(userId: string): Promise<SubscriptionTier> {
  // TODO: Query database for user's subscription
  // Example with Supabase:
  // const { data } = await supabase
  //   .from('subscriptions')
  //   .select('plan')
  //   .eq('user_id', userId)
  //   .single();
  // return data?.plan || 'free';

  return 'pro'; // Placeholder
}

async function getChatSessionCount(userId: string): Promise<number> {
  // TODO: Query database for user's chat session count
  // Example:
  // const { count } = await supabase
  //   .from('chat_sessions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('user_id', userId);
  // return count || 0;

  return 0; // Placeholder
}

async function getMarketScanCount(userId: string): Promise<number> {
  return 0; // Implement database query
}

async function getMysteryShopCount(userId: string): Promise<number> {
  return 0; // Implement database query
}

async function getCompetitorCount(userId: string): Promise<number> {
  return 0; // Implement database query
}

async function createChatSession(userId: string) {
  // TODO: Create chat session in database
  return { id: 'session_123', userId };
}
