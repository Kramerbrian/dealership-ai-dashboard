import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// Default feature configuration
const DEFAULT_CONFIG = {
  onboarding: {
    enabled: true,
    requireEmail: true,
  },
  shareToUnlock: {
    enabled: true,
    platforms: ['twitter', 'linkedin'],
  },
  telemetry: {
    enabled: true,
    trackPageViews: true,
  },
};

type FeatureConfig = typeof DEFAULT_CONFIG;

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Try to fetch from Redis (can be updated via admin panel)
    const config = await redis.get('feature:config');

    if (config) {
      return NextResponse.json(JSON.parse(config));
    }

    // Return default config
    return NextResponse.json(DEFAULT_CONFIG);
  } catch (error) {
    // Fallback to default
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(req: Request) {
  try {
    // TODO: Add admin authentication
    const body = await req.json();
    const config: FeatureConfig = { ...DEFAULT_CONFIG, ...body };

    // Store in Redis
    await redis.set('feature:config', JSON.stringify(config));

    return NextResponse.json({ ok: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

