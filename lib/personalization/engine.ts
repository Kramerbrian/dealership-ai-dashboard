'use client';

interface PersonalizationContext {
  geo?: {
    city?: string;
    state?: string;
    country?: string;
  };
  referrer?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  device?: {
    type?: 'mobile' | 'desktop' | 'tablet';
    os?: string;
  };
  time?: {
    hour?: number;
    dayOfWeek?: number;
  };
}

interface PersonalizedContent {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  features?: string[];
  pricingFocus?: string;
}

class PersonalizationEngine {
  private context: PersonalizationContext = {};

  async initialize(): Promise<PersonalizationContext> {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      return {};
    }

    // Get geo location (simplified - in production, use IP geolocation API)
    const geo = await this.getGeoLocation();
    
    // Get referrer info
    const referrer = this.getReferrerInfo();
    
    // Get device info
    const device = this.getDeviceInfo();
    
    // Get time info
    const time = this.getTimeInfo();

    this.context = { geo, referrer, device, time };
    return this.context;
  }

  private async getGeoLocation(): Promise<PersonalizationContext['geo']> {
    // In production, use IP geolocation service
    // For now, return mock data
    return {
      city: 'Los Angeles',
      state: 'CA',
      country: 'US'
    };
  }

  private getReferrerInfo(): PersonalizationContext['referrer'] {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;

    // Check URL parameters first
    if (urlParams.get('utm_source')) {
      return {
        source: urlParams.get('utm_source') || undefined,
        medium: urlParams.get('utm_medium') || undefined,
        campaign: urlParams.get('utm_campaign') || undefined
      };
    }

    // Parse referrer
    if (referrer) {
      try {
        const url = new URL(referrer);
        if (url.hostname.includes('google')) {
          return { source: 'google', medium: 'organic' };
        }
        if (url.hostname.includes('facebook')) {
          return { source: 'facebook', medium: 'social' };
        }
        if (url.hostname.includes('linkedin')) {
          return { source: 'linkedin', medium: 'social' };
        }
      } catch {
        // Ignore URL parsing errors
      }
    }

    return { source: 'direct', medium: 'direct' };
  }

  private getDeviceInfo(): PersonalizationContext['device'] {
    if (typeof window === 'undefined') return {};

    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();

    let type: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (width < 768) {
      type = 'mobile';
    } else if (width < 1024) {
      type = 'tablet';
    }

    let os = 'unknown';
    if (userAgent.includes('windows')) os = 'windows';
    else if (userAgent.includes('mac')) os = 'mac';
    else if (userAgent.includes('linux')) os = 'linux';
    else if (userAgent.includes('android')) os = 'android';
    else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'ios';

    return { type, os };
  }

  private getTimeInfo(): PersonalizationContext['time'] {
    const now = new Date();
    return {
      hour: now.getHours(),
      dayOfWeek: now.getDay()
    };
  }

  getPersonalizedContent(): PersonalizedContent {
    const { geo, referrer, device, time } = this.context;

    const content: PersonalizedContent = {};

    // Geo-based personalization
    if (geo?.city && geo?.state) {
      content.headline = `Stop Being Invisible to AI Car Shoppers in ${geo.city}`;
      content.subheadline = `See how you compare to competitors in ${geo.city}, ${geo.state}`;
    }

    // Referrer-based personalization
    if (referrer?.source === 'google' && referrer?.medium === 'cpc') {
      content.ctaText = 'Track Your Ad ROI with AI Visibility';
      content.pricingFocus = 'Maximize your Google Ads ROI by improving AI visibility';
    } else if (referrer?.source === 'facebook' || referrer?.source === 'linkedin') {
      content.ctaText = 'See What Competitors Are Doing';
      content.subheadline = 'Discover how top dealerships dominate AI search results';
    }

    // Device-based personalization
    if (device?.type === 'mobile') {
      content.ctaText = content.ctaText || 'Get Instant Results on Mobile';
      content.features = ['Mobile-optimized dashboard', 'Real-time alerts', 'Quick actions'];
    }

    // Time-based personalization
    if (time?.hour !== undefined) {
      if (time.hour < 12) {
        content.subheadline = content.subheadline || 'Start your day with AI visibility insights';
      } else if (time.hour < 17) {
        content.subheadline = content.subheadline || 'Afternoon check: See how you\'re performing';
      } else {
        content.subheadline = content.subheadline || 'Evening analysis: Plan tomorrow\'s AI strategy';
      }
    }

    return content;
  }

  getContext(): PersonalizationContext {
    return this.context;
  }
}

export const personalizationEngine = new PersonalizationEngine();

