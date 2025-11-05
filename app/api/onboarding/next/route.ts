import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { track } from '@/lib/telemetry';

export async function POST(req: Request) {
  try {
    const { tenantId, step, payload } = await req.json();

    if (!tenantId || !step) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, step' },
        { status: 400 }
      );
    }

    const run = await prisma.onboardingRun.update({
      where: { tenantId },
      data: {
        step,
        payload: payload || undefined,
        completed: step >= 3,
      },
    });

    await track('onboarding_next', {
      tenantId,
      step,
      completed: run.completed,
    });

    const res = NextResponse.json({
      ok: true,
      step: run.step,
      completed: run.completed,
    });

    // Set demo cookie for middleware routing
    res.cookies.set('dai_step', String(run.step), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (error) {
    console.error('[Onboarding Next] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding step' },
      { status: 500 }
    );
  }
}

