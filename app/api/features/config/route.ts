import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { DEFAULT_CONFIG } from '@/lib/features/config';
import type { FeatureConfig } from '@/lib/features/config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Try to fetch from Redis (can be updated via admin panel)
    const redis = getRedis();
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
    const redis = getRedis();
    await redis.set('feature:config', JSON.stringify(config));

    return NextResponse.json({ ok: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

