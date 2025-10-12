/**
 * DealershipAI v2.0 - Mystery Shop API
 * Enterprise tier only - schedules and retrieves mystery shop tests
 */

import { NextRequest, NextResponse } from 'next/server';
import { TierManager } from '@/lib/tier-manager';
import { SecurityLogger } from '@/lib/security-logger';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Parse request body
    const body = await request.json();
    const { 
      dealershipId, 
      userId, 
      plan = 'FREE',
      testType,
      contactInfo 
    } = body;

    if (!dealershipId || !userId || !testType) {
      return NextResponse.json(
        { error: 'DealershipId, userId, and testType are required' },
        { status: 400 }
      );
    }

    // Check if user has Enterprise access
    if (plan !== 'ENTERPRISE') {
      return NextResponse.json(
        { 
          error: 'Mystery shop testing requires Enterprise tier',
          requiredTier: 'ENTERPRISE',
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      );
    }

    // Verify dealership exists and belongs to user
    const dealership = await prisma.dealership.findFirst({
      where: { 
        id: dealershipId,
        userId: userId
      }
    });

    if (!dealership) {
      return NextResponse.json(
        { error: 'Dealership not found or access denied' },
        { status: 404 }
      );
    }

    // Schedule mystery shop test
    const mysteryShop = await prisma.mysteryShop.create({
      data: {
        dealershipId,
        testType: testType as any,
        score: 0, // Will be updated when test completes
        responseTime: null,
        personalization: 0,
        transparency: 0,
        followUp: 0,
        notes: 'Test scheduled - pending completion'
      }
    });

    // Log the mystery shop scheduling event
    await SecurityLogger.logEvent({
      eventType: 'mystery_shop.scheduled',
      actorId: userId,
      payload: {
        dealershipId,
        testType,
        contactInfo: contactInfo ? 'provided' : 'not_provided',
        responseTime: Date.now() - startTime
      }
    });

    // Log API access
    await SecurityLogger.logApiEvent(userId, '/api/mystery-shop', 'POST', {
      responseTime: Date.now() - startTime,
      statusCode: 200,
      cost: 0.05, // Higher cost for mystery shop
      dealershipId,
      testType
    });

    return NextResponse.json({
      id: mysteryShop.id,
      testType: mysteryShop.testType,
      status: 'scheduled',
      scheduledAt: mysteryShop.createdAt,
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      message: 'Mystery shop test scheduled. Results will be available within 24 hours.'
    });

  } catch (error) {
    console.error('Mystery shop API error:', error);
    
    // Log error event
    if (body?.userId) {
      await SecurityLogger.logEvent({
        eventType: 'api.error',
        actorId: body.userId,
        payload: {
          endpoint: '/api/mystery-shop',
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
  const dealershipId = searchParams.get('dealershipId');
  const userId = searchParams.get('userId');
  const plan = searchParams.get('plan') || 'FREE';

  if (!dealershipId || !userId) {
    return NextResponse.json(
      { error: 'DealershipId and userId are required' },
      { status: 400 }
    );
  }

  // Check if user has Enterprise access
  if (plan !== 'ENTERPRISE') {
    return NextResponse.json(
      { 
        error: 'Mystery shop results require Enterprise tier',
        requiredTier: 'ENTERPRISE',
        upgradeUrl: '/pricing'
      },
      { status: 403 }
    );
  }

  try {
    // Verify dealership exists and belongs to user
    const dealership = await prisma.dealership.findFirst({
      where: { 
        id: dealershipId,
        userId: userId
      }
    });

    if (!dealership) {
      return NextResponse.json(
        { error: 'Dealership not found or access denied' },
        { status: 404 }
      );
    }

    // Get mystery shop results for the dealership
    const mysteryShops = await prisma.mysteryShop.findMany({
      where: { dealershipId },
      orderBy: { createdAt: 'desc' },
      take: 10 // Last 10 tests
    });

    // Calculate average scores
    const completedTests = mysteryShops.filter(test => test.score > 0);
    const averageScores = completedTests.length > 0 ? {
      responseTime: completedTests.reduce((sum, test) => sum + (test.responseTime || 0), 0) / completedTests.length,
      personalization: completedTests.reduce((sum, test) => sum + test.personalization, 0) / completedTests.length,
      transparency: completedTests.reduce((sum, test) => sum + test.transparency, 0) / completedTests.length,
      followUp: completedTests.reduce((sum, test) => sum + test.followUp, 0) / completedTests.length,
      overall: completedTests.reduce((sum, test) => sum + test.score, 0) / completedTests.length
    } : null;

    return NextResponse.json({
      dealership: {
        id: dealership.id,
        name: dealership.name,
        domain: dealership.domain
      },
      tests: mysteryShops.map(test => ({
        id: test.id,
        testType: test.testType,
        score: test.score,
        responseTime: test.responseTime,
        personalization: test.personalization,
        transparency: test.transparency,
        followUp: test.followUp,
        notes: test.notes,
        createdAt: test.createdAt,
        status: test.score > 0 ? 'completed' : 'pending'
      })),
      averageScores,
      totalTests: mysteryShops.length,
      completedTests: completedTests.length
    });

  } catch (error) {
    console.error('Get mystery shop results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simulate mystery shop test completion (for testing purposes)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, userId, plan = 'FREE' } = body;

    if (!testId || !userId) {
      return NextResponse.json(
        { error: 'TestId and userId are required' },
        { status: 400 }
      );
    }

    // Check if user has Enterprise access
    if (plan !== 'ENTERPRISE') {
      return NextResponse.json(
        { error: 'Mystery shop testing requires Enterprise tier' },
        { status: 403 }
      );
    }

    // Simulate test completion with random scores
    const scores = {
      responseTime: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
      personalization: Math.random() * 40 + 30, // 30-70
      transparency: Math.random() * 40 + 30, // 30-70
      followUp: Math.random() * 40 + 30, // 30-70
    };

    const overallScore = (scores.personalization + scores.transparency + scores.followUp) / 3;

    const updatedTest = await prisma.mysteryShop.update({
      where: { id: testId },
      data: {
        score: Math.round(overallScore * 100) / 100,
        responseTime: scores.responseTime,
        personalization: Math.round(scores.personalization * 100) / 100,
        transparency: Math.round(scores.transparency * 100) / 100,
        followUp: Math.round(scores.followUp * 100) / 100,
        notes: 'Test completed - simulated results'
      }
    });

    // Log the test completion
    await SecurityLogger.logEvent({
      eventType: 'mystery_shop.completed',
      actorId: userId,
      payload: {
        testId,
        scores,
        overallScore
      }
    });

    return NextResponse.json({
      id: updatedTest.id,
      testType: updatedTest.testType,
      score: updatedTest.score,
      responseTime: updatedTest.responseTime,
      personalization: updatedTest.personalization,
      transparency: updatedTest.transparency,
      followUp: updatedTest.followUp,
      status: 'completed',
      completedAt: updatedTest.createdAt
    });

  } catch (error) {
    console.error('Complete mystery shop test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
