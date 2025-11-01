/**
 * DealershipAI Design Tokens
 * Canonical design system based on brand book specifications
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

