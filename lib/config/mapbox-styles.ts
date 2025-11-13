/**
 * Mapbox Style Configuration
 * Centralized configuration for all Mapbox styles used in the application
 */

export const MAPBOX_STYLES = {
  /**
   * Tenet Inversion - Dramatic cinematic dark mode
   * Deep blacks, vibrant cyan→purple water, glowing pink→cyan roads
   * Bearing: 180° (inverted perspective for landing impact)
   * Use for: Landing page night mode, hero sections, Pulse dashboard
   */
  dark: 'mapbox://styles/briankramer/cmhxierfu007h01s1do9wgsri',

  /**
   * Inception Daydream - Cinematic light mode
   * Soft whites, pale teals, warm golds, quiet labels
   * Use for: Landing page day mode, insights pages, detail analysis
   */
  light: 'mapbox://styles/briankramer/cmhxie6qr009n01sa6jz81fur',

  /**
   * Landing page specific style (can override dark)
   */
  landing: 'mapbox://styles/briankramer/cmhxjbtcr004n01rzbis28jdy',
} as const;

export type MapboxStyleKey = keyof typeof MAPBOX_STYLES;

/**
 * Get Mapbox style URL by key with environment variable fallback
 */
export function getMapStyle(key: MapboxStyleKey): string {
  // Check for environment variable override
  const envKey = `NEXT_PUBLIC_MAPBOX_${key.toUpperCase()}_STYLE`;
  const envValue = process.env[envKey];

  if (envValue) {
    return envValue;
  }

  return MAPBOX_STYLES[key];
}

/**
 * Get Mapbox access token from environment
 */
export function getMapboxToken(): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    console.warn('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set');
    return '';
  }

  return token;
}