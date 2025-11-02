/**
 * Haptic Feedback Utilities
 * Provides subtle tactile feedback for UI interactions
 */

export const haptics = {
  // Subtle feedback for UI interactions
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Medium feedback for important actions
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },
  
  // Strong feedback for critical events
  strong: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  },
  
  // Success pattern
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 20, 30]);
    }
  },
  
  // Error pattern
  error: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }
};
