import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findNearbyDealers } from '@/lib/google';
import { getAIScores } from '@/lib/aiScores';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId required' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant?.lat || !tenant?.lng) {
      return NextResponse.json(
        { error: 'tenant missing lat/lng coordinates' },
        { status: 400 }
      );
    }

    const places = await findNearbyDealers(tenant.lat, tenant.lng);

    // Filter out self by name/domain hints and take top 5
    const mine = (tenant.name || '').toLowerCase();
    const filtered = places
      .filter((p) => !p.name?.toLowerCase().includes(mine))
      .slice(0, 5);

    // Enrich with AI scores
    const enriched = await Promise.all(
      filtered.map(async (p) => {
        const origin = tenant.website
          ? tenant.website
          : `https://example.com/${encodeURIComponent(p.name || 'dealer')}`;
        const scores = await getAIScores(origin);

        return {
          placeId: p.place_id,
          name: p.name,
          rating: p.rating ?? null,
          reviewCount: p.user_ratings_total ?? null,
          aiVisibility: scores.aiVisibility,
          zeroClick: scores.zeroClick,
          sentiment: scores.sentiment,
          distanceMi: null, // Calculate if needed
        };
      })
    );

    // Persist snapshot
    await prisma.$transaction(
      enriched.map((c) =>
        prisma.competitor.upsert({
          where: {
            tenantId_placeId: {
              tenantId,
              placeId: c.placeId,
            },
          },
          update: {
            ...c,
            lastScan: new Date(),
          },
          create: {
            tenantId,
            placeId: c.placeId,
            name: c.name!,
            rating: c.rating ?? 0,
            reviewCount: c.reviewCount ?? 0,
            aiVisibility: c.aiVisibility,
            zeroClick: c.zeroClick,
            sentiment: c.sentiment,
          },
        })
      )
    );

    return NextResponse.json({ competitors: enriched });
  } catch (error) {
    console.error('[Competitors Nearby] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}

