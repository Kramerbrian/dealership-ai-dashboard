# DealershipAI API Integration Guide

## 🚀 Complete API System Overview

This guide covers the comprehensive API system built for DealershipAI, including all external service integrations, data services, and testing utilities.

## 📊 Cost Analysis

| Service              | Requests/Day | Cost/Month | Status |
|----------------------|--------------|------------|---------|
| Google Analytics     | 100          | Free       | ✅ Ready |
| PageSpeed            | 50           | Free       | ✅ Ready |
| Google Business      | 200          | Free       | ✅ Ready |
| SEMrush              | 100          | $99-199    | ✅ Ready |
| Yelp                 | 50           | Free       | ✅ Ready |
| OpenAI (GPT-4)       | 20           | ~$15       | ✅ Ready |
| **Total**            | **520**      | **$114-214** | **✅ Ready** |

## 🏗️ Architecture

```
Frontend (React/Next.js)
    ↓
DataService Layer
    ↓
API Client (APIClient)
    ↓
Vercel API Routes
    ↓
External APIs (Google, SEMrush, Yelp, OpenAI)
```

## 📁 File Structure

```
src/lib/services/
├── DataService.ts           # Main data service
├── APIClient.ts            # HTTP client utility
├── GoogleAuth.ts           # OAuth authentication
└── DashboardDataService.ts # Dashboard-specific data

app/api/
├── analytics/route.ts      # Google Analytics API
├── pagespeed/route.ts      # PageSpeed Insights API
├── semrush/route.ts        # SEMrush API
├── yelp/route.ts           # Yelp API
├── ai-citations/route.ts   # AI Citations API
└── oauth/google/route.ts   # Google OAuth

scripts/
└── test-api.js            # Comprehensive test suite
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install googleapis
```

### 2. Environment Configuration

Copy `env-template.txt` to `.env.local`:

```bash
cp env-template.txt .env.local
```

Fill in your API keys:

```env
# Google Services
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
PAGESPEED_API_KEY=your_pagespeed_key

# SEO Tools
SEMRUSH_API_KEY=your_semrush_key

# Review Platforms
YELP_API_KEY=your_yelp_key

# AI Services
OPENAI_API_KEY=sk-your_key_here
```

### 3. Test the System

```bash
# Test all APIs
npm run test:api

# Test individual services
npm run test:analytics
npm run test:pagespeed
npm run test:semrush
npm run test:yelp
npm run test:ai-citations
```

## 📡 API Endpoints

### Analytics API

**GET/POST** `/api/analytics`

```typescript
// Request
{
  "propertyId": "123456789",
  "startDate": "7daysAgo",
  "endDate": "today",
  "metrics": [
    { "name": "sessions" },
    { "name": "users" },
    { "name": "pageviews" }
  ]
}

// Response
{
  "success": true,
  "data": {
    "rowCount": 7,
    "rows": [...]
  }
}
```

### PageSpeed API

**GET** `/api/pagespeed?url=https://example.com&strategy=mobile`

```typescript
// Response
{
  "success": true,
  "data": {
    "score": 87,
    "metrics": {
      "fcp": "1.2s",
      "lcp": "2.1s",
      "cls": "0.05"
    },
    "opportunities": [...]
  }
}
```

### SEMrush API

**GET** `/api/semrush?domain=example.com&type=domain_ranks`

```typescript
// Response
{
  "success": true,
  "data": {
    "domain": "example.com",
    "rows": [...],
    "totalRows": 1
  }
}
```

### Yelp API

**GET** `/api/yelp?businessId=123` or `/api/yelp?name=Dealership&location=City,State`

```typescript
// Response
{
  "success": true,
  "data": {
    "id": "business-id",
    "name": "Dealership Name",
    "rating": 4.2,
    "reviewCount": 127,
    "location": {...}
  }
}
```

### AI Citations API

**POST** `/api/ai-citations`

```typescript
// Request
{
  "businessName": "Dealership Name",
  "location": "City, State",
  "domain": "dealership.com"
}

// Response
{
  "success": true,
  "data": {
    "overallScore": 73,
    "mentionsCount": 3,
    "recommendations": [...]
  }
}
```

## 🔐 OAuth Integration

### Google OAuth Setup

