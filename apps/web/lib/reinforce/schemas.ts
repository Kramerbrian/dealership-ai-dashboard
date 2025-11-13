import { z } from 'zod';

export const Envelope = z.object({
  event_id: z.string(),
  event_type: z.string(),
  tenant_id: z.string(),
  sent_at: z.string(),
  signature: z.string(),
  idempotency_key: z.string().optional(),
  payload: z.any(),
});

export const PulseSignalPayload = z.object({
  level: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  title: z.string(),
  detail: z.string().optional(),
  kpi: z.string().optional(),
  delta: z.union([z.number(), z.string()]).optional(),
});

export type Envelope = z.infer<typeof Envelope>;
export type PulseSignalPayload = z.infer<typeof PulseSignalPayload>;

