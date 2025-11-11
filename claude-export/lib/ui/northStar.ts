/**
 * DealershipAI North Star Design Tokens
 * 
 * Centralized design system tokens for consistent UI/UX
 * Reference: docs/north_star.md
 */

export const northStar = {
  motion: {
    fade: {
      duration: 400, // ms
      easing: 'ease-out',
      className: 'animate-fade-in',
    },
    morph: {
      duration: 300, // ms
      easing: 'ease-in-out',
      className: 'transition-all duration-300',
    },
    orbit: {
      duration: 2000, // ms
      easing: 'linear',
      className: 'animate-spin',
    },
    slideUp: {
      duration: 500, // ms
      easing: 'ease-out',
      offset: 20, // px
      className: 'animate-slide-up',
    },
  },

  audio: {
    boot: {
      duration: 500, // ms
      file: '/audio/boot.mp3',
      volume: 0.3,
    },
    success: {
      duration: 1000, // ms
      file: '/audio/success.mp3',
      volume: 0.4,
    },
    warn: {
      duration: 800, // ms
      file: '/audio/warn.mp3',
      volume: 0.5,
    },
    autonomy: {
      duration: 1200, // ms
      file: '/audio/autonomy.mp3',
      volume: 0.35,
    },
    hover: {
      duration: 100, // ms
      file: '/audio/hover.mp3',
      volume: 0.2,
    },
  },

  layout: {
    cardRadii: {
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    },
    glass: {
      light: 'bg-white/80 backdrop-blur-xl',
      dark: 'bg-slate-900/60 backdrop-blur-xl',
    },
    borders: {
      light: 'border border-gray-200 ring-1 ring-gray-900/5',
      dark: 'border border-slate-800',
    },
  },

  colors: {
    primary: {
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-white',
    },
    secondary: {
      bg: 'bg-gray-100',
      hover: 'hover:bg-gray-200',
      text: 'text-gray-900',
    },
    success: {
      bg: 'bg-green-600',
      hover: 'hover:bg-green-700',
      text: 'text-white',
    },
    warn: {
      bg: 'bg-yellow-600',
      hover: 'hover:bg-yellow-700',
      text: 'text-white',
    },
  },

  typography: {
    headings: {
      h1: 'text-2xl font-semibold text-gray-900',
      h2: 'text-xl font-semibold text-gray-900',
      h3: 'text-lg font-semibold text-gray-900',
    },
    body: {
      base: 'text-base text-gray-600',
      sm: 'text-sm text-gray-500',
    },
    mono: {
      numbers: 'font-mono tabular-nums',
      code: 'font-mono text-sm',
    },
  },

  spacing: {
    card: {
      padding: 'p-6',
      gap: 'space-y-6',
    },
    section: {
      padding: 'p-4',
      gap: 'space-y-4',
    },
  },

  kpis: {
    tier1: {
      maxCount: 6,
      displaySize: 'large',
      showActions: true,
    },
    tier2: {
      displaySize: 'medium',
      location: 'drawer',
    },
  },
} as const;

export type NorthStar = typeof northStar;

/**
 * Get motion class with reduced motion support
 */
export function getMotionClass(motionType: keyof typeof northStar.motion): string {
  // Will be used with useReducedMotion hook
  return northStar.motion[motionType].className;
}

/**
 * Get card classes with glass morphism
 */
export function getCardClasses(variant: 'light' | 'dark' = 'light'): string {
  const base = northStar.layout.cardRadii.lg;
  const glass = variant === 'light' 
    ? northStar.layout.glass.light 
    : northStar.layout.glass.dark;
  const border = variant === 'light' 
    ? northStar.layout.borders.light 
    : northStar.layout.borders.dark;
  const shadow = northStar.layout.shadows.sm;
  const padding = northStar.spacing.card.padding;
  
  return `${base} ${glass} ${border} ${shadow} ${padding} hover:${northStar.layout.shadows.md} transition-all duration-200`;
}

/**
 * Get button classes
 */
export function getButtonClasses(variant: 'primary' | 'secondary' | 'ghost' = 'primary'): string {
  const base = 'px-6 py-3 rounded-lg font-medium transition-colors';
  
  switch (variant) {
    case 'primary':
      return `${base} ${northStar.colors.primary.bg} ${northStar.colors.primary.hover} ${northStar.colors.primary.text}`;
    case 'secondary':
      return `${base} ${northStar.colors.secondary.bg} ${northStar.colors.secondary.hover} ${northStar.colors.secondary.text}`;
    case 'ghost':
      return `${base} border border-gray-300 hover:bg-gray-50 text-gray-700`;
    default:
      return base;
  }
}
