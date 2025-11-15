import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Track a share event and unlock feature for 24 hours
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      domain, 
      featureName, 
      platform, 
      shareUrl, 
      referralCode,
      sessionId 
    } = body;

    // Validate required fields
    if (!featureName || !platform || !shareUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: featureName, platform, shareUrl' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['twitter', 'linkedin', 'facebook', 'copy'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be one of: twitter, linkedin, facebook, copy' },
        { status: 400 }
      );
    }

    // Get IP address for anonymous tracking
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Create unlock expiration (24 hours from now)
    const unlockExpiresAt = new Date();
    unlockExpiresAt.setHours(unlockExpiresAt.getHours() + 24);

    // Create share event
    const shareEvent = await prisma.shareEvent.create({
      data: {
        domain: domain || null,
        featureName,
        platform,
        shareUrl,
        referralCode: referralCode || null,
        sessionId: sessionId || null,
        ipAddress,
        unlockExpiresAt,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      shareId: shareEvent.id,
      unlockExpiresAt: shareEvent.unlockExpiresAt.toISOString(),
      message: 'Share tracked successfully. Feature unlocked for 24 hours.'
    });

  } catch (error) {
    console.error('Share tracking error:', error);
    
    // Return success even if database fails (graceful degradation)
    return NextResponse.json({
      success: true,
      message: 'Share tracked. Feature unlocked for 24 hours.',
      unlockExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }, { status: 200 });
  }
}

/**
 * Check if a feature is unlocked for a user/session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featureName = searchParams.get('featureName') || undefined;
    const domain = searchParams.get('domain') || undefined;
    const sessionId = searchParams.get('sessionId') || undefined;

    if (!featureName) {
      return NextResponse.json(
        { error: 'featureName parameter is required' },
        { status: 400 }
      );
    }

    // Find active unlocks for this feature
    const now = new Date();
    const activeShares = await prisma.shareEvent.findMany({
      where: {
        featureName,
        isActive: true,
        unlockExpiresAt: {
          gt: now // Not expired
        },
        ...(domain ? { domain } : {}),
        ...(sessionId ? { sessionId } : {})
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    });

    const isUnlocked = activeShares.length > 0;
    const unlockExpiresAt = isUnlocked 
      ? activeShares[0].unlockExpiresAt 
      : null;

    return NextResponse.json({
      isUnlocked,
      unlockExpiresAt: unlockExpiresAt?.toISOString() || null,
      timeRemaining: unlockExpiresAt 
        ? Math.max(0, Math.floor((unlockExpiresAt.getTime() - now.getTime()) / 1000))
        : 0
    });

  } catch (error) {
    console.error('Unlock check error:', error);
    
    // Return not unlocked on error (fail secure)
    return NextResponse.json({
      isUnlocked: false,
      unlockExpiresAt: null,
      timeRemaining: 0
    }, { status: 200 });
  }
}
