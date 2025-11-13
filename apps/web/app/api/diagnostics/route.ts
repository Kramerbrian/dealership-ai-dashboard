import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

interface DiagnosticIssue {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: number;
  effort: 'low' | 'medium' | 'high';
  timeToFix: string;
  revenueAtRisk: number;
  description: string;
  fixable: boolean;
  category: 'schema' | 'content' | 'reviews' | 'technical' | 'competitive';
  competitors: {
    name: string;
    score: number;
  }[];
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const dealerId = searchParams.get('dealerId');

    if (!domain && !dealerId) {
      return NextResponse.json(
        { error: 'domain or dealerId required' },
        { status: 400 }
      );
    }

    // Get dealer from database
    let dealer;
    if (dealerId) {
      dealer = await db.dealer.findUnique({
        where: { id: dealerId },
        include: {
          scores: {
            orderBy: { analyzedAt: 'desc' },
            take: 1,
          },
          competitors: {
            where: { isActive: true },
            take: 5,
          },
        },
      });
    } else if (domain) {
      dealer = await db.dealer.findUnique({
        where: { domain },
        include: {
          scores: {
            orderBy: { analyzedAt: 'desc' },
            take: 1,
          },
          competitors: {
            where: { isActive: true },
            take: 5,
          },
        },
      });
    }

    if (!dealer) {
      // Fallback to demo data if dealer not found
      return NextResponse.json({
        issues: generateDemoIssues(),
        overallScore: 72,
        relevanceIndex: 68,
        timestamp: new Date().toISOString(),
      });
    }

    // Get latest score
    const latestScore = dealer.scores[0];
    const competitors = dealer.competitors;

    // Get opportunities from database
    const opportunities = await db.opportunity.findMany({
      where: {
        domain: dealer.domain,
        status: 'PENDING',
      },
      orderBy: {
        impactScore: 'desc',
      },
      take: 10,
    });

    // Convert opportunities to diagnostic issues
    const issues: DiagnosticIssue[] = opportunities.map((opp) => {
      const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
        HIGH: 'critical',
        MEDIUM: 'high',
        LOW: 'medium',
      };

      const effortMap: Record<string, 'low' | 'medium' | 'high'> = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
      };

      const revenueAtRisk = Math.round(opp.impactScore * 400);
      const timeMap: Record<string, string> = {
        LOW: '1-2 hours',
        MEDIUM: '3-6 hours',
        HIGH: '1-2 weeks',
      };

      return {
        id: opp.id,
        title: opp.title,
        severity: severityMap[opp.impact] || 'medium',
        impact: Math.round(opp.impactScore),
        effort: effortMap[opp.effort] || 'medium',
        timeToFix: timeMap[opp.effort] || '3-6 hours',
        revenueAtRisk,
        description: opp.description,
        fixable: true,
        category: opp.category as any,
        competitors: competitors.map((c) => ({
          name: c.competitorName,
          score: Math.round(c.theirScore || 75),
        })),
      };
    });

    // If no opportunities, generate from score gaps
    if (issues.length === 0 && latestScore) {
      const score = latestScore;
      const issuesFromScores: DiagnosticIssue[] = [];

      if (score.sgpIntegrity < 70) {
        issuesFromScores.push({
          id: 'schema-1',
          title: 'Missing AutoDealer Schema',
          severity: 'critical',
          impact: 22,
          effort: 'low',
          timeToFix: '2 hours',
          revenueAtRisk: 8200,
          description: 'Critical structured data missing. AI can\'t parse your inventory.',
          fixable: true,
          category: 'schema',
          competitors: competitors.map((c) => ({
            name: c.competitorName,
            score: Math.round(c.theirScore || 75),
          })),
        });
      }

      if (score.ugcHealth < 70) {
        issuesFromScores.push({
          id: 'reviews-1',
          title: 'Low Review Response Rate',
          severity: 'high',
          impact: 15,
          effort: 'low',
          timeToFix: '1 hour',
          revenueAtRisk: 3100,
          description: 'Review response rate is below optimal. AI trust score penalized.',
          fixable: true,
          category: 'reviews',
          competitors: competitors.map((c) => ({
            name: c.competitorName,
            score: Math.round(c.theirScore || 75),
          })),
        });
      }

      issues.push(...issuesFromScores);
    }

    // Calculate overall score from latest score or fallback
    const overallScore = latestScore
      ? Math.round(
          (latestScore.qaiScore * 0.4 +
            latestScore.aiVisibility * 0.3 +
            latestScore.zeroClickShield * 0.15 +
            latestScore.ugcHealth * 0.1 +
            latestScore.geoTrust * 0.05)
        )
      : 75;

    // Calculate relevance index from AI visibility and zero-click shield
    const relevanceIndex = latestScore
      ? Math.round((latestScore.aiVisibility * 0.6 + latestScore.zeroClickShield * 0.4))
      : 68;

    return NextResponse.json({
      issues,
      overallScore,
      relevanceIndex,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Diagnostics API error:', error);
    // Fallback to demo data on error
    return NextResponse.json({
      issues: generateDemoIssues(),
      overallScore: 72,
      relevanceIndex: 68,
      timestamp: new Date().toISOString(),
    });
  }
}

function generateDemoIssues(): DiagnosticIssue[] {
  return [
    {
      id: '1',
      title: 'Missing AutoDealer Schema',
      severity: 'critical',
      impact: 22,
      effort: 'low',
      timeToFix: '2 hours',
      revenueAtRisk: 8200,
      description: 'Critical structured data missing. AI can\'t parse your inventory.',
      fixable: true,
      category: 'schema',
      competitors: [
        { name: 'Naples Honda', score: 88 },
        { name: 'Crown Nissan', score: 75 },
      ],
    },
    {
      id: '2',
      title: 'Low Review Response Rate',
      severity: 'high',
      impact: 15,
      effort: 'low',
      timeToFix: '1 hour',
      revenueAtRisk: 3100,
      description: 'Only 23% of reviews have responses. AI trust score penalized.',
      fixable: true,
      category: 'reviews',
      competitors: [
        { name: 'Naples Honda', score: 92 },
        { name: 'Germain Toyota', score: 78 },
      ],
    },
  ];
}
