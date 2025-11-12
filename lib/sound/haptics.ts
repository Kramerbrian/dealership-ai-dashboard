'use client';

/**
 * Haptic feedback utilities
 * Provides tactile feedback for user interactions
 */

export const tap = (): void => {
  if (typeof navigator === 'undefined') return;
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(12);
    } catch (err) {
      // Silently fail if vibration not supported
    }
  }
};

export const doubleTap = (): void => {
  if (typeof navigator === 'undefined') return;
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([10, 40, 10]);
    } catch (err) {
      // Silently fail if vibration not supported
    }
  }
};

export const success = (): void => {
  if (typeof navigator === 'undefined') return;
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([8, 20, 8, 20, 8]);
    } catch (err) {
      // Silently fail
    }
  }
};

export const error = (): void => {
  if (typeof navigator === 'undefined') return;
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([50, 50, 50]);
    } catch (err) {
      // Silently fail
    }
  }
};
