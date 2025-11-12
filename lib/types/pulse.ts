/**
 * Pulse Taxonomy v2 - Decision Inbox Types
 * Upgraded from ticker to actionable decision inbox
 */

export type PulseLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type PulseKind =
  | 'kpi_delta'
  | 'incident_opened'
  | 'incident_resolved'
  | 'market_signal'
  | 'auto_fix'
  | 'sla_breach'
  | 'system_health';

export type PulseThreadRef = {
  type: 'incident' | 'kpi' | 'market';
  id: string;
};

export interface PulseCard {
  id: string;
  ts: string;
  level: PulseLevel;
  kind: PulseKind;
  title: string;
  detail?: string;
  delta?: number | string; // +8 AIV, -12ms, etc.
  thread?: PulseThreadRef; // link to incident/kpi
  actions?: Array<'open' | 'fix' | 'assign' | 'snooze' | 'mute'>;
  dedupe_key?: string; // prevent duplicates within window
  ttl_sec?: number; // auto-expire low noise
  context?: {
    kpi?: string;
    segment?: string;
    source?: string;
  };
  receipts?: Array<{
    label: string;
    kpi?: string;
    before?: number;
    after?: number;
  }>;
}

export interface PulseThread {
  id: string;
  ref: PulseThreadRef;
  events: PulseCard[];
  createdAt: string;
  updatedAt: string;
}

export type PulseFilter =
  | 'all'
  | 'critical'
  | 'kpi_delta'
  | 'incident'
  | 'market_signal'
  | 'system_health';

export interface PulseMetrics {
  volumeByKind: Record<PulseKind, number>;
  meanTimeToAction: number; // ms
  autoPromotedToIncident: number;
  muteRateByKey: Record<string, number>;
}

