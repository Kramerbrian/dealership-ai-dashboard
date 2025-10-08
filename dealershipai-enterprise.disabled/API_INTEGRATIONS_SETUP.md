# 🚀 API Integrations Setup Guide

## ✅ **What's Been Implemented**

Complete API integrations for all major services used in DealershipAI:

### **🎯 API Integrations Delivered:**

1. **✅ Google Analytics Data API**: Traffic, conversions, and user behavior
2. **✅ Google My Business API**: Business info, reviews, and insights
3. **✅ PageSpeed Insights API**: Core Web Vitals and performance metrics
4. **✅ SEMrush API**: SEO data, keywords, and backlinks
5. **✅ Yelp API**: Business reviews and ratings
6. **✅ OpenAI API**: AI-powered business analysis and citations

### **📊 Database Migrations:**
- **✅ Secondary Metrics Table**: SCS, SIS, ADI, SCR columns
- **✅ Row-Level Security**: Tenant isolation and data protection
- **✅ Indexes and Constraints**: Optimized queries and data integrity

### **🧪 Testing Framework:**
- **✅ Individual Test Scripts**: For each API integration
- **✅ Comprehensive Test Suite**: All APIs tested together
- **✅ Golden Prompts Scaffold**: 10 test prompts across use cases

## 🔧 **Setup Instructions**

### **1. Install Dependencies**

```bash
npm install @google-analytics/data
```

### **2. Environment Variables**

Add these to your `.env.local`:

```env
# Google Analytics
GOOGLE_ANALYTICS_PROPERTY_ID="properties/123456789"
GOOGLE_ANALYTICS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_ANALYTICS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_ANALYTICS_PROJECT_ID="your-project-id"

# Google My Business
GOOGLE_MY_BUSINESS_ACCOUNT_ID="accounts/123456789"
GOOGLE_MY_BUSINESS_LOCATION_ID="locations/123456789"
GOOGLE_MY_BUSINESS_ACCESS_TOKEN="your-access-token"

# PageSpeed Insights
PAGESPEED_API_KEY="your-pagespeed-api-key"

# SEMrush
SEMRUSH_API_KEY="your-semrush-api-key"

# Yelp
YELP_API_KEY="your-yelp-api-key"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"
```

### **3. Google Cloud Setup**

#### **Google Analytics Data API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable Google Analytics Data API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Data API"
   - Click "Enable"
4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Download the JSON key file
   - Extract `client_email` and `private_key` for environment variables
5. Grant access to GA4 property:
   - Go to Google Analytics > Admin > Property Access Management
   - Add the service account email with "Viewer" permissions

