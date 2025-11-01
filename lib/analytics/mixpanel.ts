import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

if (typeof window !== 'undefined' && MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  });
}

/**
 * Track event in Mixpanel
 */
export function track(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, properties);
    }
    return;
  }

  try {
    mixpanel.track(eventName, properties);
  } catch (error) {
    console.error('Mixpanel track error:', error);
  }
}

/**
 * Identify user in Mixpanel
 */
export function identify(userId: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN) return;

  try {
    mixpanel.identify(userId);
    if (properties) {
      mixpanel.people.set(properties);
    }
  } catch (error) {
    console.error('Mixpanel identify error:', error);
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN) return;

  try {
    mixpanel.people.set(properties);
  } catch (error) {
    console.error('Mixpanel set properties error:', error);
  }
}

/**
 * Reset (on logout)
 */
export function reset() {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN) return;

  try {
    mixpanel.reset();
  } catch (error) {
    console.error('Mixpanel reset error:', error);
  }
}

export default {
  track,
  identify,
  setUserProperties,
  reset,
};
