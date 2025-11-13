/**
 * Dealer Settings Types
 *
 * Comprehensive settings structure for dealer integrations and tracking
 */

export interface DealerSettings {
  dealerId: string;

  // Analytics & Tracking
  analytics: {
    googleAnalytics: {
      enabled: boolean;
      measurementId: string; // GA4: G-XXXXXXXXXX
      propertyId?: string; // Universal Analytics (legacy)
    };
    googleTagManager: {
      enabled: boolean;
      containerId: string; // GTM-XXXXXXX
    };
    facebookPixel: {
      enabled: boolean;
      pixelId: string;
    };
    tiktokPixel: {
      enabled: boolean;
      pixelId: string;
    };
    linkedInInsightTag: {
      enabled: boolean;
      partnerId: string;
    };
    microsoftClarity: {
      enabled: boolean;
      projectId: string;
    };
    hotjar: {
      enabled: boolean;
      siteId: string;
    };
  };

  // Google Business Profile
  googleBusinessProfile: {
    enabled: boolean;
    placeId: string; // Google Place ID
    locationId?: string; // GBP Location ID
    apiKey?: string; // For API access
    cid?: string; // Customer ID
  };

  // Google Services
  google: {
    searchConsole: {
      enabled: boolean;
      siteUrl: string;
      verificationCode?: string;
    };
    ads: {
      enabled: boolean;
      customerId: string; // Google Ads Customer ID
      conversionId?: string;
      conversionLabel?: string;
    };
  };

  // Social Media
  social: {
    facebook: {
      enabled: boolean;
      pageId?: string;
      accessToken?: string; // For API access
    };
    instagram: {
      enabled: boolean;
      businessAccountId?: string;
      accessToken?: string;
    };
    twitter: {
      enabled: boolean;
      username?: string;
    };
    linkedin: {
      enabled: boolean;
      companyId?: string;
    };
    youtube: {
      enabled: boolean;
      channelId?: string;
    };
  };

  // CRM & Marketing
  crm: {
    hubspot: {
      enabled: boolean;
      portalId?: string;
      accessToken?: string;
    };
    salesforce: {
      enabled: boolean;
      instanceUrl?: string;
      clientId?: string;
      clientSecret?: string;
    };
    activeCampaign: {
      enabled: boolean;
      apiUrl?: string;
      apiKey?: string;
    };
  };

  // Automotive Specific
  automotive: {
    vinsolutions: {
      enabled: boolean;
      dealerId?: string;
      apiKey?: string;
    };
    dealerSocket: {
      enabled: boolean;
      dealerId?: string;
      apiKey?: string;
    };
    eleadCRM: {
      enabled: boolean;
      dealerId?: string;
      apiKey?: string;
    };
    cdk: {
      enabled: boolean;
      siteId?: string;
    };
    reynoldsReynolds: {
      enabled: boolean;
      dealerId?: string;
    };
  };

  // Review Platforms
  reviews: {
    googleReviews: {
      enabled: boolean;
      autoMonitor: boolean;
      autoRespond: boolean;
    };
    yelp: {
      enabled: boolean;
      businessId?: string;
      apiKey?: string;
    };
    dealerRater: {
      enabled: boolean;
      dealerId?: string;
    };
    carscom: {
      enabled: boolean;
      dealerId?: string;
    };
    edmunds: {
      enabled: boolean;
      dealerId?: string;
    };
  };

  // Other Integrations
  integrations: {
    zapier: {
      enabled: boolean;
      webhookUrl?: string;
    };
    slack: {
      enabled: boolean;
      webhookUrl?: string;
      channel?: string;
    };
    email: {
      provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
      apiKey?: string;
      fromEmail?: string;
      fromName?: string;
    };
  };

  // Metadata
  updatedAt: string;
  updatedBy?: string;
}

export interface SettingsUpdateRequest {
  dealerId: string;
  section: keyof DealerSettings;
  data: any;
}

export interface IntegrationStatus {
  name: string;
  enabled: boolean;
  configured: boolean;
  lastSync?: string;
  status: 'active' | 'error' | 'pending' | 'disabled';
  message?: string;
}
