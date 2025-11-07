'use client';

/**
 * Toast notification store
 * Simple wrapper around toast functionality
 */

interface ToastOptions {
  level: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

// Simple toast function that can be used standalone
export function showToast(options: ToastOptions) {
  if (typeof window === 'undefined') return;
  
  // Dispatch custom event that can be picked up by toast system
  const event = new CustomEvent('show-toast', {
    detail: {
      type: options.level,
      message: options.message,
      title: options.title,
      duration: options.duration || 3000
    }
  });
  
  window.dispatchEvent(event);
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Toast ${options.level}]`, options.title || options.message);
  }
}

