/**
 * Haptic Feedback
 * Provides tactile feedback for supported devices
 * Falls back gracefully on unsupported platforms
 */

/**
 * Check if haptic feedback is available
 */
function isHapticsAvailable(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Single tap feedback (light)
 */
export function tap(): void {
  if (isHapticsAvailable()) {
    try {
      navigator.vibrate(10); // 10ms light tap
    } catch (e) {
      // Silently fail
    }
  }
}

/**
 * Double tap feedback (medium)
 */
export function doubleTap(): void {
  if (isHapticsAvailable()) {
    try {
      navigator.vibrate([10, 30, 15]); // tap-pause-tap pattern
    } catch (e) {
      // Silently fail
    }
  }
}

/**
 * Success feedback (celebratory)
 */
export function success(): void {
  if (isHapticsAvailable()) {
    try {
      navigator.vibrate([20, 50, 30, 50, 40]); // ascending pattern
    } catch (e) {
      // Silently fail
    }
  }
}

/**
 * Error feedback (warning)
 */
export function error(): void {
  if (isHapticsAvailable()) {
    try {
      navigator.vibrate([50, 100, 50]); // stronger, double pulse
    } catch (e) {
      // Silently fail
    }
  }
}

/**
 * Long press feedback (sustained)
 */
export function longPress(): void {
  if (isHapticsAvailable()) {
    try {
      navigator.vibrate(40); // 40ms sustained
    } catch (e) {
      // Silently fail
    }
  }
}
