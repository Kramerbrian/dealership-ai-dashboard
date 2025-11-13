'use client';

import React, { useEffect, useRef } from 'react';

interface AriaLiveRegionProps {
  message: string | null;
  priority?: 'polite' | 'assertive';
  className?: string;
}

/**
 * AriaLiveRegion - Provides screen reader announcements
 * 
 * Use for:
 * - Form validation messages
 * - Success/error notifications
 * - Dynamic content updates
 * - Loading state changes
 */
export function AriaLiveRegion({
  message,
  priority = 'polite',
  className = '',
}: AriaLiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear and set message to trigger announcement
      regionRef.current.textContent = '';
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {message}
    </div>
  );
}
