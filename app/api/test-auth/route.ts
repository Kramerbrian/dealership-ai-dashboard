import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Test basic auth configuration
    const config = {
      providers: authOptions.providers?.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type
      })),
      session: authOptions.session,
      pages: authOptions.pages,
      callbacks: Object.keys(authOptions.callbacks || {}),
    };

    return NextResponse.json({
      status: 'Auth Configuration Test',
      config,
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
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
