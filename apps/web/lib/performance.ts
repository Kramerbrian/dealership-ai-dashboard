// Performance optimization utilities for DealershipAI Dashboard

import { trackSLO } from './slo';

// Debounce function for API calls and user input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for scroll events and animations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

// Virtual scrolling for large lists
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export class VirtualScroller {
  private container: HTMLElement;
  private options: VirtualScrollOptions;
  private scrollTop = 0;
  private totalItems = 0;
  private onScroll: (() => void) | null = null;

  constructor(container: HTMLElement, options: VirtualScrollOptions) {
    this.container = container;
    this.options = { overscan: 5, ...options };
    this.setupScrollListener();
  }

  private setupScrollListener() {
    this.onScroll = throttle(() => {
      this.scrollTop = this.container.scrollTop;
      this.updateVisibleItems();
    }, 16); // ~60fps

    this.container.addEventListener('scroll', this.onScroll);
  }

  private updateVisibleItems() {
    const { itemHeight, containerHeight, overscan = 5 } = this.options;
    
    const startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      this.totalItems - 1,
      Math.ceil((this.scrollTop + containerHeight) / itemHeight) + overscan
    );

    // Dispatch custom event with visible range
    this.container.dispatchEvent(new CustomEvent('virtual-scroll-update', {
      detail: { startIndex, endIndex, totalItems: this.totalItems }
    }));
  }

  public setTotalItems(count: number) {
    this.totalItems = count;
    this.updateVisibleItems();
  }

  public destroy() {
    if (this.onScroll) {
      this.container.removeEventListener('scroll', this.onScroll);
    }
  }
}

// Image lazy loading with intersection observer
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private images: Map<HTMLImageElement, string> = new Map();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = this.images.get(img);
        
        if (src) {
          img.src = src;
          img.classList.remove('lazy');
          this.observer.unobserve(img);
          this.images.delete(img);
        }
      }
    });
  }

  public observe(img: HTMLImageElement, src: string) {
    this.images.set(img, src);
    this.observer.observe(img);
  }

  public unobserve(img: HTMLImageElement) {
    this.observer.unobserve(img);
    this.images.delete(img);
  }

  public destroy() {
    this.observer.disconnect();
    this.images.clear();
  }
}

// Code splitting utilities
export function loadComponent<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
): Promise<React.ComponentType<T>> {
  return importFn().then(module => module.default);
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null;

  const scripts = Array.from(document.scripts);
  const stylesheets = Array.from(document.styleSheets);
  
  const analysis = {
    scripts: scripts.map(script => ({
      src: script.src,
      size: script.textContent?.length || 0
    })),
    stylesheets: stylesheets.map(sheet => ({
      href: sheet.href,
      rules: sheet.cssRules?.length || 0
    })),
    totalScriptSize: scripts.reduce((total, script) => 
      total + (script.textContent?.length || 0), 0
    ),
    totalStyleRules: stylesheets.reduce((total, sheet) => 
      total + (sheet.cssRules?.length || 0), 0
    )
  };

  return analysis;
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.setupObservers();
  }

  private setupObservers() {
    // Long Task Observer
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.recordMetric('long-tasks', entry.duration);
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Layout Shift Observer
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              this.recordMetric('layout-shifts', (entry as any).value);
            }
          });
        });
        
        try {
          layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
          this.observers.push(layoutShiftObserver);
        } catch (e) {
          console.warn('Layout shift observer not supported');
        }
      }
    }
  }

  public recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  public getMetricStats(name: string) {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      count: len,
      min: sorted[0],
      max: sorted[len - 1],
      avg: values.reduce((sum, val) => sum + val, 0) / len,
      p50: sorted[Math.floor(len * 0.5)],
      p75: sorted[Math.floor(len * 0.75)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    };
  }

  public getAllMetrics() {
    const result: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    
    return result;
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  
  return {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
  };
}

// Network performance monitoring
export function getNetworkInfo() {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return null;
  }

  const connection = (navigator as any).connection;

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
}

// Critical resource hints
export function addResourceHints() {
  if (typeof document === 'undefined') return;

  // Preconnect to external domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.dealershipai.com'
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Preload critical resources
  const criticalResources = [
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
    { href: '/api/dashboard/overview', as: 'fetch', crossorigin: 'anonymous' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    Object.entries(resource).forEach(([key, value]) => {
      link.setAttribute(key, value);
    });
    document.head.appendChild(link);
  });
}

// Service Worker registration for caching
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private budgets: Map<string, number> = new Map();
  private violations: Array<{ metric: string; actual: number; budget: number; timestamp: number }> = [];

  constructor() {
    // Set default budgets
    this.setBudget('fcp', 1800); // First Contentful Paint
    this.setBudget('lcp', 2500); // Largest Contentful Paint
    this.setBudget('fid', 100);  // First Input Delay
    this.setBudget('cls', 0.1);  // Cumulative Layout Shift
    this.setBudget('ttfb', 600); // Time to First Byte
  }

  public setBudget(metric: string, budget: number) {
    this.budgets.set(metric, budget);
  }

  public checkBudget(metric: string, actual: number): boolean {
    const budget = this.budgets.get(metric);
    if (!budget) return true;

    const passed = actual <= budget;
    
    if (!passed) {
      this.violations.push({
        metric,
        actual,
        budget,
        timestamp: Date.now()
      });
      
      // Track SLO violation
      trackSLO(`budget.${metric}`, actual);
    }

    return passed;
  }

  public getViolations() {
    return this.violations;
  }

  public getBudgetStatus() {
    const status: Record<string, { budget: number; violations: number }> = {};
    
    for (const [metric, budget] of this.budgets) {
      const violations = this.violations.filter(v => v.metric === metric).length;
      status[metric] = { budget, violations };
    }
    
    return status;
  }
}