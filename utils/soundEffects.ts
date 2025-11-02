/**
 * Sound Effects Engine
 * Optional contextual audio feedback (off by default)
 */

export class SoundEngine {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = false;
  private initialized: boolean = false;
  
  private init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Load sound effects (paths relative to public folder)
    this.loadSound('score-improve', '/sounds/chime-up.mp3');
    this.loadSound('score-decline', '/sounds/chime-down.mp3');
    this.loadSound('achievement', '/sounds/success.mp3');
    this.loadSound('alert', '/sounds/alert.mp3');
    this.loadSound('click', '/sounds/click.mp3');
    
    // Check user preference
    try {
      this.enabled = localStorage.getItem('sound-enabled') === 'true';
    } catch (e) {
      // localStorage not available
    }
  }
  
  private loadSound(id: string, path: string) {
    if (typeof window === 'undefined') return;
    const audio = new Audio(path);
    audio.volume = 0.3; // Subtle by default
    this.sounds.set(id, audio);
  }
  
  play(id: string) {
    this.init(); // Lazy initialization
    if (!this.enabled || typeof window === 'undefined') return;
    const sound = this.sounds.get(id);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {}); // Fail silently
    }
  }
  
  toggle() {
    this.init(); // Lazy initialization
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sound-enabled', String(this.enabled));
      } catch (e) {
        // localStorage not available
      }
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Lazy singleton - only instantiate when needed
let _soundEngineInstance: SoundEngine | null = null;

export const soundEngine = (() => {
  if (typeof window === 'undefined') {
    // Return a no-op instance for SSR
    return {
      play: () => {},
      toggle: () => {},
      isEnabled: () => false,
    } as SoundEngine;
  }
  if (!_soundEngineInstance) {
    _soundEngineInstance = new SoundEngine();
  }
  return _soundEngineInstance;
})();
