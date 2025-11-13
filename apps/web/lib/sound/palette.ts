/**
 * Sound Palette
 * Provides audio feedback cues for UI interactions
 * Uses Web Audio API for crisp, low-latency sounds
 */

type SoundType = 'pulse' | 'autofix' | 'success' | 'error' | 'click';

// Simple sine wave generator for UI sounds
function createTone(frequency: number, duration: number, volume: number = 0.1): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Silently fail if audio not available
  }
}

const soundMap: Record<SoundType, () => void> = {
  pulse: () => createTone(523.25, 0.08, 0.08), // C5 - gentle notification
  autofix: () => {
    // Two-tone: ascending perfect fifth
    createTone(392, 0.06, 0.06); // G4
    setTimeout(() => createTone(587.33, 0.08, 0.06), 40); // D5
  },
  success: () => {
    // Happy triad
    createTone(523.25, 0.06, 0.05); // C5
    setTimeout(() => createTone(659.25, 0.06, 0.05), 30); // E5
    setTimeout(() => createTone(783.99, 0.1, 0.05), 60); // G5
  },
  error: () => createTone(196, 0.15, 0.1), // G3 - low warning
  click: () => createTone(880, 0.03, 0.04), // A5 - quick tap
};

/**
 * Play a sonic cue
 * @param type - Type of sound to play
 */
export function playSonic(type: SoundType): void {
  const sound = soundMap[type];
  if (sound) {
    sound();
  }
}

/**
 * Check if Web Audio API is available
 */
export function isAudioAvailable(): boolean {
  return typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext);
}
