import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/push/unsubscribe
 * Unsubscribe user from push notifications
 */
export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'endpoint is required' },
        { status: 400 }
      );
    }

    // Remove subscription from database (in production)
    // await removePushSubscription(endpoint);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });

  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from push notifications' },
      { status: 500 }
    );
  }
}

