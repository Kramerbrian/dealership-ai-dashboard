/**
 * Accessibility Enhancement Script
 * Adds ARIA attributes and improves keyboard navigation
 */

class AccessibilityManager {
  constructor() {
    this.init();
  }

  /**
   * Initialize all accessibility enhancements
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.enhanceAccessibility());
    } else {
      this.enhanceAccessibility();
    }
  }

  /**
   * Main enhancement function
   */
  enhanceAccessibility() {
    this.enhanceTabs();
    this.enhanceModals();
    this.enhanceButtons();
    this.enhanceCards();
    this.enhanceProgressBars();
    this.enhanceNotifications();
    this.addSkipLinks();
    this.enhanceForms();

    console.log('✅ Accessibility enhancements applied');
  }

  /**
   * Add ARIA attributes to tab navigation
   */
  enhanceTabs() {
    // Tab list
    const tabContainer = document.querySelector('.tab-navigation');
    if (tabContainer) {
      tabContainer.setAttribute('role', 'tablist');
      tabContainer.setAttribute('aria-label', 'Dashboard navigation');
    }

    // Individual tabs
    const tabs = document.querySelectorAll('.apple-tab');
    tabs.forEach((tab, index) => {
      // Set role
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');

      // Get or create ID
      if (!tab.id) {
        tab.id = `tab-${index}`;
      }

      // Find associated panel
      const tabName = this.extractTabName(tab);
      if (tabName) {
        const panel = document.getElementById(tabName);
        if (panel) {
          tab.setAttribute('aria-controls', tabName);
          tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
        }
      }

      // Update on click
      tab.addEventListener('click', () => {
        this.updateTabAria(tab);
      });
    });

    // Tab panels
    const panels = document.querySelectorAll('.tab-content');
    panels.forEach((panel) => {
      panel.setAttribute('role', 'tabpanel');

      // Find associated tab
      const associatedTab = Array.from(tabs).find(tab =>
        tab.getAttribute('aria-controls') === panel.id
      );

      if (associatedTab) {
        panel.setAttribute('aria-labelledby', associatedTab.id);
      }

      panel.setAttribute('tabindex', '0');
    });
  }

