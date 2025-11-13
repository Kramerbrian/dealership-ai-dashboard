/**
 * Google Analytics Configuration and Event Tracking
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
interface GTagEvent {
  action: string
  category: string
  label?: string
  value?: number
}

export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Predefined event functions
export const trackFormSubmit = (formName: string) => {
  event({
    action: 'submit',
    category: 'Form',
    label: formName,
  })
}

export const trackButtonClick = (buttonName: string) => {
  event({
    action: 'click',
    category: 'Button',
    label: buttonName,
  })
}

export const trackLeadCapture = (source: string) => {
  event({
    action: 'lead_captured',
    category: 'Lead',
    label: source,
    value: 1,
  })
}

export const trackPricingView = (plan: string) => {
  event({
    action: 'view',
    category: 'Pricing',
    label: plan,
  })
}

export const trackSignupStart = (plan: string) => {
  event({
    action: 'signup_start',
    category: 'Conversion',
    label: plan,
  })
}

export const trackDashboardView = () => {
  event({
    action: 'view',
    category: 'Dashboard',
    label: 'dashboard_opened',
  })
}
