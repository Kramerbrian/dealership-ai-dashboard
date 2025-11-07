'use client';

/**
 * Haptic feedback utilities
 * Provides tactile feedback for interactions
 */

export function tap() {
  if (typeof window === 'undefined') return;
  
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short tap
    }
  } catch (error) {
    // Silently fail if vibration is not available
    console.debug('Vibration not available:', error);
  }
}

export function doubleTap() {
  if (typeof window === 'undefined') return;
  
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 20, 10]); // Double tap pattern
    }
  } catch (error) {
    // Silently fail if vibration is not available
    console.debug('Vibration not available:', error);
  }
}

export function longPress() {
  if (typeof window === 'undefined') return;
  
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Longer press
    }
  } catch (error) {
    // Silently fail if vibration is not available
    console.debug('Vibration not available:', error);
  }
}

