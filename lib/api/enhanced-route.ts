import { NextRequest, NextResponse } from 'next/server';

export function createAuthRoute(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function(req: NextRequest) {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
