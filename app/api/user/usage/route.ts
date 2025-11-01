import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getUserUsage } from '@/lib/db/integrations';

/**
 * GET /api/user/usage
 * Get user's usage metrics for current month
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await getAuth(req as any);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usage = await getUserUsage(userId);

    return NextResponse.json({
      usage,
      month: new Date().toISOString().slice(0, 7), // YYYY-MM
    });

  } catch (error) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
