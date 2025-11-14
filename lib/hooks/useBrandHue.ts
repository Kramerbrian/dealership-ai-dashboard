'use client';

import { useMemo } from 'react';

/**
 * useBrandHue
 * --------------------------------------------------
 * Derives a deterministic HSL hue from dealer domain.
 * Fallback: cyan (195°)
 */
export function useBrandHue(dealer?: string): number {
  return useMemo(() => {
    if (!dealer) return 195;
    const str = dealer.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hash = [...str].reduce((a, c) => a + c.charCodeAt(0), 0);
    return hash % 360;
  }, [dealer]);
}

/** Return a few convenience colors for styling */
export function useBrandPalette(dealer?: string) {
  const hue = useBrandHue(dealer);
  return {
    hue,
    accent: `hsl(${hue},80%,55%)`,
    accentSoft: `hsl(${hue},80%,70%)`,
    accentBg: `hsl(${hue},70%,10%)`,
  };
}

/** Helper function to generate HSL color string */
export function getBrandHSL(hue: number, saturation: number, lightness: number): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
