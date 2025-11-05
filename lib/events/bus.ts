import { EventEmitter } from 'events';
import type { AiScoreUpdateEvent, MSRPChangeEvent } from './types';
import { xappend } from '@/lib/events/stream';

export type { AiScoreUpdateEvent, MSRPChangeEvent };

const LOCAL = new EventEmitter();

export const Channels = {
  ai: 'dai:ai-scores:update',
  msrp: 'dai:msrp:change',
} as const;

let useRedis = false;
let pub: any = null;
let sub: any = null;

async function init() {
  const url = process.env.REDIS_URL;
  if (!url) return;

  const { createClient } = await import('redis');
  pub = createClient({ url });
  sub = createClient({ url });

  pub.on('error', (e: any) => console.error('[redis:pub]', e?.message || e));
  sub.on('error', (e: any) => console.error('[redis:sub]', e?.message || e));

  await Promise.all([pub.connect(), sub.connect()]);

  await sub.subscribe(Channels.ai, (raw: string) => {
    try {
      LOCAL.emit(Channels.ai, JSON.parse(raw) as AiScoreUpdateEvent);
    } catch {}
  });

  await sub.subscribe(Channels.msrp, (raw: string) => {
    try {
      LOCAL.emit(Channels.msrp, JSON.parse(raw) as MSRPChangeEvent);
    } catch {}
  });

  useRedis = true;
  console.log('[events] Redis Pub/Sub active');
}

if (!(globalThis as any).__dai_bus_init) {
  (globalThis as any).__dai_bus_init = init();
}

export const bus = LOCAL;

export async function publish(channel: keyof typeof Channels, payload: any) {
  const topic = Channels[channel];
  
  // append to stream for replay (best-effort)
  try {
    await xappend(`$${topic}:stream`.replace('$$', '').replace('::', ':'), payload);
  } catch {}

  if (useRedis) {
    try {
      await pub.publish(topic, JSON.stringify(payload));
    } catch (e) {
      console.error('[publish] err', e);
      LOCAL.emit(topic, payload);
    }
  } else {
    LOCAL.emit(topic, payload);
  }
}
