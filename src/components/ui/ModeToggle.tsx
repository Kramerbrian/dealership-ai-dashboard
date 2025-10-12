/**
 * Theme Mode Toggle Component
 * DealershipAI Command Center - Dark/Light mode switcher
 */

'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ModeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('theme');
    const mode = saved ?? (prefersDark ? 'dark' : 'light');
    const shouldBeDark = mode === 'dark';

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md border border-border-soft px-3 py-1 text-sm hover:bg-bg-glass transition-colors flex items-center gap-2"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
