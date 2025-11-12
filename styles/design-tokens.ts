/**
 * Design Tokens for DealershipAI
 * Centralized design system values for consistent styling
 */

export const TOKENS = {
  color: {
    surface: {
      panel: 'rgba(15, 23, 42, 0.72)',
      border: 'rgba(71, 85, 105, 0.25)',
      hover: 'rgba(30, 41, 59, 0.8)',
    },
    text: {
      primary: 'rgb(248, 250, 252)',
      secondary: 'rgb(148, 163, 184)',
      muted: 'rgb(100, 116, 139)',
    },
    accent: {
      blue: 'rgb(59, 130, 246)',
      purple: 'rgb(168, 85, 247)',
      cyan: 'rgb(34, 211, 238)',
      emerald: 'rgb(16, 185, 129)',
    },
  },
  shadow: {
    soft: '0 4px 20px rgba(0, 0, 0, 0.12)',
    glow: '0 0 24px rgba(59, 130, 246, 0.15)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", Consolas, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
};
