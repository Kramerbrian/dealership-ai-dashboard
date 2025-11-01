import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { checkAdminRole } from '@/lib/db/integrations';

/**
 * GET /api/admin/check-access
 * Check if user has admin permissions
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await getAuth(req as any);

    if (!userId) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }

    // Check user's role in database
    const isAdmin = await checkAdminRole(userId);

    return NextResponse.json({
      authorized: isAdmin,
      userId,
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}

