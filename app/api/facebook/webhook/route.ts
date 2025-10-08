/**
 * Facebook Page Webhook Handler (Compliant)
 * Handles Page events instead of deprecated Groups API
 */

import { NextRequest, NextResponse } from 'next/server';
import { handlePageWebhook } from '@/lib/facebook/page-webhooks';

export async function GET(request: NextRequest) {
  // Facebook webhook verification
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    console.log('Facebook webhook verified');
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-hub-signature-256') || '';
    
    console.log('Facebook webhook received:', JSON.stringify(body, null, 2));
    
    const result = await handlePageWebhook(body, signature);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Facebook webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
