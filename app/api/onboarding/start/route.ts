import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { track } from '@/lib/telemetry';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, website, city, state, lat, lng } = body;

    if (!name || !city || !state) {
      return NextResponse.json(
        { error: 'Missing required fields: name, city, state' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        website,
        city,
        state,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      },
    });

    await prisma.onboardingRun.create({
      data: {
        tenantId: tenant.id,
        step: 1,
      },
    });

    await track('onboarding_started', {
      tenantId: tenant.id,
      city,
      state,
    });

    return NextResponse.json({ ok: true, tenantId: tenant.id });
  } catch (error) {
    console.error('[Onboarding Start] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start onboarding' },
      { status: 500 }
    );
  }
}

