/**
 * DealershipAI North Star Design Tokens
 * Liquid-glass aesthetic, Morph+Orbit motion, audio palette, mobile timeline
 */

export const northStarTokens = {
  motion: {
    fade: {
      duration: 300,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
    },
    morph: {
      duration: 500,
      spring: {
        stiffness: 300,
        damping: 30
      }
    },
    orbit: {
      duration: 2000,
      ease: 'linear' as const,
      repeat: Infinity
    }
  },
  audio: {
    boot: {
      src: '/audio/boot.mp3',
      volume: 0.3
    },
    success: {
      src: '/audio/success.mp3',
      volume: 0.2
    },
    warn: {
      src: '/audio/warn.mp3',
      volume: 0.4
    },
    autonomy: {
      src: '/audio/autonomy.mp3',
      volume: 0.25
    },
    hover: {
      src: '/audio/hover.mp3',
      volume: 0.1
    }
  },
  layout: {
    cardRadii: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.07)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.15)'
    }
  }
} as const;

/**
 * Hook to check for reduced motion preference
 * Gate all animations behind this check
 */
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Global CSS for reduced motion
 * Add to globals.css
 */
export const reducedMotionCSS = `
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

/**
 * Get motion config respecting reduced motion
 */
export function getMotionConfig(
  animation: 'fade' | 'morph' | 'orbit',
  customDuration?: number
) {
  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReduced) {
    return { duration: 0 };
  }
  
  const config = northStarTokens.motion[animation];
  return {
    ...config,
    duration: customDuration || config.duration
  };
}

