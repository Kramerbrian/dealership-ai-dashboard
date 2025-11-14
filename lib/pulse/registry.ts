/**
 * Pulse Registry
 * Defines tile definitions, role orders, and thresholds for the Pulse dashboard
 */

export const REGISTRY = {
  version: '1.0',
  roleOrders: {
    default: ['rar', 'oci', 'refund_delta', 'freshness', 'cache_hit', 'triangulation'],
    gm: ['rar', 'oci', 'refund_delta'],
    marketing: ['freshness', 'cache_hit', 'triangulation'],
    'digital-ops': ['cache_hit', 'freshness', 'triangulation', 'rar'],
  },
  tiles: {
    rar: {
      label: 'Revenue at Risk',
      units: 'usd',
      thresholds: { green: 10000, yellow: 50000 },
    },
    oci: {
      label: 'Opportunity Cost',
      units: 'usd',
      thresholds: { green: 5000, yellow: 20000 },
    },
    refund_delta: {
      label: 'Refund Δ',
      units: 'pp',
      thresholds: { green: 0.2, yellow: 0.5 },
    },
    freshness: {
      label: 'Freshness',
      units: 'days',
      thresholds: { green: 2, yellow: 5 },
    },
    cache_hit: {
      label: 'Cache Hit %',
      units: 'pct',
      thresholds: { green: 0.85, yellow: 0.70 },
    },
    triangulation: {
      label: 'Triangulation',
      units: 'score',
      thresholds: { green: 0.75, yellow: 0.60 },
    },
  },
};

