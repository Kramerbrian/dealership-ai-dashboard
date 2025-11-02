import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    return NextResponse.json({
      status: 'Auth Configuration Test (Clerk)',
      authenticated: !!userId,
      userId: userId || null,
      environment: {
        CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing',
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing',
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      error: 'Auth configuration test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
