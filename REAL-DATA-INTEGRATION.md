# DealershipAI Dashboard - Real Data Integration

## 🔌 **Real Data Integration System**

### **Overview**
This system connects the DealershipAI dashboard to real data sources including Google Analytics, Search Console, Google My Business, and other APIs to provide live, actionable insights for dealerships.

## 📊 **Data Sources Integration**

### **1. Google Analytics 4 (GA4)**
```javascript
// Real Google Analytics Integration
class GoogleAnalyticsIntegration {
    constructor(propertyId, apiKey) {
        this.propertyId = propertyId;
        this.apiKey = apiKey;
        this.baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
    }

    async getRealTimeData() {
        const response = await fetch(`${this.baseUrl}/properties/${this.propertyId}/reports:runReport`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'screenPageViews' },
                    { name: 'sessions' }
                ],
                dateRanges: [{ startDate: 'today', endDate: 'today' }]
            })
        });
        return await response.json();
    }

    async getHistoricalData(days = 30) {
        const response = await fetch(`${this.baseUrl}/properties/${this.propertyId}/reports:runReport`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                metrics: [
                    { name: 'sessions' },
                    { name: 'screenPageViews' },
                    { name: 'bounceRate' },
                    { name: 'averageSessionDuration' },
                    { name: 'conversions' }
                ],
                dateRanges: [{ 
                    startDate: `${days}daysAgo`, 
                    endDate: 'today' 
                }],
                dimensions: [{ name: 'date' }]
            })
        });
        return await response.json();
    }
}
```

### **2. Google Search Console**
```javascript
// Real Search Console Integration
class SearchConsoleIntegration {
    constructor(siteUrl, apiKey) {
        this.siteUrl = siteUrl;
        this.apiKey = apiKey;
        this.baseUrl = 'https://www.googleapis.com/webmasters/v3';
    }

    async getSearchPerformance() {
        const response = await fetch(`${this.baseUrl}/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                dimensions: ['query', 'page'],
                rowLimit: 1000,
                startRow: 0
            })
        });
        return await response.json();
    }

    async getCoreWebVitals() {
        const response = await fetch(`${this.baseUrl}/sites/${encodeURIComponent(this.siteUrl)}/urlInspection/index:inspect`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inspectionUrl: this.siteUrl,
                siteUrl: this.siteUrl
            })
        });
        return await response.json();
    }
}
```

### **3. Google My Business**
```javascript
// Real Google My Business Integration
class GoogleMyBusinessIntegration {
    constructor(accountId, locationId, apiKey) {
        this.accountId = accountId;
        this.locationId = locationId;
        this.apiKey = apiKey;
        this.baseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1';
    }

