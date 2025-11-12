'use client';

/**
 * Hook to detect if user prefers reduced motion
 * Respects prefers-reduced-motion media query for accessibility
 */
export const useReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;

  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
};
