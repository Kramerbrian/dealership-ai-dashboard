import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/emails/preferences
 * Get user email preferences
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user preferences (you'd store this in your database)
    const preferences = {
      dailyDigest: true,
      weeklyReport: true,
      criticalAlerts: true, // Can't disable
      competitorAlerts: true,
      productUpdates: false,
      marketingEmails: false,
    };

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/emails/preferences
 * Update user email preferences
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await req.json();

    // Save preferences to database
    // await prisma.user.update({
    //   where: { clerkId: userId },
    //   data: { emailPreferences: preferences },
    // });

    return NextResponse.json({
      success: true,
      preferences,
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

