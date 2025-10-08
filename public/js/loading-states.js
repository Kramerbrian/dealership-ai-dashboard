/**
 * Loading States & Skeleton Screens
 * Provides better UX during async operations
 */

class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
    this.addSkeletonStyles();
  }

  /**
   * Add skeleton screen CSS
   */
  addSkeletonStyles() {
    if (document.getElementById('skeleton-styles')) return;

    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = `
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s ease-in-out infinite;
        border-radius: var(--radius, 8px);
      }

      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      .skeleton-text {
        height: 14px;
        margin-bottom: 8px;
        border-radius: 4px;
      }

      .skeleton-title {
        height: 24px;
        width: 60%;
        margin-bottom: 12px;
        border-radius: 6px;
      }

      .skeleton-card {
        padding: 24px;
        border-radius: var(--radius-lg, 16px);
        min-height: 150px;
      }

      .skeleton-button {
        height: 44px;
        width: 120px;
        border-radius: var(--radius, 8px);
      }

      .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
      }

      .skeleton-metric {
        height: 80px;
        border-radius: var(--radius, 12px);
        margin-bottom: 16px;
      }

      /* Fade in when loaded */
      .fade-in {
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Loading overlay */
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        border-radius: inherit;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid var(--apple-blue, #007AFF);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Show skeleton for a container
   */
  showSkeleton(containerId, type = 'card') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Store original content
    this.loadingStates.set(containerId, container.innerHTML);

    // Create skeleton based on type
    container.innerHTML = this.generateSkeleton(type);
    container.setAttribute('aria-busy', 'true');
  }

  /**
   * Hide skeleton and restore content
   */
  hideSkeleton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const originalContent = this.loadingStates.get(containerId);
    if (originalContent) {
      container.innerHTML = originalContent;
      container.classList.add('fade-in');
      container.setAttribute('aria-busy', 'false');
      this.loadingStates.delete(containerId);
    }
  }

  /**
   * Generate skeleton HTML based on type
   */
  generateSkeleton(type) {
    const skeletons = {
      card: `
        <div class="skeleton skeleton-card">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text" style="width: 100%;"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 70%;"></div>
        </div>
      `,
      metrics: `
        <div class="skeleton skeleton-metric"></div>
        <div class="skeleton skeleton-metric"></div>
        <div class="skeleton skeleton-metric"></div>
      `,
      table: `
        <div class="skeleton skeleton-text" style="width: 100%; height: 40px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-text" style="width: 100%; height: 40px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-text" style="width: 100%; height: 40px; margin-bottom: 12px;"></div>
      `,
      list: `
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex: 1;">
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
          </div>
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex: 1;">
            <div class="skeleton skeleton-text" style="width: 75%;"></div>
            <div class="skeleton skeleton-text" style="width: 55%;"></div>
          </div>
        </div>
      `
    };

    return skeletons[type] || skeletons.card;
  }

  /**
   * Show loading overlay on element
   */
  showLoadingOverlay(elementId, message = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Make element relative if it isn't
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = `${elementId}-loading`;
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div class="loading-spinner"></div>
        ${message ? `<div style="margin-top: 12px; color: #666;">${message}</div>` : ''}
      </div>
    `;

    element.appendChild(overlay);
    element.setAttribute('aria-busy', 'true');
  }

  /**
   * Hide loading overlay
   */
  hideLoadingOverlay(elementId) {
    const overlay = document.getElementById(`${elementId}-loading`);
    const element = document.getElementById(elementId);

    if (overlay) {
      overlay.remove();
    }

    if (element) {
      element.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Show loading state on button
   */
  setButtonLoading(button, isLoading, loadingText = 'Loading...') {
    if (typeof button === 'string') {
      button = document.getElementById(button) || document.querySelector(button);
    }

    if (!button) return;

    if (isLoading) {
      button.dataset.originalText = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></span>
          ${loadingText}
        </span>
      `;
      button.setAttribute('aria-busy', 'true');
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
      button.setAttribute('aria-busy', 'false');
      delete button.dataset.originalText;
    }
  }

  /**
   * Wrap async function with loading state
   */
  async withLoading(elementId, asyncFn, type = 'overlay') {
    try {
      if (type === 'skeleton') {
        this.showSkeleton(elementId);
      } else {
        this.showLoadingOverlay(elementId);
      }

      const result = await asyncFn();

      return result;
    } finally {
      if (type === 'skeleton') {
        this.hideSkeleton(elementId);
      } else {
        this.hideLoadingOverlay(elementId);
      }
    }
  }

  /**
   * Create inline skeleton for specific sections
   */
  createInlineSkeleton(count = 3, height = '14px') {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      const width = 100 - (i * 10);
      skeletons.push(`<div class="skeleton skeleton-text" style="height: ${height}; width: ${width}%;"></div>`);
    }
    return skeletons.join('');
  }
}

// Initialize loading manager
window.loadingManager = new LoadingManager();

// Export convenience functions
window.showLoading = (id, message) => window.loadingManager.showLoadingOverlay(id, message);
window.hideLoading = (id) => window.loadingManager.hideLoadingOverlay(id);
window.showSkeleton = (id, type) => window.loadingManager.showSkeleton(id, type);
window.hideSkeleton = (id) => window.loadingManager.hideSkeleton(id);
window.setButtonLoading = (btn, loading, text) => window.loadingManager.setButtonLoading(btn, loading, text);

console.log('✅ Loading Manager initialized - Skeleton screens and loading states ready');
