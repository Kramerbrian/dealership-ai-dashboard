'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { AriaLiveRegion } from '@/components/ui/AriaLiveRegion';

interface AccessibilityContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return {
      announce: () => {}, // No-op fallback
    };
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [politeMessage, setPoliteMessage] = React.useState<string | null>(null);
  const [assertiveMessage, setAssertiveMessage] = React.useState<string | null>(null);

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage(message);
      // Clear after announcement
      setTimeout(() => setAssertiveMessage(null), 1000);
    } else {
      setPoliteMessage(message);
      setTimeout(() => setPoliteMessage(null), 1000);
    }
  }, []);

  // Skip to main content link
  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded';
    skipLink.setAttribute('aria-label', 'Skip to main content');
    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      document.body.removeChild(skipLink);
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={{ announce }}>
      {children}
      <AriaLiveRegion message={politeMessage} priority="polite" />
      <AriaLiveRegion message={assertiveMessage} priority="assertive" />
    </AccessibilityContext.Provider>
  );
}

