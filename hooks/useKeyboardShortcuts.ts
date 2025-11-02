/**
 * Keyboard Shortcuts Hook
 * 
 * Provides keyboard navigation and shortcuts for the dashboard
 */

import { useEffect } from 'react';

export interface ShortcutHandlers {
  openPIQR?: () => void;
  showShortcuts?: () => void;
  closeModal?: () => void;
  pillar1?: () => void;
  pillar2?: () => void;
  pillar3?: () => void;
  pillar4?: () => void;
  pillar5?: () => void;
  refresh?: () => void;
  [key: string]: (() => void) | undefined;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Cmd/Ctrl + K: Open PIQR
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handlers.openPIQR?.();
      }

      // Cmd/Ctrl + /: Show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        handlers.showShortcuts?.();
      }

      // ESC: Close modals
      if (e.key === 'Escape') {
        handlers.closeModal?.();
      }

      // 1-5: Navigate to pillars
      if (['1', '2', '3', '4', '5'].includes(e.key) && !e.metaKey && !e.ctrlKey) {
        const pillarMap: Record<string, string> = {
          '1': 'pillar1',
          '2': 'pillar2',
          '3': 'pillar3',
          '4': 'pillar4',
          '5': 'pillar5'
        };
        handlers[pillarMap[e.key]]?.();
      }

      // R: Refresh data
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handlers.refresh?.();
      }

      // ?: Show help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        handlers.showShortcuts?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
};

export const SHORTCUTS_LIST = [
  { keys: '⌘/Ctrl + K', description: 'Open PIQR dashboard' },
  { keys: '⌘/Ctrl + /', description: 'Show keyboard shortcuts' },
  { keys: 'ESC', description: 'Close modals/dialogs' },
  { keys: '1-5', description: 'Navigate to pillar sections' },
  { keys: '⌘/Ctrl + R', description: 'Refresh dashboard data' },
  { keys: '?', description: 'Show help menu' }
];

