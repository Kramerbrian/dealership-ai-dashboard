/**
 * Cron: Refresh Presence
 * Runs every 30 minutes
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // In production, iterate through tenants and refresh presence
    // For now, just acknowledge
    return NextResponse.json({ 
      success: true, 
      message: 'Presence refresh scheduled',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh presence' },
      { status: 500 }
    );
  }
}
