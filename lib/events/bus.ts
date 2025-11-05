/**
 * Event Bus with Redis Pub/Sub support
 * Falls back to in-memory EventEmitter if REDIS_URL is unset
 */

import { EventEmitter } from "events";

type Json = Record<string, unknown> | unknown[];

export type AiScoreUpdateEvent = {
  vin: string;
  dealerId?: string;
  reason: string;
  avi: number;
  ati: number;
  cis: number;
  ts: string;
};

export type MSRPChangeEvent = {
  vin: string;
  old?: number | null;
  new: number;
  deltaPct?: number | null;
  ts: string;
};

const LOCAL = new EventEmitter();
const CHANNELS = {
  ai: "ai-scores:update",
  msrp: "msrp:change",
} as const;

let useRedis = false;
let pub: any = null;
let sub: any = null;

async function initRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.log("[events] REDIS_URL not set, using local EventEmitter fallback");
    return;
  }

  try {
    // Defer import to avoid bundling if unused
    const { createClient } = await import("redis");

    pub = createClient({ url });
    sub = createClient({ url });

    pub.on("error", (e: any) => console.error("[redis:pub] error", e?.message || e));
    sub.on("error", (e: any) => console.error("[redis:sub] error", e?.message || e));

    // Retry connection logic
    let tries = 0;
    async function safeConnect(fn: () => Promise<void>) {
      try {
        await fn();
      } catch (e) {
        tries++;
        const delay = Math.min(30000, 500 * 2 ** tries);
        console.error(`[redis] connect failed (attempt ${tries}), retrying in ${delay}ms`, e);
        setTimeout(() => safeConnect(fn), delay);
      }
    }

    await safeConnect(async () => {
      await Promise.all([pub.connect(), sub.connect()]);

      // Subscribe to channels with message handler
      sub.on('message', (channel: string, raw: string) => {
        try {
          if (channel === CHANNELS.ai) {
            LOCAL.emit(CHANNELS.ai, JSON.parse(raw) as AiScoreUpdateEvent);
          } else if (channel === CHANNELS.msrp) {
            LOCAL.emit(CHANNELS.msrp, JSON.parse(raw) as MSRPChangeEvent);
          }
        } catch (e) {
          console.error(`[redis:sub] Failed to parse event from ${channel}`, e);
        }
      });

      await sub.subscribe(CHANNELS.ai);
      await sub.subscribe(CHANNELS.msrp);

      useRedis = true;
      console.log("[events] Redis Pub/Sub initialized successfully");
    });
  } catch (error) {
    console.error("[events] Failed to initialize Redis, falling back to local EventEmitter", error);
    useRedis = false;
  }
}

// Initialize on module load (only once)
if (!(globalThis as any).__dai_bus_init) {
  (globalThis as any).__dai_bus_init = initRedis();
}

// Public API
export const bus = LOCAL;

export async function publish(channel: keyof typeof CHANNELS, payload: Json) {
  if (useRedis && pub) {
    try {
      await pub.publish(CHANNELS[channel], JSON.stringify(payload));
    } catch (e) {
      console.error(`[events] Failed to publish to ${channel}, falling back to local emit`, e);
      // Fallback to local emit on error
      LOCAL.emit(CHANNELS[channel], payload);
    }
  } else {
    // Local fallback in single-instance mode
    LOCAL.emit(CHANNELS[channel], payload);
  }
}

export const Channels = CHANNELS;

