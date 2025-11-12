import { NextRequest, NextResponse } from 'next/server';

export function createEnhancedApiRoute(handler: any) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
}
