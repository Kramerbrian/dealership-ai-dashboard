import { analyzeSGPIntegrity } from './scoring/sgp-integrity';
import { analyzeZeroClick } from './scoring/zero-click';
import { analyzeGeoTrust } from './scoring/geo-trust';
import { analyzeUGCHealth } from './scoring/ugc-health';
import { analyzeAIVisibility } from './scoring/ai-visibility';
import { getCached, setCache } from './utils/cache';

export interface DealershipScores {
  ai_visibility: number;
  zero_click: number;
  ugc_health: number;
  geo_trust: number;
  sgp_integrity: number;
  overall: number;
  timestamp: string;
}

export interface DetailedDealershipScores extends DealershipScores {
  details: {
    sgp: any;
    zeroClick: any;
    geo: any;
    ugc: any;
    ai: any;
  };
}

export async function getDealershipScores(
  domain: string
): Promise<DealershipScores> {
  console.log(`Analyzing ${domain}...`);

  // Check cache first
  const cacheKey = `dai:scores:${domain}`;
  const cached = await getCached<DealershipScores>(cacheKey);
  
  if (cached) {
    console.log('✅ Returning cached scores');
    return cached;
  }

  console.log('🔍 Computing fresh scores...');

  // Run all scoring modules in parallel (except AI - save for last)
  const [sgp, zeroClick, geo, ugc] = await Promise.all([
    analyzeSGPIntegrity(domain),
    analyzeZeroClick(domain),
    analyzeGeoTrust(domain),
    analyzeUGCHealth(domain),
  ]);

  console.log('Free checks complete, running AI visibility...');

  // Run AI visibility last (most expensive)
  const aiVisibility = await analyzeAIVisibility(domain);

  // Calculate weighted overall score
  const overall = Math.round(
    aiVisibility * 0.35 +  // 35% weight
    zeroClick * 0.20 +     // 20% weight
    ugc * 0.20 +           // 20% weight
    geo * 0.15 +           // 15% weight
    sgp * 0.10             // 10% weight
  );

  const scores: DealershipScores = {
    ai_visibility: Math.round(aiVisibility),
    zero_click: Math.round(zeroClick),
    ugc_health: Math.round(ugc),
    geo_trust: Math.round(geo),
    sgp_integrity: Math.round(sgp),
    overall,
    timestamp: new Date().toISOString(),
  };

  // Cache for 24 hours
  await setCache(cacheKey, scores, 86400);

  return scores;
}

export async function getDetailedDealershipScores(
  domain: string
): Promise<DetailedDealershipScores> {
  console.log(`Analyzing ${domain} with detailed results...`);

  // Check cache first
  const cacheKey = `dai:detailed:${domain}`;
  const cached = await getCached<DetailedDealershipScores>(cacheKey);
  
  if (cached) {
    console.log('✅ Returning cached detailed scores');
    return cached;
  }

  console.log('🔍 Computing fresh detailed scores...');

  // Import detailed analysis functions
  const { analyzeSGPIntegrityDetailed } = await import('./scoring/sgp-integrity');
  const { analyzeZeroClickDetailed } = await import('./scoring/zero-click');
  const { analyzeGeoTrustDetailed } = await import('./scoring/geo-trust');
  const { analyzeUGCHealthDetailed } = await import('./scoring/ugc-health');
  const { analyzeAIVisibilityDetailed } = await import('./scoring/ai-visibility');

  // Run all detailed scoring modules in parallel (except AI - save for last)
  const [sgpDetails, zeroClickDetails, geoDetails, ugcDetails] = await Promise.all([
    analyzeSGPIntegrityDetailed(domain),
    analyzeZeroClickDetailed(domain),
    analyzeGeoTrustDetailed(domain),
    analyzeUGCHealthDetailed(domain),
  ]);

  console.log('Free detailed checks complete, running AI visibility...');

  // Run AI visibility last (most expensive)
  const aiDetails = await analyzeAIVisibilityDetailed(domain);

  // Calculate weighted overall score
  const overall = Math.round(
    aiDetails.score * 0.35 +  // 35% weight
    zeroClickDetails.score * 0.20 +     // 20% weight
    ugcDetails.score * 0.20 +           // 20% weight
    geoDetails.score * 0.15 +           // 15% weight
    sgpDetails.score * 0.10             // 10% weight
  );

  const detailedScores: DetailedDealershipScores = {
    ai_visibility: Math.round(aiDetails.score),
    zero_click: Math.round(zeroClickDetails.score),
    ugc_health: Math.round(ugcDetails.score),
    geo_trust: Math.round(geoDetails.score),
    sgp_integrity: Math.round(sgpDetails.score),
    overall,
    timestamp: new Date().toISOString(),
    details: {
      sgp: sgpDetails,
      zeroClick: zeroClickDetails,
      geo: geoDetails,
      ugc: ugcDetails,
      ai: aiDetails,
    },
  };

  // Cache for 24 hours
  await setCache(cacheKey, detailedScores, 86400);

  return detailedScores;
}

// Cost optimization version with pooling
export async function getDealershipScoresOptimized(
  domain: string
): Promise<DealershipScores> {
  // Check if we have cached result
  const cacheKey = `dai:scores:${domain}`;
  const cached = await getCached<DealershipScores>(cacheKey);
  if (cached) return cached;

  // Check if we're over budget today
  const todayQueries = await getTodayQueryCount();
  if (todayQueries >= MAX_DAILY_QUERIES) {
    // Use pooled result instead
    const pooled = await getPooledAIScore(domain);
    if (pooled) return pooled;
    
    // Fall back to estimate
    return estimateAIVisibility(domain);
  }

  // OK to query - increment counter
  await incrementQueryCount();
  
  // Perform real query
  return getDealershipScores(domain);
}

// Rate limiting constants
const MAX_DAILY_QUERIES = 50;

async function getTodayQueryCount(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const key = `dai:ai-queries:${today}`;
  const cached = await getCached<number>(key);
  return cached || 0;
}

async function incrementQueryCount(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const key = `dai:ai-queries:${today}`;
  const current = await getTodayQueryCount();
  await setCache(key, current + 1, 86400); // 24h expiry
}

async function getPooledAIScore(domain: string): Promise<DealershipScores | null> {
  // In production, this would check a database of pooled results
  // For now, return null to force estimation
  return null;
}

async function estimateAIVisibility(domain: string): Promise<DealershipScores> {
  // Use free signals to estimate AI visibility
  const [zeroClick, ugc, geo, sgp] = await Promise.all([
    analyzeZeroClick(domain),
    analyzeUGCHealth(domain),
    analyzeGeoTrust(domain),
    analyzeSGPIntegrity(domain),
  ]);

  // Correlation formula (based on testing)
  const estimatedAI = Math.round(
    zeroClick * 0.35 +
    ugc * 0.40 +
    geo * 0.25
  );

  const overall = Math.round(
    estimatedAI * 0.35 +  // 35% weight
    zeroClick * 0.20 +     // 20% weight
    ugc * 0.20 +           // 20% weight
    geo * 0.15 +           // 15% weight
    sgp * 0.10             // 10% weight
  );

  return {
    ai_visibility: estimatedAI,
    zero_click: Math.round(zeroClick),
    ugc_health: Math.round(ugc),
    geo_trust: Math.round(geo),
    sgp_integrity: Math.round(sgp),
    overall,
    timestamp: new Date().toISOString(),
  };
}
