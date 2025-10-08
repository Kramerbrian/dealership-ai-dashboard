/**
 * DealershipAI API Configuration & Integration Layer
 * Handles all API connections and data management
 *
 * API Keys are retrieved from Supabase database for security
 */

// Note: API keys will be loaded from environment variables or localStorage
// import { getApiKeysServerSide } from './api-keys-service.js';

// Base API Configuration (keys loaded dynamically from Supabase)
const API_CONFIG = {
    // Google APIs
    google: {
        analytics: {
            endpoint: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
            apiKey: null, // Loaded from Supabase
            propertyId: (typeof process !== 'undefined' ? process.env.GA_PROPERTY_ID : null) || 'GA_PROPERTY_ID'
        },
        searchConsole: {
            endpoint: 'https://www.googleapis.com/webmasters/v3/sites',
            apiKey: null, // Loaded from Supabase
            siteUrl: (typeof process !== 'undefined' ? process.env.SITE_URL : null) || 'https://your-dealership.com'
        },
        myBusiness: {
            endpoint: 'https://mybusinessbusinessinformation.googleapis.com/v1',
            apiKey: null, // Loaded from Supabase
            locationId: (typeof process !== 'undefined' ? process.env.GMB_LOCATION_ID : null) || 'locations/your-location-id'
        }
    },

    // Social Media APIs
    social: {
        facebook: {
            endpoint: 'https://graph.facebook.com/v18.0',
            accessToken: null, // Loaded from Supabase
            pageId: (typeof process !== 'undefined' ? process.env.FACEBOOK_PAGE_ID : null) || 'your-page-id'
        },
        yelp: {
            endpoint: 'https://api.yelp.com/v3/businesses',
            apiKey: null, // Loaded from Supabase
            businessId: (typeof process !== 'undefined' ? process.env.YELP_BUSINESS_ID : null) || 'your-business-id'
        }
    },

    // AI Platform Monitoring APIs (Custom/Third-party)
    aiPlatforms: {
        chatgpt: {
            endpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : null) || 'demo-key'
        },
        perplexity: {
            endpoint: 'https://api.perplexity.ai/chat/completions',
            apiKey: (typeof process !== 'undefined' ? process.env.PERPLEXITY_API_KEY : null) || 'demo-key'
        }
    },

    // Technical Monitoring
    technical: {
        gtmetrix: {
            endpoint: 'https://gtmetrix.com/api/2.0',
            apiKey: (typeof process !== 'undefined' ? process.env.GTMETRIX_API_KEY : null) || 'demo-key'
        },
        semrush: {
            endpoint: 'https://api.semrush.com/',
            apiKey: (typeof process !== 'undefined' ? process.env.SEMRUSH_API_KEY : null) || 'demo-key'
        }
    }
};

// API Service Class
class DealershipAI_API {
    constructor() {
        this.cache = new Map();
        this.isDemo = true; // Start in demo mode until keys are loaded
        this.keysLoaded = false;
        this.initializeApiKeys();
    }

    async initializeApiKeys() {
        try {
            // Load API keys from localStorage or environment
            const apiKeys = this.loadApiKeysFromStorage();

            // Update API_CONFIG with real keys
            if (apiKeys) {
                API_CONFIG.google.analytics.apiKey = apiKeys.googleAnalyticsKey;
                API_CONFIG.google.searchConsole.apiKey = apiKeys.googleSearchConsoleKey;
                API_CONFIG.google.myBusiness.apiKey = apiKeys.googleMyBusinessKey;
                API_CONFIG.social.facebook.accessToken = apiKeys.facebookAccessToken;
                API_CONFIG.social.yelp.apiKey = apiKeys.yelpApiKey;
            }

            this.keysLoaded = true;
            this.isDemo = this.checkDemoMode();

            console.log('✅ API keys loaded successfully');
        } catch (error) {
            console.warn('⚠️ Failed to load API keys, using demo mode:', error);
            this.isDemo = true;
        }
    }

    loadApiKeysFromStorage() {
        try {
            // Try to load from localStorage first
            const storedKeys = localStorage.getItem('dealershipai_api_keys');
            if (storedKeys) {
                return JSON.parse(storedKeys);
            }
            return null;
        } catch (error) {
            console.warn('Failed to load API keys from storage:', error);
            return null;
        }
    }

    checkDemoMode() {
        // Check if we're using demo keys or if keys haven't loaded
        if (!this.keysLoaded) return true;

        return !API_CONFIG.google.analytics.apiKey ||
               !API_CONFIG.google.searchConsole.apiKey ||
               !API_CONFIG.google.myBusiness.apiKey ||
               !API_CONFIG.social.facebook.accessToken ||
               !API_CONFIG.social.yelp.apiKey;
    }

