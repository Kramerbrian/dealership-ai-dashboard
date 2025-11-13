import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  const body = await req.json();
  return NextResponse.json({
    success: true,
    received: body,
    message: 'POST request successful!'
  });
}