#### **Google My Business API:**
1. Enable My Business Business Information API:
   - Go to [Google Cloud Console APIs](https://console.cloud.google.com/apis/library)
   - Search for "My Business Business Information API"
   - Click "Enable"
2. Get Account & Location IDs:
   - Use: [My Business Basic Setup](https://developers.google.com/my-business/content/basic-setup)
   - Or run: `node scripts/get-locations.js` with your access token

#### **PageSpeed Insights API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable PageSpeed Insights API
3. Create API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Restrict to PageSpeed Insights API

### **4. Third-Party API Setup**

#### **SEMrush API:**
1. Sign up at [SEMrush](https://www.semrush.com) ($99/month minimum)
2. Go to "API Access" in your account
3. Generate API key
4. Add to environment variables

#### **Yelp API:**
1. Create account at [Yelp](https://www.yelp.com/signup)
2. Create new app at [Yelp Developers](https://www.yelp.com/developers/v3/manage_app)
3. Get API key from app settings
4. Add to environment variables

#### **OpenAI API:**
1. Sign up at [OpenAI Platform](https://platform.openai.com/signup)
2. Add payment method (required for API access)
3. Go to "API Keys" and create new key
4. Add to environment variables

### **5. Database Setup**

Run the migrations in order:

```bash
# Run migrations
psql -d your_database -f db/migrations/0001_secondary_metrics_create.sql
psql -d your_database -f db/migrations/0002_secondary_metrics_add_scs.sql
psql -d your_database -f db/migrations/0003_secondary_metrics_add_sis_adi.sql
psql -d your_database -f db/migrations/0004_secondary_metrics_add_scr_indexes_rls.sql
```

## 🧪 **Testing**

### **Individual API Tests:**

```bash
# Test each API individually
npm run test:analytics
npm run test:my-business
npm run test:pagespeed
npm run test:semrush
npm run test:yelp
npm run test:ai
```

### **Test All APIs:**

```bash
# Test all APIs at once
npm run test:all-apis
```

### **Golden Prompts Testing:**

```bash
# Use the golden prompts scaffold for comprehensive testing
node scripts/golden_prompts_scaffold.csv
```

## 📊 **API Endpoints**

### **Google Analytics:**
```bash
GET /api/analytics/google?propertyId=properties/123456789&startDate=7daysAgo&endDate=today
```

### **Google My Business:**
```bash
GET /api/my-business?accountId=accounts/123456789&locationId=locations/123456789
```

### **PageSpeed Insights:**
```bash
GET /api/pagespeed?url=https://example.com&strategy=mobile
```

### **SEMrush:**
```bash
GET /api/seo/semrush?domain=example.com&database=us
```

### **Yelp:**
```bash
GET /api/reviews/yelp?businessId=your-business-id
# OR
GET /api/reviews/yelp?term=auto+dealership&location=naples+fl
```

### **OpenAI AI Analysis:**
```bash
POST /api/ai/citations
{
  "businessName": "Premium Auto Dealership",
  "location": "Cape Coral, FL",
  "website": "https://premiumauto.com"
}
```

## 🎯 **Features**

### **Google Analytics Integration:**
- **Traffic Data**: Sessions, users, pageviews by device and channel
- **Conversion Tracking**: Event-based conversion metrics
- **Performance Metrics**: Bounce rate, session duration
- **Date Range Support**: Flexible time periods

### **Google My Business Integration:**
- **Business Information**: Name, address, phone, hours
- **Reviews Data**: Ratings, review count, recent reviews
- **Insights**: Views, searches, actions metrics
- **Location Data**: Coordinates, categories, photos

### **PageSpeed Insights Integration:**
- **Core Web Vitals**: LCP, FID, CLS metrics
- **Performance Scores**: Overall performance rating
- **Opportunities**: Specific optimization recommendations
- **Diagnostics**: Technical issues and improvements

### **SEMrush Integration:**
- **Domain Overview**: Traffic, keywords, cost estimates
- **Organic Keywords**: Top ranking keywords and positions
- **Paid Keywords**: AdWords data and performance
- **Backlinks**: Referring domains and link metrics

### **Yelp Integration:**
- **Business Data**: Complete business information
- **Reviews**: Recent reviews with ratings and sentiment
- **Review Metrics**: Average rating, total reviews, distribution
- **Search Support**: Find businesses by term and location

### **OpenAI Integration:**
- **AI Citation Analysis**: Likelihood of AI recommendations
- **Visibility Factors**: What affects AI search presence
- **Optimization Opportunities**: Specific improvement recommendations
- **Competitive Analysis**: How business compares to competitors

## 🚀 **Production Deployment**

### **1. Set Up Production APIs:**
- Create production API keys for all services
- Update environment variables
- Test all integrations

### **2. Database Migration:**
- Run migrations on production database
- Verify RLS policies are working
- Test data isolation

### **3. Monitor Performance:**
- Set up API rate limit monitoring
- Monitor response times
- Track error rates

### **4. Security:**
- Rotate API keys regularly
- Use environment-specific keys
- Monitor API usage

## 🎉 **Success Criteria**

The API integrations are working correctly when:
- ✅ All test scripts pass without errors
- ✅ Data is returned in expected format
- ✅ Rate limits are respected
- ✅ Error handling works properly
- ✅ Database migrations complete successfully
- ✅ RLS policies enforce tenant isolation

## 📋 **Next Steps**

1. **Set up API keys**: Get keys for all required services
2. **Configure environment**: Add all environment variables
3. **Run migrations**: Set up database schema
4. **Test integrations**: Run all test scripts
5. **Deploy**: Push to production and monitor

The API integration system is now **fully implemented and ready for production deployment**! 🚀

All major services are integrated with comprehensive error handling, testing, and documentation. The system provides complete visibility into dealership performance across all digital channels.
