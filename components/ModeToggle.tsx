/**
 * DealershipAI Site Intelligence - Mode Toggle
 * 
 * Light/dark mode toggle component
 */

'use client';

export function ModeToggle() {
  return (
    <button
      onClick={() => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      }}
      className="rounded-md border px-3 py-1 text-sm"
    >
      Theme
    </button>
  );
}
