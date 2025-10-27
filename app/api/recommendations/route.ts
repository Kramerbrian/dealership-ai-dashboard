import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import { redis } from '@/lib/redis';
import { SmartRecommendationEngine } from '@/lib/recommendations/smart-engine';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user and dealership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        dealership: {
          include: {
            scores: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!user?.dealership) {
      return NextResponse.json({ error: 'Dealership not found' }, { status: 404 });
    }

    // 3. Get query parameters
    const { searchParams } = new URL(req.url);
    const includeAnalytics = searchParams.get('analytics') === 'true';

    // 4. Build user context
    const userContext = {
      dealershipId: user.dealership.id,
      currentScores: {
        aiVisibility: user.dealership.scores[0]?.aiVisibility || 0,
        zeroClickShield: user.dealership.scores[0]?.zeroClickShield || 0,
        ugcHealth: user.dealership.scores[0]?.ugcHealth || 0,
        geoTrust: user.dealership.scores[0]?.geoTrust || 0,
        sgpIntegrity: user.dealership.scores[0]?.sgpIntegrity || 0
      },
      tier: user.plan,
      market: user.dealership.city || 'default',
      competitors: [], // Would be populated from competitive analysis
      recentActivity: [], // Would be populated from user activity
      preferences: {
        focusAreas: ['ai', 'local', 'content'],
        timeAvailable: 10, // hours per week
        technicalLevel: 'intermediate' as const
      }
    };

    // 5. Initialize recommendation engine
    const engine = new SmartRecommendationEngine(redis, prisma);

    // 6. Get recommendations
    const recommendations = await engine.getRecommendations(userContext);

    const response: any = {
      success: true,
      recommendations,
      totalCount: recommendations.length,
      highPriority: recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length
    };

    // 7. Include analytics if requested
    if (includeAnalytics) {
      const analytics = await engine.getAnalytics(user.dealership.id);
      response.analytics = analytics;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

// POST endpoint for marking recommendations as completed
export async function POST() {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user and dealership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        dealership: true
      }
    });

    if (!user?.dealership) {
      return NextResponse.json({ error: 'Dealership not found' }, { status: 404 });
    }

    const { action, recommendationId } = await req.json();

    if (!action || !recommendationId) {
      return NextResponse.json({ error: 'Action and recommendationId are required' }, { status: 400 });
    }

    // 3. Initialize recommendation engine
    const engine = new SmartRecommendationEngine(redis, prisma);

    // 4. Handle different actions
    switch (action) {
      case 'mark_completed':
        await engine.markCompleted(user.dealership.id, recommendationId);
        break;
      
      case 'mark_in_progress':
        // Implementation for marking as in progress
        break;
      
      case 'dismiss':
        // Implementation for dismissing recommendations
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Recommendation ${action} successfully`
    });

  } catch (error) {
    console.error('Update recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}
