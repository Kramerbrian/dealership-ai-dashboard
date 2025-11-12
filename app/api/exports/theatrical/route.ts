import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Read the zip file from the public directory
    const filePath = join(process.cwd(), 'public', 'exports', 'dealershipai_theatrical_export.zip');
    const fileBuffer = readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="dealershipai_theatrical_export.zip"',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error serving theatrical export:', error);
    return NextResponse.json(
      { error: 'Export file not found' },
      { status: 404 }
    );
  }
}
