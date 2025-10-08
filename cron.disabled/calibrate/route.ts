import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = headers().get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const CalibrationEngine = (await import('@/../scripts/calibrate')).default;
    const engine = new CalibrationEngine();
    const results = await engine.calibrate();

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Calibration cron failed:', error);
    return NextResponse.json(
      { error: 'Calibration failed' },
      { status: 500 }
    );
  }
}
