import crypto from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Verify HMAC signature for webhook requests
 */
export function verifyHmacSignature(
  req: NextRequest,
  secret: string,
  body: string
): boolean {
  try {
    const signature = req.headers.get('x-signature');
    const timestamp = req.headers.get('x-timestamp');
    
    if (!signature || !timestamp) {
      return false;
    }
    
    // Check timestamp to prevent replay attacks (5 minutes tolerance)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);
    
    if (Math.abs(now - requestTime) > 300) { // 5 minutes
      return false;
    }
    
    // Create expected signature
    const payload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('HMAC verification failed:', error);
    return false;
  }
}

/**
 * Generate HMAC signature for outgoing requests
 */
export function generateHmacSignature(
  body: string,
  secret: string,
  timestamp?: number
): { signature: string; timestamp: number } {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const payload = `${ts}.${body}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return { signature, timestamp: ts };
}

/**
 * Middleware for HMAC verification
 */
export function requireHmacAuth(secret: string) {
  return async (req: NextRequest): Promise<boolean> => {
    const body = await req.text();
    return verifyHmacSignature(req, secret, body);
  };
}
