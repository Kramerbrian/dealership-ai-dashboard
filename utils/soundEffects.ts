/**
 * Sound Effects Engine
 * Optional contextual audio feedback (off by default)
 */

export class SoundEngine {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = false;
  
  constructor() {
    if (typeof window === 'undefined') return;

    // Load sound effects (paths relative to public folder)
    this.loadSound('score-improve', '/sounds/chime-up.mp3');
    this.loadSound('score-decline', '/sounds/chime-down.mp3');
    this.loadSound('achievement', '/sounds/success.mp3');
    this.loadSound('alert', '/sounds/alert.mp3');
    this.loadSound('click', '/sounds/click.mp3');
    
    // Check user preference
    this.enabled = localStorage.getItem('sound-enabled') === 'true';
  }
  
  private loadSound(id: string, path: string) {
    if (typeof window === 'undefined') return;
    const audio = new Audio(path);
    audio.volume = 0.3; // Subtle by default
    this.sounds.set(id, audio);
  }
  
  play(id: string) {
    if (!this.enabled || typeof window === 'undefined') return;
    const sound = this.sounds.get(id);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {}); // Fail silently
    }
  }
  
  toggle() {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound-enabled', String(this.enabled));
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundEngine = new SoundEngine();
