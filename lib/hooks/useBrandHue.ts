'use client';

import { useMemo } from 'react';

/**
 * useBrandHue
 * --------------------------------------------------
 * Derives a deterministic HSL hue from dealer domain.
 * Fallback: cyan (195°)
 */
export function useBrandHue(dealer?: string | null): number {
  return useMemo(() => {
    if (!dealer) return 195; // Default cyan

    // Extract clean domain (remove protocol, www, etc.)
    const cleanDomain = dealer
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    // Simple hash function for deterministic hue
    const hash = [...cleanDomain].reduce((a, c) => a + c.charCodeAt(0), 0);

    return hash % 360;
  }, [dealer]);
}

/**
 * useBrandPalette
 * --------------------------------------------------
 * Return a few convenience colors for styling
 */
export function useBrandPalette(dealer?: string | null) {
  const hue = useBrandHue(dealer);
  return useMemo(
    () => ({
      hue,
      accent: `hsl(${hue},80%,55%)`,
      accentSoft: `hsl(${hue},80%,70%)`,
      accentBg: `hsl(${hue},70%,10%)`,
    }),
    [hue]
  );
}

/**
 * Get HSL color string from hue (legacy helper, use useBrandPalette instead)
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

