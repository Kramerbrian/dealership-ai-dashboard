/**
 * useBrandHue Hook
 * Provides brand tint (hue value) for consistent theming
 * Default: 195 (cyan-ish blue)
 */

import { useState, useEffect } from 'react';

export function useBrandHue(defaultHue: number = 195): number {
  const [hue, setHue] = useState(defaultHue);

  useEffect(() => {
    // Check localStorage for custom hue
    const savedHue = localStorage.getItem('brand_hue');
    if (savedHue) {
      setHue(parseInt(savedHue, 10));
    }
  }, []);

  return hue;
}
