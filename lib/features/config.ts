/**
 * Feature Flags & Remote Config
 * Toggle features without redeploying
 */

export interface FeatureConfig {
  geoPooling: boolean;
  liveActivityFeed: boolean;
  instantAnalyzer: boolean;
  advancedAnalyzer: boolean;
  stripeCheckout: boolean;
  telemetry: boolean;
  schemaValidation: boolean;
  freeScans: number;
  showDecayBanner: boolean;
}

export const DEFAULT_CONFIG: FeatureConfig = {
  geoPooling: true,
  liveActivityFeed: true,
  instantAnalyzer: true,
  advancedAnalyzer: false,
  stripeCheckout: true,
  telemetry: true,
  schemaValidation: true,
  freeScans: 3,
  showDecayBanner: true,
};

let cachedConfig: FeatureConfig | null = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get feature config (with caching)
 */
export async function getFeatureConfig(): Promise<FeatureConfig> {
  const now = Date.now();
  
  if (cachedConfig && now - lastFetch < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    // Try to fetch from remote config
    const response = await fetch(
      process.env.FEATURE_CONFIG_URL || '/api/features/config',
      { cache: 'no-store' }
    );
    
    if (response.ok) {
      cachedConfig = await response.json();
      lastFetch = now;
      return cachedConfig;
    }
  } catch (error) {
    // Fallback to default
  }

  cachedConfig = DEFAULT_CONFIG;
  lastFetch = now;
  return cachedConfig;
}

/**
 * Check if feature is enabled
 */
export async function isFeatureEnabled(feature: keyof FeatureConfig): Promise<boolean> {
  const config = await getFeatureConfig();
  return config[feature] === true;
}

/**
 * Get feature value
 */
export async function getFeatureValue<K extends keyof FeatureConfig>(
  feature: K
): Promise<FeatureConfig[K]> {
  const config = await getFeatureConfig();
  return config[feature];
}

