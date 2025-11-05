import crypto from 'crypto';

export function verifyHmac(body: string, signature: string | null | undefined, secret: string): boolean {
  if (!signature) return false;
  const mac = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(signature));
  } catch {
    return false;
  }
}

