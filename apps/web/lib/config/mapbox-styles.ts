/**
 * Mapbox Style Configuration
 * Manages dark and light mode cinematic map styles
 */

export const MAPBOX_STYLES = {
  /**
   * Tenet Inversion - Dramatic cinematic dark mode
   * Deep blacks, vibrant cyan→purple water, glowing pink→cyan roads
   * Bearing: 180° (inverted perspective for landing impact)
   * Use for: Landing page, hero sections, Pulse dashboard
   */
  dark: 'mapbox://styles/briankramer/cmhxierfu007h01s1do9wgsri',

  /**
   * Inception Daydream - Cinematic light mode
   * Soft whites, pale teals, warm golds, quiet labels
   * Use for: Insights pages, inspection views, detail analysis
   */
  light: 'mapbox://styles/briankramer/cmhxie6qr009n01sa6jz81fur',
} as const;

export type MapTheme = keyof typeof MAPBOX_STYLES;

/**
 * Get map style URL based on theme preference
 */
export function getMapStyle(theme: MapTheme = 'dark'): string {
  return MAPBOX_STYLES[theme];
}

/**
 * Determine if we should use light mode based on route
 */
export function shouldUseLightMode(pathname: string): boolean {
  // Use light mode for insights, analysis, and detail pages
  const lightModeRoutes = [
    '/dash/insights',
    '/dash/autopilot',
    '/dash/competitive',
  ];

  return lightModeRoutes.some(route => pathname.includes(route));
}

/**
 * Get theme based on time of day (cinematic auto-switching)
 */
export function getThemeByTimeOfDay(): MapTheme {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? 'light' : 'dark';
}
