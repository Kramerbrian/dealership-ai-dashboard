/**
 * OEM Parser Endpoint
 * Standalone endpoint for parsing a single OEM pressroom URL
 * Useful for testing or manual triggers
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseOEMContent } from '../monitor/route'; // Reuse parsing logic

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { oem, url, brandGuidelines } = body;

    if (!oem || !url) {
      return NextResponse.json(
        { error: 'oem and url are required' },
        { status: 400 }
      );
    }

    const update = await parseOEMContent(oem, url, brandGuidelines);
    if (!update) {
      return NextResponse.json(
        { error: 'Failed to parse OEM content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, update });
  } catch (error: any) {
    console.error('[oem/parse] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

