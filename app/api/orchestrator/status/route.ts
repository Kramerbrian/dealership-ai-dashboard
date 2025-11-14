import { NextResponse } from 'next/server';
import { isSafeMode, getSafeModeStatus } from '@/lib/safe-mode-handler';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/orchestrator/status
 * Returns current orchestrator status, system state, and job details
 */
export async function GET() {
  try {
    const statePath = path.join(process.cwd(), 'public', 'system-state.json');
    let state = null;
    let jobs: Record<string, any> = {};

    if (fs.existsSync(statePath)) {
      try {
        const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        state = stateData;
        
        // Extract job details from orchestrator results
        if (stateData?.results) {
          jobs = Object.entries(stateData.results).reduce((acc, [id, result]: [string, any]) => {
            acc[id] = {
              id,
              success: result.success || false,
              duration: result.duration || '0s',
              lastRun: result.lastRun || new Date().toISOString(),
            };
            return acc;
          }, {} as Record<string, any>);
        }
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
      state: state?.orchestrator || state,
      jobs,
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
