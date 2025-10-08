import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = headers().get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const CacheWarmer = (await import('@/../scripts/warm-cache')).default;
    const warmer = new CacheWarmer();
    const results = await warmer.warmCache();

    return NextResponse.json({ success: true, warmed: results.length });
  } catch (error) {
    console.error('Cache warming cron failed:', error);
    return NextResponse.json(
      { error: 'Cache warming failed' },
      { status: 500 }
    );
  }
}