  /**
   * Update ARIA attributes when tab is clicked
   */
  updateTabAria(activeTab) {
    const tabs = document.querySelectorAll('.apple-tab');
    tabs.forEach(tab => {
      const isActive = tab === activeTab;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  /**
   * Extract tab name from button
   */
  extractTabName(tab) {
    // Try data attribute first
    if (tab.dataset.tab) return tab.dataset.tab;

    // Try onclick attribute
    const onclick = tab.getAttribute('onclick');
    if (onclick) {
      const match = onclick.match(/switchTab\(['"](.+?)['"]/);
      return match ? match[1] : null;
    }

    return null;
  }

  /**
   * Enhance modals with ARIA attributes
   */
  enhanceModals() {
    const modals = document.querySelectorAll('.cupertino-modal');

    modals.forEach((modal) => {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');

      // Add aria-hidden when not active
      const observer = new MutationObserver(() => {
        modal.setAttribute('aria-hidden', modal.classList.contains('active') ? 'false' : 'true');
      });

      observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

      // Initial state
      modal.setAttribute('aria-hidden', modal.classList.contains('active') ? 'false' : 'true');

      // Find modal title for aria-labelledby
      const title = modal.querySelector('.modal-title');
      if (title) {
        if (!title.id) {
          title.id = `${modal.id}-title`;
        }
        modal.setAttribute('aria-labelledby', title.id);
      }
    });
  }

  /**
   * Enhance buttons with ARIA labels
   */
  enhanceButtons() {
    // Action buttons without text
    const iconButtons = document.querySelectorAll('button:not([aria-label])');

    iconButtons.forEach(button => {
      const text = button.textContent.trim();
      const onclick = button.getAttribute('onclick');

      // If button has emoji or symbol but unclear purpose, add label
      if (!text || /^[\u{1F300}-\u{1F9FF}]$/u.test(text)) {
        if (onclick) {
          const label = this.generateAriaLabel(onclick);
          if (label) {
            button.setAttribute('aria-label', label);
          }
        }
      }
    });

    // Toggle buttons
    const toggleButtons = document.querySelectorAll('[data-action*="toggle"]');
    toggleButtons.forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        const pressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      });
    });
  }

  /**
   * Generate ARIA label from onclick function name
   */
  generateAriaLabel(onclickStr) {
    const functionNames = {
      'launchExecutiveAnalysis': 'Launch Executive Analysis',
      'generateCSuiteReport': 'Generate C-Suite Report',
      'executeBulkActions': 'Execute Bulk Actions',
      'optimizeAICitations': 'Optimize AI Citations',
      'syncEcosystem': 'Sync Ecosystem',
      'saveApiKeys': 'Save API Keys',
      'loadApiKeys': 'Load API Keys',
      'testGoogleApis': 'Test Google APIs',
      'testSocialApis': 'Test Social Media APIs',
      'openModal': 'Open modal dialog',
      'closeModal': 'Close modal dialog'
    };

    for (const [func, label] of Object.entries(functionNames)) {
      if (onclickStr.includes(func)) {
        return label;
      }
    }

    return null;
  }

  /**
   * Enhance clickable cards with ARIA
   */
  enhanceCards() {
    const clickableCards = document.querySelectorAll('.clickable, [onclick]');

    clickableCards.forEach(card => {
      if (card.tagName !== 'BUTTON' && card.tagName !== 'A') {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        // Find descriptive text
        const heading = card.querySelector('h3, h4, h5, .card-title');
        if (heading && !card.getAttribute('aria-label')) {
          card.setAttribute('aria-label', heading.textContent.trim());
        }
      }
    });
  }

  /**
   * Enhance progress bars with ARIA
   */
  enhanceProgressBars() {
    const progressBars = document.querySelectorAll('.health-bar, .progress-bar, [style*="width:"]');

    progressBars.forEach(bar => {
      // Skip if already has role
      if (bar.getAttribute('role')) return;

      bar.setAttribute('role', 'progressbar');

      // Try to extract value from width style
      const widthStyle = bar.style.width || bar.getAttribute('style');
      if (widthStyle) {
        const match = widthStyle.match(/width:\s*(\d+(?:\.\d+)?)/);
        if (match) {
          const value = parseFloat(match[1]);
          bar.setAttribute('aria-valuenow', value);
          bar.setAttribute('aria-valuemin', '0');
          bar.setAttribute('aria-valuemax', '100');
          bar.setAttribute('aria-label', `Progress: ${value}%`);
        }
      }
    });
  }

  /**
   * Enhance notifications with ARIA live regions
   */
  enhanceNotifications() {
    // Find or create notification container
    let notificationArea = document.querySelector('.notification-container, .toast-container');

    if (!notificationArea) {
      notificationArea = document.createElement('div');
      notificationArea.className = 'notification-container';
      notificationArea.style.position = 'fixed';
      notificationArea.style.top = '20px';
      notificationArea.style.right = '20px';
      notificationArea.style.zIndex = '10000';
      document.body.appendChild(notificationArea);
    }

    notificationArea.setAttribute('role', 'status');
    notificationArea.setAttribute('aria-live', 'polite');
    notificationArea.setAttribute('aria-atomic', 'true');

    // Enhance existing notifications
    const notifications = document.querySelectorAll('.notification, .toast, .alert');
    notifications.forEach(notification => {
      notification.setAttribute('role', 'alert');
    });
  }

  /**
   * Add skip to main content link
   */
  addSkipLinks() {
    // Check if already exists
    if (document.querySelector('.skip-link')) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--apple-blue, #007AFF);
      color: white;
      padding: 8px 16px;
      text-decoration: none;
      z-index: 100000;
      border-radius: 0 0 4px 0;
      font-weight: 600;
    `;

    // Show on focus
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Ensure main content has ID
    const mainContent = document.querySelector('.cupertino-main, main, .dashboard-content');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }

  /**
   * Enhance forms with proper labels
   */
  enhanceForms() {
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      // Skip if already has label association
      if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) return;

      // Try to find associated label
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return;

      // Look for placeholder or title
      const placeholder = input.getAttribute('placeholder');
      const title = input.getAttribute('title');
      const name = input.getAttribute('name');

      if (placeholder) {
        input.setAttribute('aria-label', placeholder);
      } else if (title) {
        input.setAttribute('aria-label', title);
      } else if (name) {
        // Convert name to readable label
        const label = name.replace(/_/g, ' ').replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        input.setAttribute('aria-label', label);
      }

      // Add required indicator
      if (input.required && !input.getAttribute('aria-required')) {
        input.setAttribute('aria-required', 'true');
      }

      // Add invalid state handler
      input.addEventListener('invalid', () => {
        input.setAttribute('aria-invalid', 'true');
      });

      input.addEventListener('input', () => {
        if (input.validity.valid) {
          input.setAttribute('aria-invalid', 'false');
        }
      });
    });
  }

  /**
   * Announce dynamic content changes to screen readers
   */
  announce(message, priority = 'polite') {
    const announcer = document.getElementById('aria-live-announcer') || this.createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }

  /**
   * Create aria-live announcer element
   */
  createAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'aria-live-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(announcer);
    return announcer;
  }
}

// Initialize accessibility manager
window.accessibilityManager = new AccessibilityManager();

// Export announce function for use in other scripts
window.announceToScreenReader = (message, priority) => {
  window.accessibilityManager.announce(message, priority);
};

console.log('✅ Accessibility Manager initialized - ARIA attributes and screen reader support enabled');
