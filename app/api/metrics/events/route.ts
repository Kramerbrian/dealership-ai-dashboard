import { NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics/events';

export async function GET() {
  return NextResponse.json({ ...metrics, ts: new Date().toISOString() });
}
