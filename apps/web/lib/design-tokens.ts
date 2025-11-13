/**
 * DealershipAI Design Tokens
 * Canonical design system based on brand book specifications
 * Extended with Cognitive Ops Platform enhancements
 */

export const designTokens = {
  colors: {
    base: {
      dark: '#0A0A0A',
      light: '#FAFAFA',
    },
    glass: {
      dark: 'rgba(255,255,255,0.05)',
      light: 'rgba(0,0,0,0.05)',
    },
    accent: {
      insight: '#0EA5E9', // Sky blue
      trust: '#22C55E', // Green
      risk: '#F59E0B', // Amber
      alert: '#EF4444', // Red
    },
    text: {
      primaryDark: '#FFFFFF',
      primaryLight: '#111111',
    },
    // Cognitive Ops Extensions
    cognitive: {
      // Core brand - Intelligence gradient
      primary: '#8B5CF6',      // Vivid purple (violet-500)
      secondary: '#3B82F6',    // Cobalt blue (blue-500)
      tertiary: '#06B6D4',     // Cyan (cyan-500)

      // Confidence levels
      highConfidence: '#10B981',   // Emerald green
      mediumConfidence: '#F59E0B', // Amber
      lowConfidence: '#EF4444',    // Red

      // Status indicators
      active: '#10B981',           // Green - running
      queued: '#F59E0B',           // Amber - waiting
      completed: '#06B6D4',        // Cyan - done
      failed: '#EF4444',           // Red - error

      // Atmosphere (for 3D core)
      nucleusCore: '#8B5CF6',
      nucleusGlow: '#A78BFA',
      nucleusPulse: '#C4B5FD',
    },
  },
  typography: {
    fontPrimary: 'SF Pro Display, -apple-system, Inter, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    tracking: {
      tight: -0.02,
    },
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  blur: {
    glass: 24,
  },
  shadow: {
    elevated: '0 8px 24px rgba(0,0,0,0.15)',
  },
  motion: {
    curve: 'cubic-bezier(0.4,0,0.2,1)',
    duration: {
      fast: 150,
      default: 240,
      slow: 360,
    },
  },
} as const;

/**
 * Tailwind-compatible color palette
 */
export const tailwindColors = {
  'base-dark': designTokens.colors.base.dark,
  'base-light': designTokens.colors.base.light,
  'glass-dark': designTokens.colors.glass.dark,
  'glass-light': designTokens.colors.glass.light,
  'accent-insight': designTokens.colors.accent.insight,
  'accent-trust': designTokens.colors.accent.trust,
  'accent-risk': designTokens.colors.accent.risk,
  'accent-alert': designTokens.colors.accent.alert,
  'text-primary-dark': designTokens.colors.text.primaryDark,
  'text-primary-light': designTokens.colors.text.primaryLight,
};

/**
 * CSS Custom Properties generator
 */
export function generateCSSVariables(mode: 'light' | 'dark' = 'dark') {
  const isDark = mode === 'dark';
  return {
    '--color-base': isDark ? designTokens.colors.base.dark : designTokens.colors.base.light,
    '--color-glass': isDark ? designTokens.colors.glass.dark : designTokens.colors.glass.light,
    '--color-text-primary': isDark
      ? designTokens.colors.text.primaryDark
      : designTokens.colors.text.primaryLight,
    '--color-accent-insight': designTokens.colors.accent.insight,
    '--color-accent-trust': designTokens.colors.accent.trust,
    '--color-accent-risk': designTokens.colors.accent.risk,
    '--color-accent-alert': designTokens.colors.accent.alert,
    '--font-primary': designTokens.typography.fontPrimary,
    '--radius-sm': `${designTokens.radii.sm}px`,
    '--radius-md': `${designTokens.radii.md}px`,
    '--radius-lg': `${designTokens.radii.lg}px`,
    '--radius-xl': `${designTokens.radii.xl}px`,
    '--blur-glass': `${designTokens.blur.glass}px`,
    '--shadow-elevated': designTokens.shadow.elevated,
    '--motion-curve': designTokens.motion.curve,
    '--motion-fast': `${designTokens.motion.duration.fast}ms`,
    '--motion-default': `${designTokens.motion.duration.default}ms`,
    '--motion-slow': `${designTokens.motion.duration.slow}ms`,
  };
}

/**
 * Get confidence color based on score (0-1)
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.85) return designTokens.colors.cognitive.highConfidence;
  if (confidence >= 0.65) return designTokens.colors.cognitive.mediumConfidence;
  return designTokens.colors.cognitive.lowConfidence;
}

/**
 * Get mission status color
 */
export function getMissionStatusColor(status: 'active' | 'queued' | 'completed' | 'failed'): string {
  return designTokens.colors.cognitive[status];
}

/**
 * Hex to RGBA helper
 */
export function withOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Legacy export alias for TOKENS
 * @deprecated Use designTokens instead
 */
export const TOKENS = {
  color: {
    surface: {
      panel: designTokens.colors.base.dark,
      border: designTokens.colors.glass.light,
    },
    text: {
      primary: designTokens.colors.text.primaryDark,
      secondary: designTokens.colors.text.primaryLight,
    },
    accent: designTokens.colors.accent,
    cognitive: designTokens.colors.cognitive,
  },
  shadow: {
    soft: designTokens.shadow.elevated,
  },
  radius: designTokens.radii,
  motion: designTokens.motion,
} as const;

