import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/trust/action-mapping?dealerId=xxx&days=30
 * 
 * Track which dashboard actions most often precede Trust Score increases
 * Shows "Top 3 behaviors that moved your score"
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId query parameter is required' },
        { status: 400 }
      );
    }

    // Get trust score history and user actions
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [scores, actions] = await Promise.all([
      prisma.score.findMany({
        where: {
          dealershipId: dealerId,
          createdAt: { gte: since },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.auditLog.findMany({
        where: {
          details: {
            path: ['action'],
            string_contains: 'dashboard',
          },
          timestamp: { gte: since },
        },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    // Analyze correlation between actions and score changes
    const actionImpact: Record<string, {
      action: string;
      occurrences: number;
      avgScoreIncrease: number;
      maxIncrease: number;
      correlation: number;
    }> = {};

    for (let i = 1; i < scores.length; i++) {
      const scoreDelta = scores[i].aiVisibility - scores[i - 1].aiVisibility;
      const timeWindow = scores[i].createdAt.getTime() - scores[i - 1].createdAt.getTime();
      const windowHours = timeWindow / (1000 * 60 * 60);

      // Find actions in the window before this score increase
      const relevantActions = actions.filter(
        (a) =>
          a.timestamp >= scores[i - 1].createdAt &&
          a.timestamp <= scores[i].createdAt
      );

      for (const action of relevantActions) {
        const actionType = JSON.parse(action.details || '{}').action || 'unknown';
        if (!actionImpact[actionType]) {
          actionImpact[actionType] = {
            action: actionType,
            occurrences: 0,
            avgScoreIncrease: 0,
            maxIncrease: 0,
            correlation: 0,
          };
        }

        actionImpact[actionType].occurrences++;
        actionImpact[actionType].avgScoreIncrease =
          (actionImpact[actionType].avgScoreIncrease * (actionImpact[actionType].occurrences - 1) +
            scoreDelta) /
          actionImpact[actionType].occurrences;
        actionImpact[actionType].maxIncrease = Math.max(
          actionImpact[actionType].maxIncrease,
          scoreDelta
        );
      }
    }

    // Calculate correlations
    const sortedActions = Object.values(actionImpact)
      .filter((a) => a.occurrences >= 2) // Only actions with multiple occurrences
      .sort((a, b) => b.avgScoreIncrease - a.avgScoreIncrease)
      .slice(0, 10);

    // Top 3 behaviors
    const topBehaviors = sortedActions.slice(0, 3).map((a, idx) => ({
      rank: idx + 1,
      action: a.action,
      avgTrustGain: Math.round(a.avgScoreIncrease * 10) / 10,
      occurrences: a.occurrences,
      maxGain: Math.round(a.maxIncrease * 10) / 10,
      recommendation: getRecommendation(a.action),
    }));

    return NextResponse.json({
      dealerId,
      period: `${days} days`,
      topBehaviors,
      allActions: sortedActions,
      summary: {
        totalActions: actions.length,
        totalScoreChanges: scores.length - 1,
        avgScoreIncrease: scores.length > 1
          ? Math.round(
              ((scores[scores.length - 1].aiVisibility - scores[0].aiVisibility) /
                (scores.length - 1)) *
                10
            ) / 10
          : 0,
      },
    });
  } catch (error: any) {
    console.error('Action mapping error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to map actions' },
      { status: 500 }
    );
  }
}

function getRecommendation(action: string): string {
  const recommendations: Record<string, string> = {
    'review_response': 'Continue responding to reviews promptly. High correlation with trust gains.',
    'schema_fix': 'Schema fixes show strong impact. Consider automating more schema generation.',
    'content_update': 'Regular content updates maintain freshness. Schedule weekly updates.',
    'gbp_sync': 'Google Business Profile syncs improve local visibility. Keep NAP consistent.',
    'faq_addition': 'FAQ pages help zero-click visibility. Expand FAQ coverage.',
  };

  return recommendations[action] || 'This action shows positive correlation. Consider increasing frequency.';
}

