import { NextRequest, NextResponse } from 'next/server';
import { getVoices } from '@/lib/elevenlabs';

export async function GET(req: NextRequest) {
  try {
    const voices = await getVoices();
    return NextResponse.json({ voices });
  } catch (error: any) {
    console.error('[elevenlabs] Error fetching voices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
