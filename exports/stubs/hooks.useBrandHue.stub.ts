/**
 * useBrandHue Hook
 * Provides brand tint continuity across the theatrical PLG experience
 * PG-safe hue values (200-280 range for professional blue-cyan spectrum)
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BrandHueContextType {
  brandHue: number;
  setBrandHue: (hue: number) => void;
}

const BrandHueContext = createContext<BrandHueContextType | undefined>(undefined);

const DEFAULT_HUE = 240; // Professional blue
const MIN_HUE = 200; // Cyan-blue
const MAX_HUE = 280; // Purple-blue

export function BrandHueProvider({ children }: { children: ReactNode }) {
  const [brandHue, setBrandHue] = useState<number>(DEFAULT_HUE);

  // Load saved hue from localStorage or use default
  useEffect(() => {
    const saved = localStorage.getItem('dealershipai-brand-hue');
    if (saved) {
      const hue = parseInt(saved, 10);
      if (hue >= MIN_HUE && hue <= MAX_HUE) {
        setBrandHue(hue);
      }
    }
  }, []);

  // Save hue changes to localStorage
  const handleSetBrandHue = (hue: number) => {
    const clampedHue = Math.max(MIN_HUE, Math.min(MAX_HUE, hue));
    setBrandHue(clampedHue);
    localStorage.setItem('dealershipai-brand-hue', clampedHue.toString());
  };

  return (
    <BrandHueContext.Provider value={{ brandHue, setBrandHue: handleSetBrandHue }}>
      {children}
    </BrandHueContext.Provider>
  );
}

export function useBrandHue(): number {
  const context = useContext(BrandHueContext);
  if (context === undefined) {
    // Fallback to default if used outside provider
    return DEFAULT_HUE;
  }
  return context.brandHue;
}

