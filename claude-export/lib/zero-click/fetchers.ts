/**
 * Zero-Click Data Fetchers
 * 
 * Stubs for GSC, GBP, and AI presence data
 * Replace with real API clients when credentials are available
 */

export type CohortRow = {
  impressions: number;
  clicks: number;
  device: string;
  cohort: string; // e.g., "brand_pos_1_3", "nonbrand_pos_4_10"
};

export type GbpRow = {
  views: number;
  calls: number;
  directions: number;
  messages: number;
  bookings: number;
};

/**
 * Fetch Google Search Console daily data
 * TODO: Connect to GSC Search Analytics API
 * 
 * Query by date; split by device & brand/nonbrand
 */
export async function fetchGscDaily(
  tenantId: string,
  dateISO: string
): Promise<CohortRow[]> {
  // TODO: Call GSC Search Analytics API
  // - Use Google Search Console API v1
  // - Filter by date: dateISO
  // - Group by: device, query type (brand/non-brand), position bucket
  // - Return array of CohortRow with impressions, clicks, device, cohort
  
  // Stub data for development
  return [
    {
      impressions: 10000,
      clicks: 1200,
      device: 'mobile',
      cohort: 'brand_pos_1_3'
    },
    {
      impressions: 5000,
      clicks: 300,
      device: 'desktop',
      cohort: 'brand_pos_1_3'
    },
    {
      impressions: 8000,
      clicks: 400,
      device: 'mobile',
      cohort: 'nonbrand_pos_4_10'
    }
  ];
}

/**
 * Fetch Google Business Profile daily data
 * TODO: Connect to GBP Business Performance API
 */
export async function fetchGbpDaily(
  tenantId: string,
  dateISO: string
): Promise<GbpRow> {
  // TODO: Call GBP Business Performance API
  // - Use Google My Business API (Business Profile Performance API)
  // - Fetch metrics for dateISO
  // - Return: views, calls, directions, messages, bookings
  
  // Stub data for development
  return {
    views: 6000,
    calls: 120,
    directions: 90,
    messages: 25,
    bookings: 10
  };
}

/**
 * Fetch AI presence rate from dAI probes
 * Compute from AiStratumScore or AiAnswerObservation windows
 * 
 * Presence proxy = avg(presenceRate across strata) weighted by engine reliability
 */
export async function fetchAIPresenceRate(
  tenantId: string,
  from: Date,
  to: Date
): Promise<number> {
  // TODO: Query AiAnswerObservation or AiStratumScore tables
  // - Filter by tenantId, date range [from, to]
  // - Compute weighted average of presence rates
  // - Weight by engine reliability (ChatGPT=1.0, Claude=0.95, etc.)
  
  // Stub: return 0.62 (62% of queries had AI answers present)
  return 0.62;
}

/**
 * Choose baseline CTR from multiple cohort baselines
 * Simple blend across device/cohort for MVP
 */
export function chooseBaselineCtr(baselines: Record<string, number>): number {
  const vals = Object.values(baselines);
  
  if (!vals.length) {
    return 0.06; // Safe default: 6% CTR
  }
  
  // Simple average across all cohorts
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
