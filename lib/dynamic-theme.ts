// Dynamic theme switching based on TSM (Trust Score Multiplier) values
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    warning: string;
    error: string;
  };
  mode: 'normal' | 'defensive' | 'critical';
}

export const themeConfigs: Record<string, ThemeConfig> = {
  normal: {
    name: 'Normal Mode',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#0f172a',
      surface: 'rgba(255,255,255,0.04)',
      text: '#ffffff',
      accent: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    mode: 'normal'
  },
  defensive: {
    name: 'Defensive Mode',
    colors: {
      primary: '#f59e0b',
      secondary: '#ef4444',
      background: '#1c1917',
      surface: 'rgba(245,158,11,0.1)',
      text: '#fef3c7',
      accent: '#fbbf24',
      warning: '#dc2626',
      error: '#991b1b'
    },
    mode: 'defensive'
  },
  critical: {
    name: 'Critical Mode',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      background: '#1f1f1f',
      surface: 'rgba(239,68,68,0.15)',
      text: '#fecaca',
      accent: '#f87171',
      warning: '#991b1b',
      error: '#7f1d1d'
    },
    mode: 'critical'
  }
};

export class DynamicThemeManager {
  private currentTheme: ThemeConfig = themeConfigs.normal;
  private listeners: Function[] = [];

  public getCurrentTheme(): ThemeConfig {
    return this.currentTheme;
  }

  public updateTheme(tsm: number, additionalFactors?: {
    anomalyDetected?: boolean;
    criticalAlerts?: number;
    systemHealth?: number;
  }) {
    let newTheme: ThemeConfig;

    // Determine theme based on TSM and additional factors
    if (tsm > 1.5 || (additionalFactors?.criticalAlerts || 0) > 3) {
      newTheme = themeConfigs.critical;
    } else if (tsm > 1.2 || additionalFactors?.anomalyDetected || (additionalFactors?.systemHealth || 1) < 0.7) {
      newTheme = themeConfigs.defensive;
    } else {
      newTheme = themeConfigs.normal;
    }

    if (newTheme.name !== this.currentTheme.name) {
      this.currentTheme = newTheme;
      this.applyTheme(newTheme);
      this.notifyListeners(newTheme);
    }
  }

  private applyTheme(theme: ThemeConfig) {
    if (typeof document === 'undefined') return; // SSR safety

    const root = document.documentElement;

    // Apply CSS custom properties (legacy theme system)
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-warning', theme.colors.warning);
    root.style.setProperty('--theme-error', theme.colors.error);

    // Also update mood-based theme variables for consistency
    // Extract RGB from hex primary color for --accent-rgb
    const primaryRgb = this.hexToRgb(theme.colors.primary);
    if (primaryRgb) {
      root.style.setProperty('--accent-rgb', primaryRgb);
      root.style.setProperty('--accent-glow', `rgba(${primaryRgb}, 0.15)`);
    }

    // Update body classes for Tailwind
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.mode}`);

    // Add visual indicator
    this.showThemeIndicator(theme);
  }

  private hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
      : null;
  }

  private showThemeIndicator(theme: ThemeConfig) {
    // Remove existing indicator
    const existing = document.getElementById('theme-indicator');
    if (existing) {
      existing.remove();
    }

    // Create new indicator
    const indicator = document.createElement('div');
    indicator.id = 'theme-indicator';
    indicator.className = 'fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300';
    indicator.style.backgroundColor = theme.colors.primary;
    indicator.style.color = theme.colors.text;
    indicator.textContent = `🎨 ${theme.name}`;

    document.body.appendChild(indicator);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(-10px)';
        setTimeout(() => indicator.remove(), 300);
      }
    }, 3000);
  }

  public subscribe(callback: Function) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(theme: ThemeConfig) {
    this.listeners.forEach(callback => callback(theme));
  }

  public getThemeForTSM(tsm: number): ThemeConfig {
    if (tsm > 1.5) return themeConfigs.critical;
    if (tsm > 1.2) return themeConfigs.defensive;
    return themeConfigs.normal;
  }

  public getThemeRecommendations(tsm: number): string[] {
    const recommendations: string[] = [];
    
    if (tsm > 1.2) {
      recommendations.push('🚨 High TSM detected - switching to defensive mode');
      recommendations.push('📊 Review recent metric changes');
      recommendations.push('🔧 Consider running diagnostic sweep');
    }
    
    if (tsm > 1.5) {
      recommendations.push('⚠️ Critical TSM level - immediate attention required');
      recommendations.push('🚨 Execute emergency playbooks');
      recommendations.push('📞 Consider manual intervention');
    }

    return recommendations;
  }
}

// Singleton instance
export const dynamicTheme = new DynamicThemeManager();

// React hook for theme updates
export function useDynamicTheme() {
  const { useState, useEffect } = require('react');
  
  const [theme, setTheme] = useState(dynamicTheme.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = dynamicTheme.subscribe(setTheme);
    return unsubscribe;
  }, []);

  return {
    theme,
    updateTheme: (tsm: number, factors?: any) => dynamicTheme.updateTheme(tsm, factors),
    getRecommendations: (tsm: number) => dynamicTheme.getThemeRecommendations(tsm)
  };
}
