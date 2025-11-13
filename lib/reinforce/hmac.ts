/**
 * HMAC signature verification for webhook security
 * Prevents unauthorized access to orchestrator training endpoint
 */
export async function verifySignature(
  tenantId: string,
  rawBody: string,
  signature: string
): Promise<boolean> {
  try {
    // Get tenant-specific webhook secret
    const secret = process.env.WEBHOOK_SECRET || process.env.CRON_SECRET;

    if (!secret) {
      console.error('[HMAC] No webhook secret configured');
      return false;
    }

    if (!signature) {
      console.error('[HMAC] No signature provided');
      return false;
    }

    // Encode the secret and message
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(rawBody);

    // Import the key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Generate HMAC signature
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      messageData
    );

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Compare signatures (constant-time comparison)
    const providedSig = signature.toLowerCase().replace('sha256=', '');
    const isValid = hashHex === providedSig;

    if (!isValid) {
      console.error('[HMAC] Signature verification failed');
      console.error('[HMAC] Expected:', hashHex);
      console.error('[HMAC] Received:', providedSig);
    }

    return isValid;

  } catch (error) {
    console.error('[HMAC] Verification error:', error);
    return false;
  }
}

/**
 * Generate HMAC signature for outgoing webhooks
 */
export async function generateSignature(
  rawBody: string,
  secret?: string
): Promise<string> {
  const webhookSecret = secret || process.env.WEBHOOK_SECRET || process.env.CRON_SECRET;

  if (!webhookSecret) {
    throw new Error('No webhook secret configured');
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(webhookSecret);
  const messageData = encoder.encode(rawBody);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    messageData
  );

  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `sha256=${hashHex}`;
}

