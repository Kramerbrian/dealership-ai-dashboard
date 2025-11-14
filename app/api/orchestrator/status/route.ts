import { NextResponse } from 'next/server';
import { isSafeMode, getSafeModeStatus } from '@/lib/safe-mode-handler';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/orchestrator/status
 * Returns current orchestrator status and system state
 */
export async function GET() {
  try {
    const statePath = path.join(process.cwd(), 'public', 'system-state.json');
    let state = null;

    if (fs.existsSync(statePath)) {
      try {
        state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      } catch {
        // Ignore parse errors
      }
    }

    const safeMode = isSafeMode();
    const safeModeStatus = getSafeModeStatus();

    return NextResponse.json({
      ok: true,
      safeMode,
      safeModeStatus,
      systemState: state,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to get orchestrator status',
      },
      { status: 500 }
    );
  }
}
