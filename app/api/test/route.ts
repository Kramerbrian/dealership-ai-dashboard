import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({
    success: true,
    received: body,
    message: 'POST request successful!'
  });
}
