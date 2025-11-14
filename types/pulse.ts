/**
 * Pulse Card Schema
 * 
 * Standard shape for Pulse dashboard cards that translate
 * clarity/stack data into actionable insights for dealers.
 */

export type PulseCard = {
  key: string;                     // unique ID, e.g. "avi", "schema_health"
  title: string;                   // short label for the card
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;                 // 1–2 sentence overview in plain English
  whyItMatters: string;            // one sentence: impact in the real world
  recommendedAction: string;       // one clear next step
  estimatedImpact?: string;        // e.g. "$20K/mo" or "+6–10 visibility points"
  category:
    | 'Visibility'
    | 'Schema'
    | 'GBP'
    | 'UGC'
    | 'Competitive'
    | 'Narrative';
};