1. **Create OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **Configure Scopes**
   ```typescript
   const scopes = [
     'https://www.googleapis.com/auth/analytics.readonly',
     'https://www.googleapis.com/auth/business.manage'
   ];
   ```

3. **Initialize Authentication**
   ```typescript
   import { GoogleAuth } from '@/lib/services/GoogleAuth';
   
   const auth = new GoogleAuth();
   auth.initiateAuth();
   ```

## 💻 Usage Examples

### Basic Data Service Usage

```typescript
import { DataService } from '@/lib/services/DataService';

const dataService = new DataService();

// Get analytics data
const analytics = await dataService.getAnalyticsData('7daysAgo', 'today');

// Get PageSpeed data
const pageSpeed = await dataService.getPageSpeedData('https://example.com');

// Get competitor data
const competitor = await dataService.getSEMrushData('competitor.com');
```

### Dashboard Integration

```typescript
import { DashboardDataService } from '@/lib/services/DashboardDataService';

const dashboardService = new DashboardDataService();

// Get complete dashboard data
const dashboardData = await dashboardService.getDashboardData();

// Get score data
const scores = await dashboardService.getScoreData();

// Get action items
const actions = await dashboardService.getActionItems();
```

### Error Handling

```typescript
try {
  const data = await dataService.getAnalyticsData();
  console.log('Success:', data);
} catch (error) {
  console.error('API Error:', error.message);
  // Fallback to mock data or cached data
  const mockData = dataService.getMockAnalyticsData();
}
```

## 🧪 Testing

### Run All Tests

```bash
npm run test:all
```

### Individual Service Tests

```bash
# Test specific services
npm run test:api
npm run test:full-scoring
```

### Test Results

```
🚀 Starting DealershipAI API Test Suite
============================================================

🧪 Testing Analytics API...
✅ Analytics API PASSED (245ms)
   📊 Data points: 3

🧪 Testing PageSpeed API...
✅ PageSpeed API PASSED (189ms)
   🏃 Score: 87/100

🧪 Testing SEMrush API...
✅ SEMrush API PASSED (156ms)
   🔍 Domain: example.com

============================================================
📊 TEST SUMMARY
============================================================
⏱️  Total Time: 1247ms
✅ Passed: 7
❌ Failed: 0
📈 Success Rate: 100%
```

## 🔄 Caching Strategy

### Redis Caching

```typescript
// Cache analytics data for 1 hour
await cache.set('analytics:property:123', data, 3600);

// Cache PageSpeed data for 24 hours
await cache.set('pagespeed:url:example.com', data, 86400);
```

### Fallback Strategy

1. **Primary**: Real API data
2. **Secondary**: Cached data
3. **Tertiary**: Mock data
4. **Final**: Error state

## 📈 Monitoring & Costs

### Rate Limiting

```typescript
// Check daily limits
const dailyQueries = await redis.get('ai_queries:today');
if (dailyQueries >= MAX_DAILY_AI_QUERIES) {
  throw new Error('Daily AI query limit reached');
}
```

### Cost Tracking

```typescript
// Track API costs
const cost = {
  openai: queries * 0.10,
  semrush: requests * 0.001,
  total: 0
};
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Check environment variables
   - Verify API key permissions
   - Test with curl/Postman

2. **Rate Limiting**
   - Implement exponential backoff
   - Use caching strategies
   - Monitor usage patterns

3. **Authentication Issues**
   - Check OAuth configuration
   - Verify redirect URIs
   - Refresh tokens when needed

### Debug Mode

```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'debug';

// Test individual endpoints
curl "http://localhost:3000/api/analytics"
curl "http://localhost:3000/api/pagespeed?url=https://example.com"
```

## 🎯 Next Steps

1. **Production Deployment**
   - Set up monitoring
   - Configure rate limiting
   - Implement error tracking

2. **Feature Enhancements**
   - Add more data sources
   - Implement real-time updates
   - Create custom dashboards

3. **Optimization**
   - Implement advanced caching
   - Add data compression
   - Optimize API responses

## 📞 Support

For issues or questions:
- Check the test suite results
- Review API documentation
- Check environment configuration
- Monitor error logs

---

**Ready to build amazing dealership analytics! 🚀**
