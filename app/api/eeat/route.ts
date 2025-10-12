/**
 * DealershipAI v2.0 - E-E-A-T Analysis API
 * Pro+ tier only - calculates Expertise, Experience, Authoritativeness, Trustworthiness
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScoringEngine } from '@/lib/scoring-engine';
import { TierManager } from '@/lib/tier-manager';
import { SecurityLogger } from '@/lib/security-logger';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Parse request body
    const body = await request.json();
    const { domain, userId, plan = 'FREE' } = body;

    if (!domain || !userId) {
      return NextResponse.json(
        { error: 'Domain and userId are required' },
        { status: 400 }
      );
    }

    // Check if user has Pro+ access
    if (plan === 'FREE') {
      return NextResponse.json(
        { 
          error: 'E-E-A-T analysis requires Pro+ tier',
          requiredTier: 'PRO',
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      );
    }

    // Get dealership data
    const dealership = await prisma.dealership.findUnique({
      where: { domain },
      include: {
        eeatScores: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!dealership) {
      return NextResponse.json(
        { error: 'Dealership not found' },
        { status: 404 }
      );
    }

    // Check for recent E-E-A-T scores (within 24 hours)
    const recentEEAT = dealership.eeatScores[0];
    const isRecent = recentEEAT && 
      (Date.now() - new Date(recentEEAT.createdAt).getTime()) < 24 * 60 * 60 * 1000;

    if (isRecent) {
      await SecurityLogger.logApiEvent(userId, '/api/eeat', 'POST', {
        responseTime: Date.now() - startTime,
        statusCode: 200,
        cost: 0.001,
        cached: true
      });

      return NextResponse.json({
        expertise: recentEEAT.expertise,
        experience: recentEEAT.experience,
        authoritativeness: recentEEAT.authoritativeness,
        trustworthiness: recentEEAT.trustworthiness,
        overall: recentEEAT.overall,
        cached: true,
        lastUpdated: recentEEAT.createdAt
      });
    }

    // Calculate E-E-A-T scores
    const scoringEngine = new ScoringEngine();
    const scoringData = {
      domain,
      gmbData: dealership.gmbData,
      reviewData: dealership.reviewData,
      schemaData: dealership.schemaData,
      contentData: dealership.contentData,
      citationData: dealership.citationData
    };

    const eeatScores = await scoringEngine.calculateEEAT(scoringData);

    // Save E-E-A-T scores to database
    const savedEEAT = await prisma.eEATScore.create({
      data: {
        dealershipId: dealership.id,
        expertise: eeatScores.expertise,
        experience: eeatScores.experience,
        authoritativeness: eeatScores.authoritativeness,
        trustworthiness: eeatScores.trustworthiness,
        overall: eeatScores.overall
      }
    });

    // Log the E-E-A-T analysis event
    await SecurityLogger.logEvent({
      eventType: 'eeat.analyzed',
      actorId: userId,
      payload: {
        domain,
        plan,
        scores: eeatScores,
        responseTime: Date.now() - startTime,
        cost: 0.015 // Slightly higher cost for E-E-A-T analysis
      }
    });

    // Log API access
    await SecurityLogger.logApiEvent(userId, '/api/eeat', 'POST', {
      responseTime: Date.now() - startTime,
      statusCode: 200,
      cost: 0.015,
      domain,
      plan
    });

    return NextResponse.json({
      ...eeatScores,
      lastUpdated: savedEEAT.createdAt,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('E-E-A-T API error:', error);
    
    // Log error event
    if (body?.userId) {
      await SecurityLogger.logEvent({
        eventType: 'api.error',
        actorId: body.userId,
        payload: {
          endpoint: '/api/eeat',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const userId = searchParams.get('userId');
  const plan = searchParams.get('plan') || 'FREE';

  if (!domain || !userId) {
    return NextResponse.json(
      { error: 'Domain and userId are required' },
      { status: 400 }
    );
  }

  // Check if user has Pro+ access
  if (plan === 'FREE') {
    return NextResponse.json(
      { 
        error: 'E-E-A-T analysis requires Pro+ tier',
        requiredTier: 'PRO',
        upgradeUrl: '/pricing'
      },
      { status: 403 }
    );
  }

  try {
    // Get latest E-E-A-T scores for the dealership
    const dealership = await prisma.dealership.findUnique({
      where: { domain },
      include: {
        eeatScores: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!dealership) {
      return NextResponse.json(
        { error: 'Dealership not found' },
        { status: 404 }
      );
    }

    const latestEEAT = dealership.eeatScores[0];

    if (!latestEEAT) {
      return NextResponse.json(
        { error: 'No E-E-A-T scores found for this dealership' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      expertise: latestEEAT.expertise,
      experience: latestEEAT.experience,
      authoritativeness: latestEEAT.authoritativeness,
      trustworthiness: latestEEAT.trustworthiness,
      overall: latestEEAT.overall,
      lastUpdated: latestEEAT.createdAt
    });

  } catch (error) {
    console.error('Get E-E-A-T scores error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
