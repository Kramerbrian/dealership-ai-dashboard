import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { scheduleAccountDeletion, cancelAccountDeletion } from '@/lib/db/integrations';

/**
 * POST /api/gdpr/delete
 * Delete all user data (GDPR compliance)
 * Includes 30-day grace period for account recovery
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuth(req as any);
    const { confirm } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (confirm !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { error: 'Confirmation required. Send confirm: "DELETE_MY_ACCOUNT"' },
        { status: 400 }
      );
    }

    // Mark account for deletion (30-day grace period)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    // Schedule account deletion
    await scheduleAccountDeletion(userId, deletionDate);

    // TODO: Cancel all subscriptions
    // TODO: Send confirmation email
    // TODO: Schedule hard delete job (runs after 30 days)

    return NextResponse.json({
      success: true,
      message: 'Account scheduled for deletion',
      deletionDate: deletionDate.toISOString(),
      gracePeriod: '30 days',
      canUndo: true,
      undoUntil: deletionDate.toISOString(),
    });

  } catch (error: any) {
    console.error('GDPR delete error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule account deletion' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/gdpr/delete
 * Undo account deletion (within grace period)
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await getAuth(req as any);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cancel scheduled deletion
    await cancelAccountDeletion(userId);

    return NextResponse.json({
      success: true,
      message: 'Account deletion cancelled',
    });

  } catch (error: any) {
    console.error('GDPR delete undo error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel deletion' },
      { status: 500 }
    );
  }
}

