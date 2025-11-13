import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Redirect to the static file in the public directory
    // Vercel serves files from /public at the root
    return NextResponse.redirect(
      new URL('/exports/dealershipai_theatrical_export.zip', 'https://dealershipai.com'),
      { status: 302 }
    );
  } catch (error) {
    console.error('Error serving theatrical export:', error);
    return NextResponse.json(
      { error: 'Export file not found' },
      { status: 404 }
    );
  }
}
