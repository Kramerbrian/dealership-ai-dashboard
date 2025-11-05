/**
 * Event Bus Configuration
 * Namespacing and channel definitions for Redis Pub/Sub
 */

export const NS = process.env.EVENT_NS ?? "dai";

export const Channels = {
  ai: `${NS}:ai-scores:update`,
  msrp: `${NS}:msrp:change`,
} as const;

export type ChannelKey = keyof typeof Channels;
