import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onSpace?: () => void;
  onDelete?: () => void;
  onBackspace?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  onKey?: (key: string, event: KeyboardEvent) => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enabled?: boolean;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onSpace,
    onDelete,
    onBackspace,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    onKey,
    preventDefault = false,
    stopPropagation = false,
    enabled = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { key, shiftKey, ctrlKey, metaKey } = event;

    // Handle key combinations
    if (ctrlKey || metaKey) {
      switch (key.toLowerCase()) {
        case 'k':
          event.preventDefault();
          // Open command palette
          window.dispatchEvent(new CustomEvent('open-command-palette'));
          return;
        case 'r':
          event.preventDefault();
          // Refresh data
          window.dispatchEvent(new CustomEvent('refresh-data'));
          return;
        case 's':
          event.preventDefault();
          // Save/Search
          window.dispatchEvent(new CustomEvent('save-or-search'));
          return;
      }
    }

    // Handle individual keys
    switch (key) {
      case 'Enter':
        if (onEnter) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onEnter();
        }
        break;
      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowRight();
        }
        break;
      case 'Tab':
        if (shiftKey && onShiftTab) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onShiftTab();
        } else if (onTab) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onTab();
        }
        break;
      case ' ':
        if (onSpace) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onSpace();
        }
        break;
      case 'Delete':
        if (onDelete) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onDelete();
        }
        break;
      case 'Backspace':
        if (onBackspace) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onBackspace();
        }
        break;
      case 'Home':
        if (onHome) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onHome();
        }
        break;
      case 'End':
        if (onEnd) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onEnd();
        }
        break;
      case 'PageUp':
        if (onPageUp) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onPageUp();
        }
        break;
      case 'PageDown':
        if (onPageDown) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onPageDown();
        }
        break;
      default:
        if (onKey) {
          onKey(key, event);
        }
        break;
    }
  }, [
    enabled,
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onSpace,
    onDelete,
    onBackspace,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    onKey,
    preventDefault,
    stopPropagation
  ]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return { handleKeyDown };
}

// Hook for managing focus within a component
export function useFocusManagement() {
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const currentIndexRef = useRef(0);

  const updateFocusableElements = useCallback((container: HTMLElement) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    focusableElementsRef.current = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  const focusNext = useCallback(() => {
    const elements = focusableElementsRef.current;
    if (elements.length === 0) return;

    currentIndexRef.current = (currentIndexRef.current + 1) % elements.length;
    elements[currentIndexRef.current]?.focus();
  }, []);

  const focusPrevious = useCallback(() => {
    const elements = focusableElementsRef.current;
    if (elements.length === 0) return;

    currentIndexRef.current = currentIndexRef.current === 0 
      ? elements.length - 1 
      : currentIndexRef.current - 1;
    elements[currentIndexRef.current]?.focus();
  }, []);

  const focusFirst = useCallback(() => {
    const elements = focusableElementsRef.current;
    if (elements.length === 0) return;

    currentIndexRef.current = 0;
    elements[0]?.focus();
  }, []);

  const focusLast = useCallback(() => {
    const elements = focusableElementsRef.current;
    if (elements.length === 0) return;

    currentIndexRef.current = elements.length - 1;
    elements[elements.length - 1]?.focus();
  }, []);

  return {
    updateFocusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast
  };
}

// Hook for arrow key navigation in lists
export function useArrowKeyNavigation<T>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  options: {
    enabled?: boolean;
    loop?: boolean;
    initialIndex?: number;
  } = {}
) {
  const { enabled = true, loop = true, initialIndex = 0 } = options;
  const [selectedIndex, setSelectedIndex] = React.useState(initialIndex);

  const handleArrowUp = useCallback(() => {
    if (!enabled || items.length === 0) return;

    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : (loop ? items.length - 1 : selectedIndex);
    setSelectedIndex(newIndex);
    onSelect(items[newIndex], newIndex);
  }, [enabled, items, selectedIndex, loop, onSelect]);

  const handleArrowDown = useCallback(() => {
    if (!enabled || items.length === 0) return;

    const newIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : (loop ? 0 : selectedIndex);
    setSelectedIndex(newIndex);
    onSelect(items[newIndex], newIndex);
  }, [enabled, items, selectedIndex, loop, onSelect]);

  useKeyboardNavigation({
    onArrowUp: handleArrowUp,
    onArrowDown: handleArrowDown,
    enabled
  });

  return {
    selectedIndex,
    setSelectedIndex
  };
}
