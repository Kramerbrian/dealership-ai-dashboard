/**
 * Google Analytics 4 Configuration
 * DealershipAI Analytics Setup
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';

// Track critical PLG events
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, params);
};

// Track conversion funnel steps
export const trackFunnel = (step: string, params?: Record<string, any>) => {
  trackEvent('funnel_step', {
    event_category: 'Funnel',
    event_label: step,
    ...params
  });
};

// Track viral share events
export const trackShare = (platform: string, feature: string) => {
  trackEvent('share_completed', {
    event_category: 'Share',
    platform,
    feature_name: feature
  });
};

// Track audit completion
export const trackAudit = (score: number, metrics: Record<string, number>) => {
  trackEvent('audit_complete', {
    event_category: 'Audit',
    value: score,
    ...metrics
  });
};

// Initialize GA4
export const initGA = () => {
  if (typeof window === 'undefined' || GA_MEASUREMENT_ID === '') return;
  
  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

