/**
 * Design Tokens - Voice Orb Compatible Export
 * Re-exports from lib/design-tokens.ts in TOKENS format for compatibility
 */

import { designTokens, withOpacity } from '@/lib/design-tokens';

export const TOKENS = {
  color: {
    surface: {
      panel: 'rgba(18, 18, 18, 0.6)',
      border: 'rgba(255, 255, 255, 0.1)',
      glass: designTokens.colors.glass.dark,
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.6)',
      muted: 'rgba(255, 255, 255, 0.4)',
    },
    accent: {
      insight: designTokens.colors.accent.insight,
      trust: designTokens.colors.accent.trust,
      risk: designTokens.colors.accent.risk,
      alert: designTokens.colors.accent.alert,
      emerald: designTokens.colors.accent.trust, // Same as trust (#22C55E)
      clarityBlue: designTokens.colors.cognitive.secondary, // #3B82F6
      clarityCyan: designTokens.colors.cognitive.tertiary, // #06B6D4
    },
    cognitive: {
      blue: designTokens.colors.cognitive.secondary, // #3B82F6
      cyan: designTokens.colors.cognitive.tertiary,   // #06B6D4
    },
  },
  shadow: {
    soft: '0 4px 16px rgba(0, 0, 0, 0.2)',
    elevated: designTokens.shadow.elevated,
  },
  motion: designTokens.motion,
  radii: designTokens.radii,
  blur: {
    glass: designTokens.blur.glass,
    backdrop: designTokens.blur.glass,
  },
} as const;

// Re-export utilities
export { withOpacity };
