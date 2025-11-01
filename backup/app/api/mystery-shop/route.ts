import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import { redis } from '@/lib/redis';

// Mystery Shop automation for Enterprise users only
export async function POST() {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user and check tier
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        dealership: true
      }
    });

    if (!user?.dealership) {
      return NextResponse.json({ error: 'Dealership not found' }, { status: 404 });
    }

    // 3. Check if user has Enterprise tier
    if (user.plan !== 'ENTERPRISE') {
      return NextResponse.json({
        error: 'Mystery Shop automation requires Enterprise tier',
        currentTier: user.plan,
        requiredTier: 'ENTERPRISE',
        upgradeUrl: '/pricing'
      }, { status: 403 });
    }

    const { shopType, scheduledFor } = await req.json();

    if (!shopType) {
      return NextResponse.json({ error: 'Shop type is required' }, { status: 400 });
    }

    // 4. Check session limits for mystery shops
    const sessionKey = `mystery_shops:${userId}:${new Date().toISOString().split('T')[0]}`;
    const shopsUsed = await redis.get(sessionKey) || 0;
    const shopLimit = 5; // 5 mystery shops per day for Enterprise
    
    if (shopsUsed >= shopLimit) {
      return NextResponse.json({
        error: 'Daily mystery shop limit reached',
        shopsUsed: Number(shopsUsed),
        shopLimit,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }, { status: 429 });
    }

    // 5. Increment shop counter
    await redis.incr(sessionKey);
    await redis.expire(sessionKey, 86400); // 24 hours

    // 6. Create mystery shop record
    const mysteryShop = await prisma.mysteryShop.create({
      data: {
        dealershipId: user.dealership.id,
        shopType,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        status: 'SCHEDULED',
        tier: user.plan
      }
    });

    // 7. Schedule the actual mystery shop (in a real implementation, this would trigger automation)
    await scheduleMysteryShop(mysteryShop.id, shopType, user.dealership);

    return NextResponse.json({
      success: true,
      shopId: mysteryShop.id,
      shopType,
      status: 'SCHEDULED',
      scheduledFor: mysteryShop.scheduledFor,
      tier: user.plan,
      shopsUsed: Number(shopsUsed) + 1,
      shopLimit
    });

  } catch (error) {
    console.error('Mystery shop creation error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule mystery shop' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving mystery shop results
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and check tier
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { plan: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.plan !== 'ENTERPRISE') {
      return NextResponse.json({
        error: 'Mystery Shop results require Enterprise tier',
        currentTier: user.plan,
        requiredTier: 'ENTERPRISE'
      }, { status: 403 });
    }

    // Get dealership
    const dealership = await prisma.dealership.findFirst({
      where: {
        users: {
          some: { clerkId: userId }
        }
      }
    });

    if (!dealership) {
      return NextResponse.json({ error: 'Dealership not found' }, { status: 404 });
    }

    // Get mystery shop results
    const mysteryShops = await prisma.mysteryShop.findMany({
      where: {
        dealershipId: dealership.id
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Calculate average scores
    const completedShops = mysteryShops.filter(shop => shop.status === 'COMPLETED');
    const avgScores = completedShops.length > 0 ? {
      responseTime: Math.round(completedShops.reduce((sum, shop) => sum + (shop.responseTime || 0), 0) / completedShops.length),
      personalization: Math.round(completedShops.reduce((sum, shop) => sum + (shop.personalization || 0), 0) / completedShops.length),
      transparency: Math.round(completedShops.reduce((sum, shop) => sum + (shop.transparency || 0), 0) / completedShops.length),
      followUp: Math.round(completedShops.reduce((sum, shop) => sum + (shop.followUp || 0), 0) / completedShops.length),
      overall: Math.round(completedShops.reduce((sum, shop) => sum + (shop.overallScore || 0), 0) / completedShops.length)
    } : null;

    return NextResponse.json({
      success: true,
      tier: user.plan,
      mysteryShops: mysteryShops.map(shop => ({
        id: shop.id,
        shopType: shop.shopType,
        status: shop.status,
        scheduledFor: shop.scheduledFor,
        completedAt: shop.completedAt,
        scores: {
          responseTime: shop.responseTime,
          personalization: shop.personalization,
          transparency: shop.transparency,
          followUp: shop.followUp,
          overall: shop.overallScore
        },
        notes: shop.notes
      })),
      averageScores: avgScores,
      totalShops: mysteryShops.length,
      completedShops: completedShops.length
    });

  } catch (error) {
    console.error('Get mystery shop error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve mystery shop results' },
      { status: 500 }
    );
  }
}

// Schedule mystery shop automation
async function scheduleMysteryShop(shopId: string, shopType: string, dealership: any) {
  // In a real implementation, this would:
  // 1. Send email to dealership
  // 2. Fill out contact form
  // 3. Call phone number
  // 4. Test chat widget
  // 5. Measure response times and quality
  
  // For now, we'll simulate the process
  setTimeout(async () => {
    try {
      // Simulate mystery shop execution
      const scores = await executeMysteryShop(shopType, dealership);
      
      // Update the mystery shop record
      await prisma.mysteryShop.update({
        where: { id: shopId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          responseTime: scores.responseTime,
          personalization: scores.personalization,
          transparency: scores.transparency,
          followUp: scores.followUp,
          overallScore: scores.overall,
          notes: scores.notes
        }
      });
    } catch (error) {
      console.error('Mystery shop execution error:', error);
      
      // Mark as failed
      await prisma.mysteryShop.update({
        where: { id: shopId },
        data: {
          status: 'FAILED',
          notes: 'Mystery shop execution failed'
        }
      });
    }
  }, 5000); // Simulate 5-second delay
}

// Execute mystery shop (simulated)
async function executeMysteryShop(shopType: string, dealership: any) {
  // Simulate different shop types
  const baseScore = 75;
  const variance = 20;
  
  const scores = {
    responseTime: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance)),
    personalization: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance)),
    transparency: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance)),
    followUp: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance)),
    overall: 0,
    notes: ''
  };
  
  // Adjust scores based on shop type
  switch (shopType) {
    case 'EMAIL':
      scores.notes = 'Email response test - checked response time and quality';
      break;
    case 'PHONE':
      scores.notes = 'Phone call test - measured call handling and professionalism';
      break;
    case 'CHAT':
      scores.notes = 'Chat widget test - evaluated response quality and speed';
      break;
    case 'FORM':
      scores.notes = 'Contact form test - checked form functionality and follow-up';
      break;
    default:
      scores.notes = 'General mystery shop test';
  }
  
  scores.overall = Math.round((scores.responseTime + scores.personalization + scores.transparency + scores.followUp) / 4);
  
  return scores;
}
