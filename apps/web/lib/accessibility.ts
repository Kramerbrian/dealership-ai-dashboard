// Accessibility utilities for DealershipAI Dashboard

export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// Detect user preferences
export function detectAccessibilityPreferences(): AccessibilityConfig {
  if (typeof window === 'undefined') {
    return {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      screenReader: false,
      keyboardNavigation: false
    };
  }

  const mediaQueries = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
    highContrast: window.matchMedia('(prefers-contrast: high)')
  };

  return {
    reducedMotion: mediaQueries.reducedMotion.matches,
    highContrast: mediaQueries.highContrast.matches,
    fontSize: 'medium', // Could be enhanced with user preference detection
    screenReader: detectScreenReader(),
    keyboardNavigation: false // Will be set based on user interaction
  };
}

// Detect if screen reader is being used
function detectScreenReader(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for common screen reader indicators
  const indicators = [
    'speechSynthesis' in window,
    'webkitSpeechSynthesis' in window,
    navigator.userAgent.includes('NVDA'),
    navigator.userAgent.includes('JAWS'),
    navigator.userAgent.includes('VoiceOver'),
    document.querySelector('[aria-live]') !== null
  ];
  
  return indicators.some(Boolean);
}

// Generate ARIA labels for charts
export function generateChartAriaLabel(
  title: string,
  data: Array<{ name: string; value: number }>,
  type: 'line' | 'bar' | 'pie' | 'radar'
): string {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const average = total / data.length;
  const max = Math.max(...data.map(item => item.value));
  const min = Math.min(...data.map(item => item.value));
  
  let description = `${title} chart showing ${data.length} data points. `;
  
  switch (type) {
    case 'line':
      description += `Values range from ${min} to ${max}, with an average of ${average.toFixed(1)}. `;
      break;
    case 'bar':
      description += `Bar chart with values ranging from ${min} to ${max}. `;
      break;
    case 'pie':
      description += `Pie chart with ${data.length} segments. `;
      break;
    case 'radar':
      description += `Radar chart with ${data.length} dimensions. `;
      break;
  }
  
  // Add top values
  const topValues = data
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(item => `${item.name}: ${item.value}`)
    .join(', ');
  
  description += `Top values: ${topValues}.`;
  
  return description;
}

// Keyboard navigation utilities
export class KeyboardNavigator {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = 0;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.updateFocusableElements();
    this.setupEventListeners();
  }

  private updateFocusableElements() {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="tab"]',
      '[role="menuitem"]'
    ];

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selectors.join(', '))
    ) as HTMLElement[];
  }

  private setupEventListeners() {
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.container.addEventListener('focusin', this.handleFocusIn.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.focusNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.focusPrevious();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.focusLast();
        break;
    }
  }

  private handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;
    this.currentIndex = this.focusableElements.indexOf(target);
  }

  private focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }

  private focusPrevious() {
    this.currentIndex = this.currentIndex === 0 
      ? this.focusableElements.length - 1 
      : this.currentIndex - 1;
    this.focusableElements[this.currentIndex]?.focus();
  }

  private focusFirst() {
    this.currentIndex = 0;
    this.focusableElements[0]?.focus();
  }

  private focusLast() {
    this.currentIndex = this.focusableElements.length - 1;
    this.focusableElements[this.currentIndex]?.focus();
  }

  public destroy() {
    this.container.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.container.removeEventListener('focusin', this.handleFocusIn.bind(this));
  }
}

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// WCAG compliance check
export function isWCAGCompliant(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Skip links
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
    transition: top 0.3s;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  return skipLink;
}
