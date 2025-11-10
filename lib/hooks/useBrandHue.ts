/**
 * useBrandHue - Deterministic brand color personalization
 * 
 * Extracts dealer domain and generates a consistent HSL hue (0-360)
 * for personalization across the cinematic interface.
 */

export function useBrandHue(domain?: string | null): number {
  if (!domain) return 200; // Default blue

  // Extract clean domain (remove protocol, www, etc.)
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();

  // Simple hash function for deterministic hue
  let hash = 0;
  for (let i = 0; i < cleanDomain.length; i++) {
    hash = cleanDomain.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Map to 0-360 hue range
  const hue = Math.abs(hash) % 360;

  return hue;
}

/**
 * Get HSL color string from hue
 */
export function getBrandHSL(hue: number, saturation = 70, lightness = 50): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get CSS custom property for brand color
 */
export function getBrandCSSVar(hue: number): string {
  return `--brand-hue: ${hue};`;
}

