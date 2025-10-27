// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load Google Analytics script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.gtag = function() {
      // eslint-disable-next-line prefer-rest-params
      ;(window as any).dataLayer = (window as any).dataLayer || []
      // eslint-disable-next-line prefer-rest-params
      ;(window as any).dataLayer.push(arguments)
    }

    window.gtag('js', new Date())
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title || document.title,
      page_location: url,
    })
  }
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Business-specific tracking functions
export const trackDealershipAudit = (dealershipId: string, score: number) => {
  trackEvent('audit_completed', 'engagement', dealershipId, score)
}

export const trackTierUpgrade = (fromTier: string, toTier: string, revenue: number) => {
  trackEvent('tier_upgrade', 'conversion', `${fromTier}_to_${toTier}`, revenue)
}

export const trackFeatureUsage = (feature: string, tier: string) => {
  trackEvent('feature_used', 'engagement', feature, undefined)
  trackEvent('feature_used_by_tier', 'engagement', `${feature}_${tier}`, undefined)
}

export const trackCompetitorAnalysis = (competitorCount: number, tier: string) => {
  trackEvent('competitor_analysis', 'engagement', tier, competitorCount)
}

export const trackQuickWinImplementation = (winId: string, impact: number) => {
  trackEvent('quick_win_implemented', 'engagement', winId, impact)
}

export const trackMysteryShop = (shopType: string, score: number) => {
  trackEvent('mystery_shop_completed', 'engagement', shopType, score)
}

// User journey tracking
export const trackUserJourney = (step: string, userId?: string) => {
  trackEvent('user_journey', 'engagement', step, undefined)
  
  if (userId) {
    trackEvent('user_journey_with_id', 'engagement', `${step}_${userId}`, undefined)
  }
}

// Error tracking
export const trackError = (error: string, context: string) => {
  trackEvent('error_occurred', 'error', `${error}_${context}`, undefined)
}

// Performance tracking
export const trackPerformance = (metric: string, value: number) => {
  trackEvent('performance_metric', 'performance', metric, value)
}

// Conversion tracking
export const trackConversion = (conversionType: string, value: number) => {
  trackEvent('conversion', 'conversion', conversionType, value)
}

// A/B testing
export const trackABTest = (testName: string, variant: string) => {
  trackEvent('ab_test', 'experiment', `${testName}_${variant}`, undefined)
}

// User engagement metrics
export const trackEngagement = (action: string, duration?: number) => {
  trackEvent('user_engagement', 'engagement', action, duration)
}

// API usage tracking
export const trackAPIUsage = (endpoint: string, responseTime: number, status: number) => {
  trackEvent('api_usage', 'performance', endpoint, responseTime)
  trackEvent('api_status', 'performance', `${endpoint}_${status}`, undefined)
}
