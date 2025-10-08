/**
 * Event Manager - Centralized Event Delegation
 * Removes need for inline onclick handlers, improves CSP compliance
 */

class EventManager {
  constructor() {
    this.handlers = new Map();
    this.init();
  }

  /**
   * Initialize global event listeners
   */
  init() {
    // Global click handler with event delegation
    document.addEventListener('click', (e) => this.handleClick(e), true);

    // Global keyboard handler for accessibility
    document.addEventListener('keydown', (e) => this.handleKeyboard(e), true);

    // Global form submit handler
    document.addEventListener('submit', (e) => this.handleSubmit(e), true);
  }

  /**
   * Handle all click events via delegation
   */
  handleClick(e) {
    const target = e.target;

    // Tab navigation
    if (target.classList.contains('apple-tab')) {
      e.preventDefault();
      const tabName = target.dataset.tab || this.extractTabFromOnclick(target);
      if (tabName) this.switchTab(tabName, e);
      return;
    }

    // Cards with data-modal
    if (target.closest('[data-modal]')) {
      e.preventDefault();
      const modalId = target.closest('[data-modal]').dataset.modal;
      this.openModal(modalId);
      return;
    }

    // Action buttons with data-action
    const actionBtn = target.closest('[data-action]');
    if (actionBtn) {
      e.preventDefault();
      const action = actionBtn.dataset.action;
      this.executeAction(action, e);
      return;
    }

    // Modal close buttons
    if (target.classList.contains('modal-close') || target.closest('.modal-close')) {
      e.preventDefault();
      const modal = target.closest('.cupertino-modal');
      if (modal) this.closeModal(modal.id);
      return;
    }

    // Legacy onclick handler extraction
    const onclickAttr = target.getAttribute('onclick');
    if (onclickAttr) {
      e.preventDefault();
      this.executeLegacyOnclick(onclickAttr, e);
    }
  }

  /**
   * Handle keyboard events for accessibility
   */
  handleKeyboard(e) {
    const target = e.target;

    // Tab navigation with keyboard
    if (target.classList.contains('apple-tab')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        target.click();
      }
      // Arrow key navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.navigateTabs(e.key === 'ArrowLeft' ? -1 : 1, target);
      }
    }

    // Escape to close modals
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.cupertino-modal.active');
      if (openModal) {
        e.preventDefault();
        this.closeModal(openModal.id);
      }
    }

    // Enter/Space on buttons and links
    if ((e.key === 'Enter' || e.key === ' ') &&
        (target.tagName === 'BUTTON' || target.classList.contains('clickable'))) {
      if (e.key === ' ') e.preventDefault();
      target.click();
    }
  }

  /**
   * Handle form submissions
   */
  handleSubmit(e) {
    // Can add global form validation here
  }

  /**
   * Switch tabs
   */
  switchTab(tabName, event) {
    if (typeof window.switchTab === 'function') {
      window.switchTab(tabName, event);
    } else {
      console.error('switchTab function not found');
    }
  }

  /**
   * Open modal
   */
  openModal(modalId) {
    if (typeof window.openModal === 'function') {
      window.openModal(modalId);
    } else {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus trap
        this.trapFocus(modal);
      }
    }
  }

  /**
   * Close modal
   */
  closeModal(modalId) {
    if (typeof window.closeModal === 'function') {
      window.closeModal(modalId);
    } else {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  }

  /**
   * Execute action based on data-action attribute
   */
  executeAction(action, event) {
    const actionMap = {
      'launch-executive-analysis': () => window.launchExecutiveAnalysis?.(),
      'generate-csuite-report': () => window.generateCSuiteReport?.(),
      'execute-bulk-actions': () => window.executeBulkActions?.(),
      'optimize-ai-citations': () => window.optimizeAICitations?.(),
      'sync-ecosystem': () => window.syncEcosystem?.(),
      'save-api-keys': () => window.saveApiKeys?.(),
      'load-api-keys': () => window.loadApiKeys?.(),
      'test-google-apis': () => window.testGoogleApis?.(),
      'test-social-apis': () => window.testSocialApis?.(),
      'toggle-api-key-visibility': (e) => window.toggleApiKeyVisibility?.(e),
    };

    const handler = actionMap[action];
    if (handler) {
      handler(event);
    } else {
      console.warn(`No handler found for action: ${action}`);
    }
  }

  /**
   * Execute legacy onclick attribute
   */
  executeLegacyOnclick(onclickStr, event) {
    try {
      // Extract function name and arguments
      const match = onclickStr.match(/(\w+)\((.*?)\)/);
      if (match) {
        const funcName = match[1];
        const args = match[2];

        if (typeof window[funcName] === 'function') {
          // Parse arguments
          const parsedArgs = args ? args.split(',').map(arg => {
            arg = arg.trim();
            if (arg === 'event') return event;
            if (arg.startsWith("'") || arg.startsWith('"')) {
              return arg.slice(1, -1);
            }
            return arg;
          }) : [];

          window[funcName](...parsedArgs);
        }
      }
    } catch (error) {
      console.error('Error executing legacy onclick:', error);
    }
  }

  /**
   * Extract tab name from onclick attribute
   */
  extractTabFromOnclick(element) {
    const onclick = element.getAttribute('onclick');
    if (onclick) {
      const match = onclick.match(/switchTab\(['"](.+?)['"]/);
      return match ? match[1] : null;
    }
    return null;
  }

  /**
   * Navigate tabs with arrow keys
   */
  navigateTabs(direction, currentTab) {
    const tabs = Array.from(document.querySelectorAll('.apple-tab'));
    const currentIndex = tabs.indexOf(currentTab);
    let nextIndex = currentIndex + direction;

    // Wrap around
    if (nextIndex < 0) nextIndex = tabs.length - 1;
    if (nextIndex >= tabs.length) nextIndex = 0;

    tabs[nextIndex].focus();
  }

  /**
   * Trap focus within modal
   */
  trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store the element that opened the modal
    modal.dataset.triggerElement = document.activeElement?.id || '';

    // Focus first element
    firstElement.focus();

    // Trap focus
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);

    // Cleanup on close
    const observer = new MutationObserver((mutations) => {
      if (!modal.classList.contains('active')) {
        modal.removeEventListener('keydown', handleTabKey);
        observer.disconnect();

        // Return focus to trigger element
        const triggerId = modal.dataset.triggerElement;
        if (triggerId) {
          document.getElementById(triggerId)?.focus();
        }
      }
    });

    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  /**
   * Register custom action handler
   */
  registerAction(name, handler) {
    this.handlers.set(name, handler);
  }
}

// Initialize event manager
window.eventManager = new EventManager();

console.log('✅ Event Manager initialized - Keyboard navigation and focus management enabled');
