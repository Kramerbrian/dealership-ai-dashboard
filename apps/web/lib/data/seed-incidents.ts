import type { Incident, PulseEvent } from '@/lib/types/cognitive';

/**
 * Seed incidents for demo/development
 * Priority = (impact_points * urgency_weight) / time_to_fix_min
 */
export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'schema-coverage-gap',
    urgency: 'critical',
    impact_points: 47, // High impact on AIV
    time_to_fix_min: 5,
    title: 'Schema Coverage Gap Detected',
    reason:
      'Vehicle detail pages missing Organization + Product schema, reducing AI visibility by ~12 pts',
    receipts: [
      {
        label: 'Missing Schema Types',
        kpi: 'schema_coverage',
        before: { coverage: 65 },
        after: { coverage: 88 },
      },
      {
        label: 'AIV Impact',
        kpi: 'aiv',
        before: { score: 42 },
        after: { score: 54 },
      },
    ],
    category: 'schema',
    autofix: true,
    fix_tiers: ['tier1_diy', 'tier2_guided'],
  },
  {
    id: 'pricing-mismatch-inventory',
    urgency: 'high',
    impact_points: 38,
    time_to_fix_min: 8,
    title: 'Pricing Data Mismatch on 12 Vehicles',
    reason:
      'Website shows different prices than inventory feed, causing trust score drops in ChatGPT citations',
    receipts: [
      {
        label: 'Vehicles Affected',
        kpi: 'data_integrity',
        before: { mismatches: 12 },
        after: { mismatches: 0 },
      },
    ],
    category: 'pricing',
    autofix: true,
    fix_tiers: ['tier1_diy', 'tier2_guided', 'tier3_dfy'],
  },
  {
    id: 'ugc-response-velocity',
    urgency: 'high',
    impact_points: 35,
    time_to_fix_min: 15,
    title: 'UGC Response Velocity Below Benchmark',
    reason:
      '4 reviews unanswered for 48+ hours, reducing trust score and GBP ranking signals',
    receipts: [
      {
        label: 'Pending Reviews',
        kpi: 'ugc_velocity',
        before: { pending: 4, avg_response_hrs: 52 },
        after: { pending: 0, avg_response_hrs: 6 },
      },
    ],
    category: 'ugc',
    autofix: false,
    fix_tiers: ['tier1_diy', 'tier3_dfy'],
  },
  {
    id: 'geo-hours-inconsistency',
    urgency: 'high',
    impact_points: 42,
    time_to_fix_min: 10,
    title: 'GEO Hours Inconsistency on Weekends',
    reason:
      'Saturday hours conflict between GBP and website; assistant responses drop 24% on weekends',
    receipts: [
      {
        label: 'Data Conflict',
        kpi: 'geo_integrity',
        before: { conflicts: 2 },
        after: { conflicts: 0 },
      },
      {
        label: 'AI Response Rate',
        kpi: 'ai_visibility',
        before: { sat_rate: 58 },
        after: { sat_rate: 82 },
      },
    ],
    category: 'geo',
    autofix: true,
    fix_tiers: ['tier1_diy', 'tier2_guided'],
  },
  {
    id: 'cwv-lcp-degraded',
    urgency: 'medium',
    impact_points: 28,
    time_to_fix_min: 30,
    title: 'Core Web Vitals: LCP Degraded',
    reason:
      'Largest Contentful Paint increased to 3.2s on mobile, impacting SEO and user experience',
    receipts: [
      {
        label: 'LCP Score',
        kpi: 'cwv_lcp',
        before: { mobile: 3.2 },
        after: { mobile: 2.1 },
      },
    ],
    category: 'cwv',
    autofix: true,
    fix_tiers: ['tier2_guided', 'tier3_dfy'],
  },
  {
    id: 'freshness-score-declining',
    urgency: 'medium',
    impact_points: 32,
    time_to_fix_min: 25,
    title: 'Content Freshness Score Declining',
    reason:
      'Last inventory update was 6 days ago; stale data signals reduce AIV by ~8 points',
    receipts: [
      {
        label: 'Last Update',
        kpi: 'freshness',
        before: { days_since: 6 },
        after: { days_since: 0 },
      },
    ],
    category: 'ops',
    autofix: true,
    fix_tiers: ['tier2_guided'],
  },
  {
    id: 'perplexity-citation-drop',
    urgency: 'medium',
    impact_points: 25,
    time_to_fix_min: 20,
    title: 'Perplexity Citation Velocity Down 18%',
    reason: 'Competitor citations rising while yours drop; check schema + UGC recency',
    receipts: [
      {
        label: 'Citation Trend',
        kpi: 'citation_velocity',
        before: { perplexity_citations_7d: 12 },
        after: { perplexity_citations_7d: 18 },
      },
    ],
    category: 'ai_visibility',
    autofix: false,
    fix_tiers: ['tier1_diy', 'tier3_dfy'],
  },
  {
    id: 'inventory-sync-lag',
    urgency: 'low',
    impact_points: 18,
    time_to_fix_min: 10,
    title: 'Inventory Sync Lag (4 hours)',
    reason: 'Feed updates delayed; new arrivals not indexed by AI platforms promptly',
    receipts: [
      {
        label: 'Sync Delay',
        kpi: 'ops',
        before: { lag_hrs: 4 },
        after: { lag_hrs: 0.5 },
      },
    ],
    category: 'ops',
    autofix: true,
    fix_tiers: ['tier2_guided'],
  },
];

/**
 * Seed pulse events for demo
 */
export const SEED_PULSE_EVENTS: PulseEvent[] = [
  {
    id: 'pulse-1',
    ts: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
    level: 'medium',
    title: 'Schema Coverage Improved',
    detail: 'Auto-fix deployed Organization + Product schema to 24 pages',
    kpi: 'schema_coverage',
    delta: '+12',
  },
  {
    id: 'pulse-2',
    ts: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
    level: 'high',
    title: 'Pricing Sync Complete',
    detail: 'All inventory prices now match website; trust score recovering',
    kpi: 'data_integrity',
    delta: '+8',
  },
  {
    id: 'pulse-3',
    ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
    level: 'critical',
    title: 'GEO Hours Conflict Detected',
    detail: 'Saturday hours mismatch causing AI response drop',
    kpi: 'geo_integrity',
    delta: '-24%',
  },
  {
    id: 'pulse-4',
    ts: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hrs ago
    level: 'low',
    title: 'Inventory Feed Updated',
    detail: '18 new vehicles added, 3 sold units removed',
    kpi: 'freshness',
  },
];

/**
 * Load seed data into store (for demo/development)
 */
export function loadSeedData() {
  if (typeof window === 'undefined') return;

  const store = require('@/lib/store/cognitive').useCognitiveStore.getState();

  // Only seed if incidents are empty (avoid duplicates)
  if (store.incidents.length === 0) {
    store.upsertIncidents(SEED_INCIDENTS);
  }

  // Only seed pulse if empty
  if (store.pulse.length === 0) {
    SEED_PULSE_EVENTS.forEach((ev) => store.addPulse(ev));
  }
}
