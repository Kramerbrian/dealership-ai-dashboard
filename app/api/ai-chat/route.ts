import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json({ 
    success: true, 
    data: { response: 'AI chat response' } 
  });
}
