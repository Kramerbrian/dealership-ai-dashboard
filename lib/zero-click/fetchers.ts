/**
 * Zero-Click Data Fetchers
 * TODO: Replace with real API clients (GSC, GBP, GA4)
 */

export type CohortRow = { 
  impressions: number; 
  clicks: number; 
  device: string; 
  cohort: string 
};

export type GbpRow = { 
  views: number; 
  calls: number; 
  directions: number; 
  messages: number; 
  bookings: number 
};

export async function fetchGscDaily(tenantId: string, dateISO: string): Promise<CohortRow[]> {
  // TODO: call GSC Search Analytics API (query by date; split by device & brand/nonbrand).
  return [
    { impressions: 10000, clicks: 1200, device: 'mobile', cohort: 'brand_pos_1_3' }
  ];
}

export async function fetchGbpDaily(tenantId: string, dateISO: string): Promise<GbpRow> {
  // TODO: call GBP Business Performance API.
  return { 
    views: 6000, 
    calls: 120, 
    directions: 90, 
    messages: 25, 
    bookings: 10 
  };
}

export async function fetchAIPresenceRate(tenantId: string, from: Date, to: Date): Promise<number> {
  // Compute from AiStratumScore or AiAnswerObservation windows.
  // Presence proxy = avg(presenceRate across strata) weighted by engine reliability.
  return 0.62;
}

export function chooseBaselineCtr(baselines: Record<string, number>): number {
  // Simple blend across device/cohort for MVP
  const vals = Object.values(baselines);
  if (!vals.length) return 0.06; // safe default
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

