import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import crypto from 'crypto';

/**
 * POST /api/webhooks/send
 * Internal endpoint to send webhook events
 */
export async function POST(req: NextRequest) {
  try {
    // Verify this is an internal request
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { event, payload, webhookUrl } = await req.json();

    if (!event || !payload || !webhookUrl) {
      return NextResponse.json(
        { error: 'Event, payload, and webhookUrl are required' },
        { status: 400 }
      );
    }

    // Generate HMAC signature
    const secret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
    const signature = generateSignature(JSON.stringify(payload), secret);

    // Send webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DealershipAI-Event': event,
        'X-DealershipAI-Signature': signature,
        'X-DealershipAI-Timestamp': new Date().toISOString(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Webhook send error:', error);
    return NextResponse.json(
      { error: 'Failed to send webhook', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate HMAC-SHA256 signature for webhook
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify webhook signature (for receivers)
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

