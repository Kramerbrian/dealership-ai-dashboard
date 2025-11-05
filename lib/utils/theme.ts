/**
 * DealershipAI Orchestrator 3.4+ — Theme Service Utilities
 * React hooks and utilities for dealer-specific theme management
 */

import { useState, useEffect } from 'react';

export interface ThemePalette {
  primary: string;
  accent: string;
  light: string;
  dark: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  palette: ThemePalette;
  font?: {
    family: string;
  };
  borderRadius?: string;
  source?: string;
  version?: number;
}

const DEFAULT_THEME: ThemeConfig = {
  mode: 'system',
  palette: {
    primary: '#1b75bb',
    accent: '#00c896',
    light: '#ffffff',
    dark: '#101820',
  },
  font: {
    family: 'Inter, Helvetica, Arial, sans-serif',
  },
  borderRadius: '8px',
  source: 'default',
};

/**
 * Fetch theme from Orchestrator API
 */
export async function fetchDealerTheme(dealerId: string): Promise<ThemeConfig> {
  try {
    const res = await fetch(`/api/v1/theme/${dealerId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[Theme] Failed to fetch theme for ${dealerId}, using default`);
      return DEFAULT_THEME;
    }

    const data = await res.json();
    return {
      ...DEFAULT_THEME,
      ...data,
      palette: {
        ...DEFAULT_THEME.palette,
        ...data.palette,
      },
    };
  } catch (error) {
    console.error('[Theme] Fetch error:', error);
    return DEFAULT_THEME;
  }
}

/**
 * Initialize theme and apply CSS variables to document root
 */
export function initTheme(dealerId: string, theme?: ThemeConfig): void {
  const config = theme || DEFAULT_THEME;
  
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--theme-primary', config.palette.primary);
  root.style.setProperty('--theme-accent', config.palette.accent);
  root.style.setProperty('--theme-light', config.palette.light);
  root.style.setProperty('--theme-dark', config.palette.dark);
  root.style.setProperty('--theme-border-radius', config.borderRadius || '8px');
  root.style.setProperty('--theme-font-family', config.font?.family || 'Inter, Helvetica, Arial, sans-serif');
  
  // Set data-theme attribute for dark mode
  if (config.mode === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (config.mode === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  
  // Store theme in localStorage for quick access
  localStorage.setItem(`theme_${dealerId}`, JSON.stringify(config));
}

/**
 * React hook to fetch and manage dealer theme
 */
export function useDealerTheme(dealerId: string | null | undefined) {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealerId) {
      setLoading(false);
      return;
    }

    // Try localStorage first for instant loading
    const cached = localStorage.getItem(`theme_${dealerId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setTheme(parsed);
        initTheme(dealerId, parsed);
        setLoading(false);
      } catch {
        // Invalid cache, fetch fresh
      }
    }

    // Fetch fresh theme from API
    fetchDealerTheme(dealerId).then((freshTheme) => {
      setTheme(freshTheme);
      initTheme(dealerId, freshTheme);
      setLoading(false);
    });
  }, [dealerId]);

  return { theme, loading, initTheme: () => dealerId && initTheme(dealerId, theme) };
}

/**
 * Get theme from localStorage (synchronous, for SSR-safe access)
 */
export function getCachedTheme(dealerId: string): ThemeConfig | null {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(`theme_${dealerId}`);
  if (!cached) return null;
  
  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}
