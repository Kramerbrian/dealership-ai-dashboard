'use client';

import { useEffect } from 'react';

/**
 * Accessibility enhancements for the landing page
 * - Keyboard navigation support
 * - Focus management
 * - ARIA labels
 * - Screen reader optimizations
 */
export function AccessibilityEnhancements() {
  useEffect(() => {
    // Skip to main content link for screen readers
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add keyboard navigation for modals
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[aria-label*="Close"], [aria-label*="close"]');
          if (closeButton && document.activeElement === modal) {
            (closeButton as HTMLElement).click();
          }
        });
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      skipLink.remove();
    };
  }, []);

  return null;
}

// Add screen reader only styles
export function ScreenReaderStyles() {
  return (
    <style jsx global>{`
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      .focus\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `}</style>
  );
}

