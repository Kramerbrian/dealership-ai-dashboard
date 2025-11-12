'use client';

/**
 * Sonic Palette - Audio cues for UI interactions
 * Uses WebAudio API for consistent, low-latency sounds
 */

type SonicEvent = 'pulse' | 'autofix' | 'resolved' | 'error' | 'success' | 'click' | 'open' | 'close';

let audioContext: AudioContext | null = null;

// Initialize audio context on first interaction
export function initSonicPalette(): void {
  if (typeof window === 'undefined') return;
  if (audioContext) return;

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch (err) {
    console.warn('WebAudio not supported');
  }
}

export function playSonic(event: SonicEvent): void {
  if (!audioContext) initSonicPalette();
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  // Map events to frequencies and patterns
  switch (event) {
    case 'pulse':
      osc.frequency.setValueAtTime(440, now); // A4
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;

    case 'autofix':
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;

    case 'resolved':
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
      break;

    case 'error':
      osc.frequency.setValueAtTime(220, now); // A3
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;

    case 'success':
      // Triple ascending tones
      playTone(523.25, 0.08, 0.12, now); // C5
      playTone(659.25, 0.08, 0.12, now + 0.08); // E5
      playTone(783.99, 0.12, 0.15, now + 0.16); // G5
      return; // Don't disconnect osc/gain (already handled in playTone)

    case 'click':
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;

    case 'open':
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
      break;

    case 'close':
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
      break;

    default:
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
  }
}

function playTone(frequency: number, duration: number, volume: number, startTime: number): void {
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Initialize on first user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    initSonicPalette();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
  };
  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('keydown', initOnInteraction, { once: true });
}
