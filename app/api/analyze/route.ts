/**
 * DealershipAI v2.0 - Main Analysis API
 * Handles tier enforcement, session limits, and scoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScoringEngine } from '@/lib/scoring-engine';
import { TierManager } from '@/lib/tier-manager';
import { GeoPoolManager } from '@/lib/redis';
import { securityLogger, SecurityLogger } from '@/lib/security-logger';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const clientIP = SecurityLogger.getClientIP(request);
    const userAgent = SecurityLogger.getUserAgent(request);
    
    // Parse request body
    const body = await request.json();
    const { domain, userId, plan = 'FREE' } = body;

    if (!domain || !userId) {
      // Log invalid request
      await securityLogger.logApiEvent('/api/analyze', 'POST', userId || 'unknown', {
        error: 'Missing required fields',
        domain: domain || 'missing',
        userId: userId || 'missing',
        statusCode: 400
      }, undefined, {
        ip_address: clientIP,
        user_agent: userAgent
      });

      return NextResponse.json(
        { error: 'Domain and userId are required' },
        { status: 400 }
      );
    }

    // Log API access
    await securityLogger.logApiEvent('/api/analyze', 'POST', userId, {
      domain,
      plan,
      statusCode: 200
    }, undefined, {
      ip_address: clientIP,
      user_agent: userAgent
    });

    // Check tier limits
    const tierCheck = await TierManager.canMakeRequest(userId, plan as any);
    if (!tierCheck.allowed) {
      await securityLogger.logTierLimitEvent(userId, plan, TierManager.getTierInfo(plan as any).sessionLimit, tierCheck.sessionsUsed, {
        endpoint: '/api/analyze',
        domain
      });

      return NextResponse.json(
        { 
          error: 'Session limit reached',
          reason: tierCheck.reason,
          sessionsUsed: tierCheck.sessionsUsed,
          sessionsRemaining: tierCheck.sessionsRemaining,
          upgradeUrl: '/pricing'
        },
        { status: 429 }
      );
    }

    // Check for cached results first
    const cachedScores = await GeoPoolManager.getCachedScores(domain);
    if (cachedScores) {
      await SecurityLogger.logApiEvent(userId, '/api/analyze', 'POST', {
        responseTime: Date.now() - startTime,
        statusCode: 200,
        cost: 0.001, // Minimal cost for cached result
        cached: true
      });

      return NextResponse.json({
        ...cachedScores,
        cached: true,
        sessionsUsed: tierCheck.sessionsUsed + 1,
        sessionsRemaining: tierCheck.sessionsRemaining - 1
      });
    }

    // Get dealership data
    const dealership = await prisma.dealership.findUnique({
      where: { domain },
      include: {
        scores: {
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

    // Get geographic pool data for cost optimization
    const geoPoolData = await GeoPoolManager.getPoolData(dealership.city, dealership.state, dealership.country);
    const poolDataWithVariance = GeoPoolManager.addVariance(geoPoolData, domain);

    // Calculate scores using the scoring engine
    const scoringEngine = new ScoringEngine();
    const scoringData = {
      domain,
      gmbData: dealership.gmbData,
      reviewData: dealership.reviewData,
      schemaData: dealership.schemaData,
      contentData: dealership.contentData,
      citationData: dealership.citationData
    };

    const coreScores = await scoringEngine.calculateScores(scoringData);
    
    // Calculate E-E-A-T scores for Pro+ users
    let eeatScores = null;
    if (plan === 'PRO' || plan === 'ENTERPRISE') {
      eeatScores = await scoringEngine.calculateEEAT(scoringData);
    }

    // Save scores to database
    const savedScore = await prisma.score.create({
      data: {
        dealershipId: dealership.id,
        aiVisibility: coreScores.aiVisibility,
        zeroClick: coreScores.zeroClick,
        ugcHealth: coreScores.ugcHealth,
        geoTrust: coreScores.geoTrust,
        sgpIntegrity: coreScores.sgpIntegrity,
        overall: coreScores.overall
      }
    });

    // Save E-E-A-T scores if calculated
    if (eeatScores) {
      await prisma.eEATScore.create({
        data: {
          dealershipId: dealership.id,
          expertise: eeatScores.expertise,
          experience: eeatScores.experience,
          authoritativeness: eeatScores.authoritativeness,
          trustworthiness: eeatScores.trustworthiness,
          overall: eeatScores.overall
        }
      });
    }

    // Cache the results
    await GeoPoolManager.cacheScores(domain, {
      ...coreScores,
      eeatScores,
      geoPoolData: poolDataWithVariance,
      generatedAt: new Date().toISOString()
    });

    // Increment session count
    const cost = 0.0125; // $0.0125 per query
    await GeoPoolManager.incrementSession(userId, cost);

    // Log the scoring event
    await SecurityLogger.logScoringEvent(userId, dealership.id, coreScores, {
      domain,
      plan,
      responseTime: Date.now() - startTime,
      cost,
      geoPoolHit: !!geoPoolData
    });

    // Log API access
    await SecurityLogger.logApiEvent(userId, '/api/analyze', 'POST', {
      responseTime: Date.now() - startTime,
      statusCode: 200,
      cost,
      domain,
      plan
    });

    // Get updated session count
    const updatedSessionsUsed = await GeoPoolManager.getSessionCount(userId);
    const sessionsRemaining = Math.max(0, TierManager.getTierInfo(plan as any).sessionLimit - updatedSessionsUsed);

    return NextResponse.json({
      ...coreScores,
      eeatScores,
      geoPoolData: poolDataWithVariance,
      sessionsUsed: updatedSessionsUsed,
      sessionsRemaining,
      tier: plan,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    
    // Log error event
    if (body?.userId) {
      await SecurityLogger.logEvent({
        eventType: 'api.error',
        actorId: body.userId,
        payload: {
          endpoint: '/api/analyze',
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

  if (!domain || !userId) {
    return NextResponse.json(
      { error: 'Domain and userId are required' },
      { status: 400 }
    );
  }

  try {
    // Get latest scores for the dealership
    const dealership = await prisma.dealership.findUnique({
      where: { domain },
      include: {
        scores: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
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

    const latestScore = dealership.scores[0];
    const latestEEAT = dealership.eeatScores[0];

    if (!latestScore) {
      return NextResponse.json(
        { error: 'No scores found for this dealership' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      aiVisibility: latestScore.aiVisibility,
      zeroClick: latestScore.zeroClick,
      ugcHealth: latestScore.ugcHealth,
      geoTrust: latestScore.geoTrust,
      sgpIntegrity: latestScore.sgpIntegrity,
      overall: latestScore.overall,
      eeatScores: latestEEAT ? {
        expertise: latestEEAT.expertise,
        experience: latestEEAT.experience,
        authoritativeness: latestEEAT.authoritativeness,
        trustworthiness: latestEEAT.trustworthiness,
        overall: latestEEAT.overall
      } : null,
      lastUpdated: latestScore.createdAt
    });

  } catch (error) {
    console.error('Get scores error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}