import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getAdminStats, checkAdminRole } from '@/lib/db/integrations';

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
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

    // Check admin access
    const isAdmin = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch stats from database
    const stats = await getAdminStats();

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

