import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-protection';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    const { company, phone, domain, role, plan } = await req.json();

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Add custom fields to user metadata or create a separate profile table
        // For now, we'll store in a JSON field
        metadata: {
          company,
          phone,
          domain,
          role,
          plan
        }
      }
    });

    // If user selected a paid plan, create a trial subscription
    if (plan && plan !== 'free') {
      await prisma.subscription.upsert({
        where: { userId: userId },
        update: {
          plan: plan.toUpperCase(),
          status: 'TRIAL',
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
        create: {
          userId: userId,
          plan: plan.toUpperCase(),
          status: 'TRIAL',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true
      }
    });

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
