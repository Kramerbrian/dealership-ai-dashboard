'use client';

/**
 * Sonic palette for dealershipAI
 * Plays audio cues for different actions
 */

type SonicType = 'pulse' | 'chime' | 'autofix' | 'warn' | 'hover';

const sonicMap: Record<SonicType, { frequency: number; duration: number; type: OscillatorType }> = {
  pulse: { frequency: 440, duration: 100, type: 'sine' },
  chime: { frequency: 523.25, duration: 150, type: 'sine' },
  autofix: { frequency: 659.25, duration: 120, type: 'sine' },
  warn: { frequency: 220, duration: 200, type: 'sawtooth' },
  hover: { frequency: 800, duration: 50, type: 'sine' }
};

export function playSonic(type: SonicType) {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    const config = sonicMap[type];
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = config.frequency;
    oscillator.type = config.type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration / 1000);
  } catch (error) {
    // Silently fail if audio context is not available
    console.debug('Audio context not available:', error);
  }
}

