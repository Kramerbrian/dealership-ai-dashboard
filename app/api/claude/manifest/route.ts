import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * GET /api/claude/manifest
 * Returns the Claude export manifest.json
 */
export async function GET(request: NextRequest) {
  try {
    const manifestPath = path.join(process.cwd(), 'exports/manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Manifest read error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Manifest not found',
      },
      { status: 404 }
    );
  }
}
