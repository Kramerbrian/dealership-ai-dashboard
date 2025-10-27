import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import { redis } from '@/lib/redis';

// E-E-A-T scoring for Pro+ users only
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

    // 3. Check if user has Pro+ tier
    if (user.plan !== 'PRO' && user.plan !== 'ENTERPRISE') {
      return NextResponse.json({
        error: 'E-E-A-T scoring requires Pro or Enterprise tier',
        currentTier: user.plan,
        requiredTier: 'PRO',
        upgradeUrl: '/pricing'
      }, { status: 403 });
    }

    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // 4. Check cache
    const cacheKey = `eeat:${domain}:${user.plan}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        tier: user.plan,
        ...JSON.parse(cached)
      });
    }

    // 5. Calculate E-E-A-T scores
    const eeatScores = await calculateEEATScores(domain, user.dealership);

    // 6. Store in database
    const eeatRecord = await prisma.eEATScore.create({
      data: {
        dealershipId: user.dealership.id,
        domain,
        expertise: eeatScores.expertise,
        experience: eeatScores.experience,
        authoritativeness: eeatScores.authoritativeness,
        trustworthiness: eeatScores.trustworthiness,
        overall: eeatScores.overall,
        tier: user.plan
      }
    });

    // 7. Cache results
    const result = {
      eeatScores,
      scoreId: eeatRecord.id,
      calculatedAt: new Date().toISOString()
    };

    await redis.setex(cacheKey, 86400, JSON.stringify(result)); // 24 hours

    return NextResponse.json({
      success: true,
      tier: user.plan,
      ...result
    });

  } catch (error) {
    console.error('E-E-A-T calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate E-E-A-T scores' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving E-E-A-T results
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Get user and check tier
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { plan: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.plan !== 'PRO' && user.plan !== 'ENTERPRISE') {
      return NextResponse.json({
        error: 'E-E-A-T scoring requires Pro or Enterprise tier',
        currentTier: user.plan,
        requiredTier: 'PRO'
      }, { status: 403 });
    }

    // Check cache first
    const cacheKey = `eeat:${domain}:${user.plan}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        tier: user.plan,
        ...JSON.parse(cached)
      });
    }

    // Get from database
    const latestEEAT = await prisma.eEATScore.findFirst({
      where: {
        domain,
        dealership: {
          users: {
            some: { clerkId: userId }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestEEAT) {
      return NextResponse.json({ error: 'No E-E-A-T analysis found for this domain' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tier: user.plan,
      eeatScores: {
        expertise: latestEEAT.expertise,
        experience: latestEEAT.experience,
        authoritativeness: latestEEAT.authoritativeness,
        trustworthiness: latestEEAT.trustworthiness,
        overall: latestEEAT.overall
      },
      scoreId: latestEEAT.id,
      calculatedAt: latestEEAT.createdAt.toISOString()
    });

  } catch (error) {
    console.error('Get E-E-A-T error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve E-E-A-T analysis' },
      { status: 500 }
    );
  }
}

// E-E-A-T calculation logic
async function calculateEEATScores(domain: string, dealership: any) {
  // This would integrate with real data sources
  // For now, we'll simulate realistic E-E-A-T scores
  
  const baseScore = 75; // Base score for all metrics
  const variance = 15; // ±15 point variance
  
  const expertise = Math.max(0, Math.min(100, 
    baseScore + (Math.random() - 0.5) * variance + 
    (dealership.certifications?.length || 0) * 5
  ));
  
  const experience = Math.max(0, Math.min(100,
    baseScore + (Math.random() - 0.5) * variance +
    Math.min(dealership.yearsInBusiness || 0, 20) * 2
  ));
  
  const authoritativeness = Math.max(0, Math.min(100,
    baseScore + (Math.random() - 0.5) * variance +
    (dealership.awards?.length || 0) * 8
  ));
  
  const trustworthiness = Math.max(0, Math.min(100,
    baseScore + (Math.random() - 0.5) * variance +
    (dealership.reviewRating || 4.0) * 10
  ));
  
  const overall = Math.round((expertise + experience + authoritativeness + trustworthiness) / 4);
  
  return {
    expertise: Math.round(expertise),
    experience: Math.round(experience),
    authoritativeness: Math.round(authoritativeness),
    trustworthiness: Math.round(trustworthiness),
    overall
  };
}
