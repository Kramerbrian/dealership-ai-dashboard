import { EventEmitter } from "events";

class Bus extends EventEmitter {}

// Singleton across the server runtime
export const bus = (globalThis as any).__dai_bus ?? new Bus();
if (!(globalThis as any).__dai_bus) {
  (globalThis as any).__dai_bus = bus;
}

// Convenience types
export type AiScoreUpdateEvent = {
  vin: string;
  dealerId?: string;
  reason: string;           // e.g. "MSRP_Update"
  avi: number;
  ati: number;
  cis: number;
  ts: string;               // ISO timestamp
};

export type MSRPChangeEvent = {
  vin: string;
  old?: number | null;
  new: number;
  deltaPct?: number | null;
  ts: string;
};

