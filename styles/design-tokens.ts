/**
 * Design tokens for dealershipAI
 * Exports TOKENS object for use in components
 */

import tokens from './design-tokens.json';

export const TOKENS = {
  color: {
    bg: tokens.color.bg,
    surface: {
      panel: tokens.color.surface,
      border: tokens.color.gridLine
    },
    card: tokens.color.card,
    accent: tokens.color.accent,
    accentAlt: tokens.color.accentAlt,
    warn: tokens.color.warn,
    danger: tokens.color.danger,
    success: tokens.color.success,
    text: {
      primary: tokens.color.text,
      secondary: tokens.color.muted
    },
    muted: tokens.color.muted,
    gridLine: tokens.color.gridLine
  },
  radius: tokens.radius,
  shadow: tokens.shadow,
  space: tokens.space,
  motion: tokens.motion,
  typography: tokens.typography
} as const;

