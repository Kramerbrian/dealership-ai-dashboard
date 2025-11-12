'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';

/**
 * BrandColorContext
 * --------------------------------------------------
 * Provides deterministic brand colors throughout the app
 * based on dealership domain. Ensures visual consistency
 * across all components (overlays, pulses, accents).
 */

interface BrandColorContextType {
  hue: number;
  accent: string;
  accentSoft: string;
  accentDark: string;
  gradient: string;
}

const BrandColorContext = createContext<BrandColorContextType>({
  hue: 195,
  accent: 'hsl(195, 80%, 55%)',
  accentSoft: 'hsl(195, 80%, 70%)',
  accentDark: 'hsl(195, 80%, 40%)',
  gradient: 'linear-gradient(135deg, hsl(195, 80%, 55%), hsl(195, 80%, 40%))',
});

interface BrandColorProviderProps {
  dealer?: string;
  children: ReactNode;
}

export function BrandColorProvider({
  dealer,
  children,
}: BrandColorProviderProps) {
  const value = useMemo(() => {
    // Generate deterministic hue from dealer domain
    if (!dealer) {
      return {
        hue: 195,
        accent: 'hsl(195, 80%, 55%)',
        accentSoft: 'hsl(195, 80%, 70%)',
        accentDark: 'hsl(195, 80%, 40%)',
        gradient:
          'linear-gradient(135deg, hsl(195, 80%, 55%), hsl(195, 80%, 40%))',
      };
    }

    const str = dealer.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hash = [...str].reduce((a, c) => a + c.charCodeAt(0), 0);
    const hue = hash % 360;

    return {
      hue,
      accent: `hsl(${hue}, 80%, 55%)`,
      accentSoft: `hsl(${hue}, 80%, 70%)`,
      accentDark: `hsl(${hue}, 80%, 40%)`,
      gradient: `linear-gradient(135deg, hsl(${hue}, 80%, 55%), hsl(${hue}, 80%, 40%))`,
    };
  }, [dealer]);

  return (
    <BrandColorContext.Provider value={value}>
      {children}
    </BrandColorContext.Provider>
  );
}

export const useBrandColor = () => {
  const context = useContext(BrandColorContext);
  if (!context) {
    throw new Error('useBrandColor must be used within BrandColorProvider');
  }
  return context;
};

/**
 * Utility function to generate brand colors without context
 * Useful for server components or static generation
 */
export function generateBrandColors(dealer?: string): BrandColorContextType {
  if (!dealer) {
    return {
      hue: 195,
      accent: 'hsl(195, 80%, 55%)',
      accentSoft: 'hsl(195, 80%, 70%)',
      accentDark: 'hsl(195, 80%, 40%)',
      gradient:
        'linear-gradient(135deg, hsl(195, 80%, 55%), hsl(195, 80%, 40%))',
    };
  }

  const str = dealer.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hash = [...str].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;

  return {
    hue,
    accent: `hsl(${hue}, 80%, 55%)`,
    accentSoft: `hsl(${hue}, 80%, 70%)`,
    accentDark: `hsl(${hue}, 80%, 40%)`,
    gradient: `linear-gradient(135deg, hsl(${hue}, 80%, 55%), hsl(${hue}, 80%, 40%))`,
  };
}
