// @ts-nocheck
import { verifySignature } from '@/lib/reinforce/hmac';
import { seen, isFresh, recordEvent } from '@/lib/reinforce/guards';
import { ack } from '@/lib/reinforce/ack';

export const runtime = 'edge';

/**
 * Orchestrator Train Endpoint (Edge Runtime)
 * POST /api/orchestrator/train
 *
 * Receives pulse.signal events with HMAC verification and idempotency
 *
 * Security Features:
 * - HMAC signature verification
 * - Idempotency checks (duplicate event detection)
 * - Timestamp freshness validation
 * - Event type validation
 */
export async function POST(req: Request) {
  const raw = await req.text();
  let body: any;

  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(
      JSON.stringify(ack('unknown', 'bad_request', 'invalid json')),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  // Validate required fields
  if (!body.event_id || !body.event_type || !body.tenant_id) {
    return new Response(
      JSON.stringify(ack('unknown', 'bad_request', 'missing required fields: event_id, event_type, tenant_id')),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  // Validate event type
  if (body.event_type !== 'pulse.signal') {
    return new Response(
      JSON.stringify(ack(body.event_id, 'bad_request', `unsupported event type: ${body.event_type}`)),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  // HMAC signature verification
  const signature = req.headers.get('x-signature') || req.headers.get('x-hub-signature-256');
  if (signature) {
    const isValid = await verifySignature(body.tenant_id, raw, signature);
    if (!isValid) {
      console.error('[train] HMAC verification failed for event:', body.event_id);
      return new Response(
        JSON.stringify(ack(body.event_id, 'unauthorized', 'invalid signature')),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  } else {
    console.warn('[train] No signature provided for event:', body.event_id);
    // In production, you might want to reject requests without signatures
    // For now, we'll allow it but log a warning
  }

  // Idempotency check - prevent duplicate processing
  if (seen(body.event_id)) {
    console.log('[train] Duplicate event detected:', body.event_id);
    return new Response(
      JSON.stringify(ack(body.event_id, 'duplicate', 'event already processed')),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  }

  // Timestamp freshness check
  if (body.sent_at && !isFresh(body.sent_at)) {
    console.warn('[train] Stale event received:', body.event_id, 'sent_at:', body.sent_at);
    return new Response(
      JSON.stringify(ack(body.event_id, 'rejected', 'event too old')),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  // Record event for processing
  recordEvent(body);

  // TODO: Implement actual training logic
  // - Extract signal data from body.payload
  // - Update agent models
  // - Store training metrics
  // - Trigger model retraining if needed

  console.log('[train] Event accepted:', {
    event_id: body.event_id,
    event_type: body.event_type,
    tenant_id: body.tenant_id,
    payload_keys: Object.keys(body.payload || {})
  });

  return new Response(
    JSON.stringify(ack(body.event_id, 'accepted', 'event queued for processing')),
    {
      status: 202,  // 202 Accepted - processing will happen async
      headers: { 'content-type': 'application/json' }
    }
  );
}

