import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { userManager } from '@/lib/user-management';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const feature = searchParams.get('feature');

    if (feature) {
      // Get usage for specific feature
      const usage = await userManager.getUsageStats(session.user.id, feature);
      
      if (!usage.success) {
        return NextResponse.json({ error: usage.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: usage.data
      });
    } else {
      // Get all usage stats
      const usage = await userManager.getUsageStats(session.user.id);
      
      if (!usage.success) {
        return NextResponse.json({ error: usage.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: usage.data
      });
    }
  } catch (error) {
    console.error('Error getting usage stats:', error);
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

    const { feature, metadata } = await req.json();
    
    if (!feature) {
      return NextResponse.json({ error: 'Feature is required' }, { status: 400 });
    }

    // Check if user can access the feature
    const canAccess = await userManager.canAccessFeature(session.user.id, feature);
    
    if (!canAccess) {
      return NextResponse.json({ 
        error: 'Feature not available in your plan',
        code: 'FEATURE_NOT_AVAILABLE'
      }, { status: 403 });
    }

    // Check usage limits
    const limits = await userManager.checkUsageLimits(session.user.id, feature);
    
    if (!limits.canUse) {
      return NextResponse.json({ 
        error: 'Usage limit exceeded',
        code: 'USAGE_LIMIT_EXCEEDED',
        remaining: limits.remaining
      }, { status: 429 });
    }

    // Track usage
    const result = await userManager.trackFeatureUsage(session.user.id, feature, metadata);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      remaining: limits.remaining
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