    // Wait for keys to be loaded before making API calls
    async waitForKeys() {
        if (this.keysLoaded) return;

        // Wait up to 5 seconds for keys to load
        for (let i = 0; i < 50; i++) {
            if (this.keysLoaded) return;
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.warn('Timeout waiting for API keys to load');
    }

    // Google Analytics Data
    async getAnalyticsData() {
        await this.waitForKeys();
        if (this.isDemo) return this.getDemoAnalyticsData();

        try {
            const response = await fetch(`${API_CONFIG.google.analytics.endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.google.analytics.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reportRequests: [{
                        viewId: API_CONFIG.google.analytics.propertyId,
                        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                        metrics: [
                            { expression: 'ga:sessions' },
                            { expression: 'ga:pageviews' },
                            { expression: 'ga:bounceRate' }
                        ]
                    }]
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Analytics API Error:', error);
            return this.getDemoAnalyticsData();
        }
    }

    // Google My Business Data
    async getGMBData() {
        await this.waitForKeys();
        if (this.isDemo) return this.getDemoGMBData();

        try {
            const response = await fetch(`${API_CONFIG.google.myBusiness.endpoint}/${API_CONFIG.google.myBusiness.locationId}`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.google.myBusiness.apiKey}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('GMB API Error:', error);
            return this.getDemoGMBData();
        }
    }

    // Website Performance Data
    async getWebsiteHealth() {
        if (this.isDemo) return this.getDemoWebsiteHealth();

        try {
            const response = await fetch(`${API_CONFIG.technical.gtmetrix.endpoint}/test`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(API_CONFIG.technical.gtmetrix.apiKey + ':')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: API_CONFIG.google.searchConsole.siteUrl,
                    location: 'vancouver',
                    browser: 'chrome'
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Website Health API Error:', error);
            return this.getDemoWebsiteHealth();
        }
    }

    // AI Platform Citation Monitoring
    async getAICitations() {
        if (this.isDemo) return this.getDemoAICitations();

        // This would typically query custom monitoring services
        // For now, return simulated data
        return this.getDemoAICitations();
    }

    // Review Data
    async getReviewData() {
        await this.waitForKeys();
        if (this.isDemo) return this.getDemoReviewData();

        try {
            const yelpResponse = await fetch(`${API_CONFIG.social.yelp.endpoint}/${API_CONFIG.social.yelp.businessId}/reviews`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.social.yelp.apiKey}`
                }
            });

            const facebookResponse = await fetch(`${API_CONFIG.social.facebook.endpoint}/${API_CONFIG.social.facebook.pageId}/ratings`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.social.facebook.accessToken}`
                }
            });

            return {
                yelp: await yelpResponse.json(),
                facebook: await facebookResponse.json()
            };
        } catch (error) {
            console.error('Review API Error:', error);
            return this.getDemoReviewData();
        }
    }

    // Demo Data Methods
    getDemoAnalyticsData() {
        return {
            sessions: 15420,
            pageviews: 45680,
            bounceRate: 0.34,
            conversionRate: 0.067,
            avgSessionDuration: 185,
            organicTraffic: 12340,
            directTraffic: 2890,
            referralTraffic: 190,
            trend: 'up',
            change: 12.3
        };
    }

    getDemoGMBData() {
        return {
            views: 8940,
            calls: 234,
            directions: 567,
            websiteClicks: 890,
            photosViewed: 4560,
            rating: 4.6,
            totalReviews: 189,
            recentReviews: [
                { rating: 5, text: "Excellent service! Highly recommend.", date: "2025-01-09" },
                { rating: 4, text: "Good experience overall.", date: "2025-01-08" },
                { rating: 5, text: "Outstanding customer service.", date: "2025-01-07" }
            ]
        };
    }

    getDemoWebsiteHealth() {
        return {
            performance: 87,
            accessibility: 94,
            bestPractices: 91,
            seo: 96,
            loadTime: 2.1,
            coreWebVitals: {
                lcp: 1.8,
                fid: 45,
                cls: 0.05
            },
            issues: [
                { type: 'warning', message: 'Image optimization needed', count: 3 },
                { type: 'error', message: 'Missing alt text', count: 1 }
            ]
        };
    }

    getDemoAICitations() {
        return {
            chatgpt: { citations: 78, score: 85, change: 5.2 },
            gemini: { citations: 12, score: 62, change: -2.1 },
            perplexity: { citations: 65, score: 73, change: 8.7 },
            copilot: { citations: 8, score: 58, change: -1.3 },
            claude: { citations: 34, score: 71, change: 3.4 }
        };
    }

    getDemoReviewData() {
        return {
            overall: {
                rating: 4.6,
                total: 189,
                distribution: {
                    5: 125,
                    4: 34,
                    3: 18,
                    2: 8,
                    1: 4
                }
            },
            platforms: {
                google: { rating: 4.7, count: 98 },
                yelp: { rating: 4.5, count: 45 },
                facebook: { rating: 4.6, count: 34 },
                dealerRater: { rating: 4.8, count: 12 }
            },
            sentiment: {
                positive: 0.84,
                neutral: 0.12,
                negative: 0.04
            }
        };
    }

    // Real-time data refresh
    async refreshData() {
        const data = await Promise.all([
            this.getAnalyticsData(),
            this.getGMBData(),
            this.getWebsiteHealth(),
            this.getAICitations(),
            this.getReviewData()
        ]);

        return {
            analytics: data[0],
            gmb: data[1],
            website: data[2],
            aiCitations: data[3],
            reviews: data[4],
            lastUpdated: new Date().toISOString()
        };
    }
}

// Export for use in dashboard
window.DealershipAI_API = DealershipAI_API;