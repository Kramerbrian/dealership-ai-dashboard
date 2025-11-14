import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { runOrchestrator } from '@/lib/meta-orchestrator';
import { clearSafeMode, triggerSafeMode, isSafeMode } from '@/lib/safe-mode-handler';
import { spawnSync } from 'child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/orchestrator/command
 * Execute orchestrator commands (requires authentication)
 * 
 * Commands:
 * - "run" - Execute orchestrator
 * - "clear-safe-mode" - Clear safe mode
 * - "trigger-safe-mode" - Enter safe mode (with reason)
 */
export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { command, reason } = body;

    switch (command) {
      case 'run':
        const results = runOrchestrator();
        return NextResponse.json({
          ok: true,
          command: 'run',
          results,
          timestamp: new Date().toISOString(),
        });

      case 'clear-safe-mode':
        clearSafeMode(userId);
        return NextResponse.json({
          ok: true,
          command: 'clear-safe-mode',
          message: 'Safe mode cleared',
          timestamp: new Date().toISOString(),
        });

      case 'trigger-safe-mode':
        triggerSafeMode(reason || 'Manual trigger');
        return NextResponse.json({
          ok: true,
          command: 'trigger-safe-mode',
          reason: reason || 'Manual trigger',
          timestamp: new Date().toISOString(),
        });

      case 'status':
        return NextResponse.json({
          ok: true,
          command: 'status',
          safeMode: isSafeMode(),
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            ok: false,
            error: `Unknown command: ${command}. Valid commands: run, clear-safe-mode, trigger-safe-mode, status`,
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[orchestrator/command] error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to execute command',
      },
      { status: 500 }
    );
  }
}