    async getLocationInsights() {
        const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/locations/${this.locationId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    async getReviews() {
        const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/locations/${this.locationId}/reviews`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }
}
```

## 🔧 **API Key Management System**

### **Secure API Key Storage**
```javascript
// Enhanced API Key Management
class SecureAPIKeyManager {
    constructor() {
        this.keys = new Map();
        this.encryptionKey = this.generateEncryptionKey();
    }

    generateEncryptionKey() {
        // Generate a secure encryption key
        return crypto.getRandomValues(new Uint8Array(32));
    }

    async storeAPIKey(service, key) {
        const encryptedKey = await this.encrypt(key);
        this.keys.set(service, encryptedKey);
        localStorage.setItem(`dealershipai_${service}_key`, encryptedKey);
    }

    async getAPIKey(service) {
        if (this.keys.has(service)) {
            return await this.decrypt(this.keys.get(service));
        }
        
        const storedKey = localStorage.getItem(`dealershipai_${service}_key`);
        if (storedKey) {
            const decryptedKey = await this.decrypt(storedKey);
            this.keys.set(service, storedKey);
            return decryptedKey;
        }
        
        return null;
    }

    async encrypt(text) {
        const encodedText = new TextEncoder().encode(text);
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
            await crypto.subtle.importKey('raw', this.encryptionKey, 'AES-GCM', false, ['encrypt']),
            encodedText
        );
        return Array.from(new Uint8Array(encrypted));
    }

    async decrypt(encryptedData) {
        const key = await crypto.subtle.importKey('raw', this.encryptionKey, 'AES-GCM', false, ['decrypt']);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(12) },
            key,
            new Uint8Array(encryptedData)
        );
        return new TextDecoder().decode(decrypted);
    }
}
```

## 📈 **Real-Time Data Processing**

### **Data Processing Pipeline**
```javascript
// Real-time Data Processing System
class RealTimeDataProcessor {
    constructor() {
        this.dataCache = new Map();
        this.updateInterval = 30000; // 30 seconds
        this.processors = new Map();
    }

    registerProcessor(service, processor) {
        this.processors.set(service, processor);
    }

    async processData(service, rawData) {
        const processor = this.processors.get(service);
        if (!processor) {
            throw new Error(`No processor registered for service: ${service}`);
        }

        const processedData = await processor(rawData);
        this.dataCache.set(service, {
            data: processedData,
            timestamp: Date.now(),
            source: service
        });

        return processedData;
    }

    getCachedData(service) {
        const cached = this.dataCache.get(service);
        if (cached && Date.now() - cached.timestamp < this.updateInterval) {
            return cached.data;
        }
        return null;
    }

    async updateAllData() {
        const updatePromises = Array.from(this.processors.keys()).map(async (service) => {
            try {
                const processor = this.processors.get(service);
                const rawData = await processor.fetchData();
                return await this.processData(service, rawData);
            } catch (error) {
                console.error(`Failed to update data for ${service}:`, error);
                return null;
            }
        });

        const results = await Promise.all(updatePromises);
        return results.filter(result => result !== null);
    }
}
```

## 🎯 **Data Visualization Updates**

### **Real Data Dashboard Updates**
```javascript
// Real Data Dashboard Updater
class RealDataDashboardUpdater {
    constructor() {
        this.dataProcessor = new RealTimeDataProcessor();
        this.keyManager = new SecureAPIKeyManager();
        this.setupProcessors();
    }

    setupProcessors() {
        // Google Analytics processor
        this.dataProcessor.registerProcessor('google-analytics', {
            fetchData: async () => {
                const apiKey = await this.keyManager.getAPIKey('google-analytics');
                const ga = new GoogleAnalyticsIntegration('GA_PROPERTY_ID', apiKey);
                return await ga.getHistoricalData(30);
            },
            process: (data) => this.processGoogleAnalyticsData(data)
        });

        // Search Console processor
        this.dataProcessor.registerProcessor('search-console', {
            fetchData: async () => {
                const apiKey = await this.keyManager.getAPIKey('search-console');
                const sc = new SearchConsoleIntegration('https://example.com', apiKey);
                return await sc.getSearchPerformance();
            },
            process: (data) => this.processSearchConsoleData(data)
        });

        // Google My Business processor
        this.dataProcessor.registerProcessor('google-my-business', {
            fetchData: async () => {
                const apiKey = await this.keyManager.getAPIKey('google-my-business');
                const gmb = new GoogleMyBusinessIntegration('ACCOUNT_ID', 'LOCATION_ID', apiKey);
                return await gmb.getLocationInsights();
            },
            process: (data) => this.processGoogleMyBusinessData(data)
        });
    }

    processGoogleAnalyticsData(data) {
        // Process GA4 data into dashboard format
        const metrics = data.rows?.[0]?.metricValues || [];
        return {
            sessions: metrics[0]?.value || 0,
            pageViews: metrics[1]?.value || 0,
            bounceRate: metrics[2]?.value || 0,
            avgSessionDuration: metrics[3]?.value || 0,
            conversions: metrics[4]?.value || 0
        };
    }

    processSearchConsoleData(data) {
        // Process Search Console data
        const rows = data.rows || [];
        return {
            totalClicks: rows.reduce((sum, row) => sum + parseInt(row.clicks), 0),
            totalImpressions: rows.reduce((sum, row) => sum + parseInt(row.impressions), 0),
            averagePosition: rows.reduce((sum, row) => sum + parseFloat(row.position), 0) / rows.length,
            topQueries: rows.slice(0, 10).map(row => ({
                query: row.keys[0],
                clicks: parseInt(row.clicks),
                impressions: parseInt(row.impressions),
                position: parseFloat(row.position)
            }))
        };
    }

    processGoogleMyBusinessData(data) {
        // Process GMB data
        return {
            views: data.insights?.viewCount || 0,
            calls: data.insights?.callCount || 0,
            directions: data.insights?.directionCount || 0,
            websiteClicks: data.insights?.websiteClickCount || 0,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0
        };
    }

    async updateDashboard() {
        try {
            const allData = await this.dataProcessor.updateAllData();
            
            // Update dashboard elements with real data
            this.updateAnalyticsMetrics(allData.find(d => d.source === 'google-analytics'));
            this.updateSearchConsoleMetrics(allData.find(d => d.source === 'search-console'));
            this.updateGoogleMyBusinessMetrics(allData.find(d => d.source === 'google-my-business'));
            
            console.log('✅ Dashboard updated with real data');
        } catch (error) {
            console.error('❌ Failed to update dashboard with real data:', error);
        }
    }

    updateAnalyticsMetrics(data) {
        if (!data) return;
        
        // Update analytics metrics in the dashboard
        document.querySelector('[data-metric="sessions"]')?.textContent = data.sessions.toLocaleString();
        document.querySelector('[data-metric="pageviews"]')?.textContent = data.pageViews.toLocaleString();
        document.querySelector('[data-metric="bounce-rate"]')?.textContent = `${(data.bounceRate * 100).toFixed(1)}%`;
        document.querySelector('[data-metric="avg-session-duration"]')?.textContent = `${Math.round(data.avgSessionDuration / 60)}m`;
        document.querySelector('[data-metric="conversions"]')?.textContent = data.conversions.toLocaleString();
    }

    updateSearchConsoleMetrics(data) {
        if (!data) return;
        
        // Update search console metrics
        document.querySelector('[data-metric="total-clicks"]')?.textContent = data.totalClicks.toLocaleString();
        document.querySelector('[data-metric="total-impressions"]')?.textContent = data.totalImpressions.toLocaleString();
        document.querySelector('[data-metric="avg-position"]')?.textContent = data.averagePosition.toFixed(1);
    }

    updateGoogleMyBusinessMetrics(data) {
        if (!data) return;
        
        // Update GMB metrics
        document.querySelector('[data-metric="gmb-views"]')?.textContent = data.views.toLocaleString();
        document.querySelector('[data-metric="gmb-calls"]')?.textContent = data.calls.toLocaleString();
        document.querySelector('[data-metric="gmb-directions"]')?.textContent = data.directions.toLocaleString();
        document.querySelector('[data-metric="gmb-website-clicks"]')?.textContent = data.websiteClicks.toLocaleString();
        document.querySelector('[data-metric="gmb-rating"]')?.textContent = data.rating.toFixed(1);
        document.querySelector('[data-metric="gmb-review-count"]')?.textContent = data.reviewCount.toLocaleString();
    }
}
```

## 🚀 **Implementation Steps**

### **Step 1: API Key Setup**
1. Create Google Cloud Console project
2. Enable required APIs (Analytics, Search Console, My Business)
3. Create service account and download credentials
4. Configure OAuth 2.0 for user authentication

### **Step 2: Integration Implementation**
1. Add real data integration classes to dashboard
2. Implement secure API key storage
3. Set up data processing pipeline
4. Configure real-time updates

### **Step 3: Testing & Validation**
1. Test with real API credentials
2. Validate data accuracy
3. Test error handling
4. Performance testing

### **Step 4: Production Deployment**
1. Deploy with real data integration
2. Monitor API usage and limits
3. Set up error alerting
4. Configure data backup

## 📋 **API Requirements**

### **Google Analytics 4**
- **API**: Google Analytics Data API v1beta
- **Scopes**: `https://www.googleapis.com/auth/analytics.readonly`
- **Rate Limit**: 10,000 requests per day per project

### **Google Search Console**
- **API**: Search Console API v3
- **Scopes**: `https://www.googleapis.com/auth/webmasters.readonly`
- **Rate Limit**: 1,000 requests per day per user

### **Google My Business**
- **API**: My Business Business Information API v1
- **Scopes**: `https://www.googleapis.com/auth/business.manage`
- **Rate Limit**: 1,000 requests per day per user

## 🔒 **Security Considerations**

1. **API Key Encryption**: All keys encrypted at rest
2. **Secure Transmission**: HTTPS only for all API calls
3. **Access Control**: User-based API key management
4. **Rate Limiting**: Implement client-side rate limiting
5. **Error Handling**: No sensitive data in error messages
6. **Audit Logging**: Log all API access and data changes
