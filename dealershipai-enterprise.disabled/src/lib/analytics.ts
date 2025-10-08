// Analytics integration for DealershipAI
// Handles Mixpanel and Google Analytics tracking

import mixpanel from 'mixpanel-browser'

// Initialize Mixpanel
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage'
  })
}

// Google Analytics integration
export const initGA = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
    // Load Google Analytics script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', process.env.NEXT_PUBLIC_GA_ID)

    // Make gtag available globally
    ;(window as any).gtag = gtag
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  // Mixpanel
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    mixpanel.track('Page View', {
      url,
      title: title || document.title,
      timestamp: new Date().toISOString()
    })
  }

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
      page_title: title || document.title
    })
  }
}

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Mixpanel
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, {
      event_category: properties?.category || 'engagement',
      event_label: properties?.label,
      value: properties?.value,
      ...properties
    })
  }
}

// Track lead capture
export const trackLeadCapture = (leadData: {
  email: string
  source: string
  dealership_size?: string
  challenges?: string[]
}) => {
  trackEvent('Lead Captured', {
    category: 'conversion',
    email: leadData.email,
    source: leadData.source,
    dealership_size: leadData.dealership_size,
    challenges: leadData.challenges,
    value: 1
  })
}

// Track CTA clicks
export const trackCTAClick = (ctaText: string, location: string) => {
  trackEvent('CTA Clicked', {
    category: 'engagement',
    cta_text: ctaText,
    location,
    value: 1
  })
}

// Track feature usage
export const trackFeatureUsage = (feature: string, action: string, properties?: Record<string, any>) => {
  trackEvent('Feature Used', {
    category: 'feature_usage',
    feature,
    action,
    ...properties
  })
}

// Track dashboard interactions
export const trackDashboardInteraction = (interaction: string, properties?: Record<string, any>) => {
  trackEvent('Dashboard Interaction', {
    category: 'dashboard',
    interaction,
    ...properties
  })
}

// Track scoring system usage
export const trackScoringUsage = (scoreType: string, score: number, properties?: Record<string, any>) => {
  trackEvent('Score Generated', {
    category: 'scoring',
    score_type: scoreType,
    score,
    ...properties
  })
}

// Track API usage
export const trackAPIUsage = (endpoint: string, method: string, responseTime?: number) => {
  trackEvent('API Usage', {
    category: 'api',
    endpoint,
    method,
    response_time: responseTime,
    timestamp: new Date().toISOString()
  })
}

// Track errors
export const trackError = (error: string, context?: string, properties?: Record<string, any>) => {
  trackEvent('Error Occurred', {
    category: 'error',
    error_message: error,
    context,
    ...properties
  })
}

// Track user engagement
export const trackEngagement = (engagementType: string, duration?: number, properties?: Record<string, any>) => {
  trackEvent('User Engagement', {
    category: 'engagement',
    engagement_type: engagementType,
    duration,
    ...properties
  })
}

// Track conversion funnel
export const trackFunnelStep = (step: string, stepNumber: number, properties?: Record<string, any>) => {
  trackEvent('Funnel Step', {
    category: 'conversion',
    funnel_step: step,
    step_number: stepNumber,
    ...properties
  })
}

// Track A/B test participation
export const trackABTest = (testName: string, variant: string, properties?: Record<string, any>) => {
  trackEvent('A/B Test', {
    category: 'experiment',
    test_name: testName,
    variant,
    ...properties
  })
}

// Track performance metrics
export const trackPerformance = (metric: string, value: number, properties?: Record<string, any>) => {
  trackEvent('Performance Metric', {
    category: 'performance',
    metric,
    value,
    ...properties
  })
}

// Track user properties
export const setUserProperties = (properties: Record<string, any>) => {
  // Mixpanel
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    mixpanel.people.set(properties)
  }

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      custom_map: properties
    })
  }
}

// Track user identification
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  // Mixpanel
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    mixpanel.identify(userId)
    if (properties) {
      mixpanel.people.set(properties)
    }
  }

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      user_id: userId,
      ...properties
    })
  }
}

// Track revenue
export const trackRevenue = (amount: number, currency: string = 'USD', properties?: Record<string, any>) => {
  trackEvent('Revenue', {
    category: 'revenue',
    value: amount,
    currency,
    ...properties
  })
}

// Track subscription events
export const trackSubscription = (event: string, plan: string, properties?: Record<string, any>) => {
  trackEvent('Subscription', {
    category: 'subscription',
    subscription_event: event,
    plan,
    ...properties
  })
}

// Export default analytics object
export const analytics = {
  initGA,
  trackPageView,
  trackEvent,
  trackLeadCapture,
  trackCTAClick,
  trackFeatureUsage,
  trackDashboardInteraction,
  trackScoringUsage,
  trackAPIUsage,
  trackError,
  trackEngagement,
  trackFunnelStep,
  trackABTest,
  trackPerformance,
  setUserProperties,
  identifyUser,
  trackRevenue,
  trackSubscription
}

export default analytics
