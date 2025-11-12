export const runtime = 'edge';

import { Envelope, PulseSignalPayload } from "@/lib/reinforce/schemas";
import { verifySignature } from "@/lib/reinforce/hmac";
import { seen, isFresh, recordEvent } from "@/lib/reinforce/guards";
import { ack } from "@/lib/reinforce/ack";

/**
 * Orchestrator Train Endpoint (Edge Runtime)
 * POST /api/orchestrator/train
 * 
 * Receives pulse.signal events with HMAC verification and idempotency
 */
export async function POST(req: Request) {
  const raw = await req.text();
  let body: any;
  
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify(ack('unknown', 'bad_request', 'invalid json')), { status: 400 });
  }

  const p = Envelope.safeParse(body);
  if (!p.success) {
    return new Response(
      JSON.stringify(ack(body?.event_id || 'unknown', 'bad_request', 'envelope invalid')),
      { status: 400 }
    );
  }

  const env = p.data;
  if (env.event_type !== 'pulse.signal') {
    return new Response(
      JSON.stringify(ack(env.event_id, 'bad_request', 'wrong type')),
      { status: 400 }
    );
  }

  if (!isFresh(env.sent_at)) {
    return new Response(
      JSON.stringify(ack(env.event_id, 'stale')),
      { status: 409 }
    );
  }

  if (!(await verifySignature(env.tenant_id, raw, env.signature))) {
    return new Response(
      JSON.stringify(ack(env.event_id, 'invalid_signature')),
      { status: 401 }
    );
  }

  if (seen(env.idempotency_key) || seen(env.event_id)) {
    return new Response(
      JSON.stringify(ack(env.event_id, 'duplicate')),
      { status: 409 }
    );
  }

  const pp = PulseSignalPayload.safeParse(env.payload);
  if (!pp.success) {
    return new Response(
      JSON.stringify(ack(env.event_id, 'bad_request', 'payload invalid')),
      { status: 400 }
    );
  }

  recordEvent(env);

  return new Response(
    JSON.stringify(ack(env.event_id, 'accepted')),
    { headers: { 'content-type': 'application/json' } }
  );
}

