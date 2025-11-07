/**
 * Fix Undo API Route
 * 
 * Revert a fix within 10-minute window
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUndoData } from '../apply/route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { undoToken } = await req.json();

    if (!undoToken) {
      return NextResponse.json(
        { error: 'undoToken is required' },
        { status: 400 }
      );
    }

    // Get undo data
    const undoData = getUndoData(undoToken);
    if (!undoData) {
      return NextResponse.json(
        { error: 'Undo token expired or invalid. 10-minute window has passed.' },
        { status: 410 } // Gone
      );
    }

    // Revert the fix
    // In production, this would call your revert logic
    const result = await revertFix(undoData.pulseId, undoData.tier);

    return NextResponse.json({
      success: true,
      message: 'Fix reverted successfully',
      pulseId: undoData.pulseId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fix undo error:', error);
    return NextResponse.json(
      { error: 'Failed to undo fix' },
      { status: 500 }
    );
  }
}

async function revertFix(pulseId: string, tier: string) {
  // Implement your revert logic here
  // This would typically:
  // 1. Restore previous state
  // 2. Remove applied changes
  // 3. Log the revert
  
  console.log(`Reverting fix for ${pulseId} (tier: ${tier})`);
  return { reverted: true };
}
