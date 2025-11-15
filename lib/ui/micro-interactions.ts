/**
 * Micro-interactions and UI enhancement library
 * Provides smooth animations and interactive feedback
 */

export interface MicroInteraction {
  id: string;
  type: 'hover' | 'click' | 'focus' | 'scroll' | 'gesture';
  element: string;
  animation: AnimationConfig;
  feedback: FeedbackConfig;
}

export interface AnimationConfig {
  duration: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface FeedbackConfig {
  visual: boolean;
  haptic: boolean;
  audio: boolean;
  message?: string;
}

export class MicroInteractionEngine {
  private interactions: Map<string, MicroInteraction> = new Map();
  private activeAnimations: Map<string, Animation> = new Map();

  /**
   * Register a micro-interaction
   */
  registerInteraction(interaction: MicroInteraction): void {
    this.interactions.set(interaction.id, interaction);
    this.attachEventListeners(interaction);
  }

  /**
   * Trigger a micro-interaction
   */
  triggerInteraction(id: string, element?: HTMLElement): void {
    const interaction = this.interactions.get(id);
    if (!interaction) return;

    const targetElement = element || document.querySelector(interaction.element);
    if (!targetElement) return;

    this.executeAnimation(targetElement as HTMLElement, interaction.animation);
    this.executeFeedback(interaction.feedback);
  }

  /**
   * Create smooth scroll animation
   */
  smoothScrollTo(element: string | HTMLElement, duration: number = 500): void {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (!target) return;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }

  /**
   * Create loading animation
   */
  createLoadingAnimation(element: HTMLElement, type: 'spinner' | 'pulse' | 'dots' = 'spinner'): void {
    const loadingClass = `loading-${type}`;
    element.classList.add(loadingClass);
    
    // Remove loading animation after completion
    setTimeout(() => {
      element.classList.remove(loadingClass);
    }, 2000);
  }

  /**
   * Create success animation
   */
  createSuccessAnimation(element: HTMLElement): void {
    element.classList.add('success-animation');
    
    setTimeout(() => {
      element.classList.remove('success-animation');
    }, 1000);
  }

  /**
   * Create error animation
   */
  createErrorAnimation(element: HTMLElement): void {
    element.classList.add('error-animation');
    
    setTimeout(() => {
      element.classList.remove('error-animation');
    }, 1000);
  }

  /**
   * Create hover effects
   */
  createHoverEffects(): void {
    // Card hover effects
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hover-lift');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover-lift');
      });
    });

    // Button hover effects
    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.classList.add('hover-scale');
      });
      
      button.addEventListener('mouseleave', () => {
        button.classList.remove('hover-scale');
      });
    });
  }

  /**
   * Create typing animation
   */
  createTypingAnimation(element: HTMLElement, text: string, speed: number = 50): void {
    let index = 0;
    element.textContent = '';
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, speed);
  }

  /**
   * Create progress animation
   */
  createProgressAnimation(element: HTMLElement, progress: number, duration: number = 1000): void {
    const progressBar = element.querySelector('.progress-bar') as HTMLElement;
    if (!progressBar) return;

    progressBar.style.transition = `width ${duration}ms ease-out`;
    progressBar.style.width = `${progress}%`;
  }

  /**
   * Create counter animation
   */
  createCounterAnimation(element: HTMLElement, targetValue: number, duration: number = 2000): void {
    const startValue = 0;
    const increment = targetValue / (duration / 16);
    let currentValue = startValue;

    const counterInterval = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(counterInterval);
      }
      element.textContent = Math.floor(currentValue).toString();
    }, 16);
  }

  private attachEventListeners(interaction: MicroInteraction): void {
    const element = document.querySelector(interaction.element);
    if (!element) return;

    switch (interaction.type) {
      case 'hover':
        element.addEventListener('mouseenter', () => this.triggerInteraction(interaction.id));
        break;
      case 'click':
        element.addEventListener('click', () => this.triggerInteraction(interaction.id));
        break;
      case 'focus':
        element.addEventListener('focus', () => this.triggerInteraction(interaction.id));
        break;
      case 'scroll':
        element.addEventListener('scroll', () => this.triggerInteraction(interaction.id));
        break;
    }
  }

  private executeAnimation(element: HTMLElement, config: AnimationConfig): void {
    const keyframes = this.generateKeyframes(config);
    const animation = element.animate(keyframes, {
      duration: config.duration,
      easing: config.easing,
      delay: config.delay || 0,
      direction: config.direction || 'normal',
      fill: config.fillMode || 'both'
    });

    this.activeAnimations.set(element.id || Math.random().toString(), animation);
  }

  private executeFeedback(feedback: FeedbackConfig): void {
    if (feedback.visual) {
      // Visual feedback implementation
      console.log('Visual feedback triggered');
    }

    if (feedback.haptic && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }

    if (feedback.audio) {
      // Audio feedback implementation
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {
        // Silently fail if audio can't be played
      });
    }

    if (feedback.message) {
      this.showToast(feedback.message);
    }
  }

  private generateKeyframes(config: AnimationConfig): Keyframe[] {
    // Generate keyframes based on animation type
    return [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.05)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ];
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// CSS for micro-interactions
export const microInteractionStyles = `
  .hover-lift {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }

  .hover-scale {
    transform: scale(1.05);
    transition: transform 0.2s ease;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
  }

  .loading-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }

  .loading-dots::after {
    content: '';
    animation: dots 1.5s steps(4, end) infinite;
  }

  .success-animation {
    animation: success-bounce 0.6s ease;
  }

  .error-animation {
    animation: error-shake 0.6s ease;
  }

  .toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }

  .toast-notification.show {
    transform: translateX(0);
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
  }

  @keyframes success-bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }

  @keyframes error-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
