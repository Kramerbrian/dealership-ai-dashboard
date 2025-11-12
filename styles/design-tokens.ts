/**
 * Design Tokens for DealershipAI • Inevitability Spec
 * Centralized design system imported from inevitability_spec.json
 * Dual-mode: Works in Figma (via JSON) and Next.js (via TypeScript)
 */

import spec from '@/exports/inevitability_spec.json';

export const TOKENS = {
  color: {
    surface: {
      graphite: (spec as any).color.surface.graphite.value,
      panel:    (spec as any).color.surface.panel.value,
      border:   (spec as any).color.surface.border.value,
      glass:    (spec as any).color.surface.glass.value,
    },
    accent: {
      clarityBlue: (spec as any).color.accent.clarityBlue.value,
      clarityCyan: (spec as any).color.accent.clarityCyan.value,
      emerald:     (spec as any).color.accent.emerald.value,
      amber:       (spec as any).color.accent.amber.value,
      critical:    (spec as any).color.accent.critical.value,
    },
    text: {
      primary:   (spec as any).color.text.primary.value,
      secondary: (spec as any).color.text.secondary.value,
      muted:     (spec as any).color.text.muted.value,
    }
  },
  radius: {
    xl:  (spec as any).radius.xl.value,
    '2xl':(spec as any).radius['2xl'].value,
  },
  shadow: {
    soft:    (spec as any).shadow.soft.value,
    glowBlue:(spec as any).shadow.glowBlue.value,
  },
  blur: { backdrop: (spec as any).blur.backdrop.value },
  space: {
    xs:(spec as any).space.xs.value, sm:(spec as any).space.sm.value,
    md:(spec as any).space.md.value, lg:(spec as any).space.lg.value,
    xl:(spec as any).space.xl.value
  },
  font: {
    family: {
      sans:(spec as any).font.family.sans.value,
      mono:(spec as any).font.family.mono.value
    },
    size: {
      xs:(spec as any).font.size.xs.value, sm:(spec as any).font.size.sm.value,
      base:(spec as any).font.size.base.value, lg:(spec as any).font.size.lg.value,
      xl:(spec as any).font.size.xl.value, '2xl':(spec as any).font.size['2xl'].value,
      '3xl':(spec as any).font.size['3xl'].value
    }
  },
  motion: {
    timing: {
      fast:(spec as any).motion.timing.fast.value,
      base:(spec as any).motion.timing.base.value,
      slow:(spec as any).motion.timing.slow.value
    },
    easing: {
      cupertino:(spec as any).motion.easing.cupertino.value,
      springy:(spec as any).motion.easing.springy.value
    }
  },
  persona: (spec as any).persona,
  kpi: (spec as any).kpi,
  meta: (spec as any).meta
} as const;
