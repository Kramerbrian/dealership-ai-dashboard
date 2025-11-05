/**
 * Event Schema Validation
 * Zod schemas for validating event payloads before publishing
 */

import { z } from "zod";

export const AiScoreUpdateEventSchema = z.object({
  vin: z.string().min(3).max(32),
  dealerId: z.string().optional(),
  reason: z.string().min(1),
  avi: z.number().int().min(0).max(100),
  ati: z.number().int().min(0).max(100),
  cis: z.number().int().min(0).max(100),
  ts: z.string().datetime(),
});

export const MSRPChangeEventSchema = z.object({
  vin: z.string().min(3).max(32),
  old: z.number().int().nullable().optional(),
  new: z.number().int().min(0),
  deltaPct: z.number().nullable().optional(),
  ts: z.string().datetime(),
});

export type AiScoreUpdateEvent = z.infer<typeof AiScoreUpdateEventSchema>;
export type MSRPChangeEvent = z.infer<typeof MSRPChangeEventSchema>;

