# 🚀 Landing Page Setup Guide

## ✅ **What's Been Implemented**

The complete landing page system with progressive forms, competitive FOMO, and conversion tracking is now ready!

### **🎯 Key Features Delivered:**

1. **✅ Progressive Form**: Multi-step lead capture with smooth animations
2. **✅ Competitive FOMO**: Social proof with competitor data
3. **✅ Conversion Tracking**: Redis-based metrics and analytics
4. **✅ Dealership Enrichment**: Automatic name extraction from URLs
5. **✅ Lead Management**: Complete lead capture and storage system

## 🔧 **Setup Instructions**

### **1. Install Dependencies**

```bash
npm install framer-motion @upstash/redis
```

### **2. Environment Variables**

Add these to your `.env.local`:

```env
# Redis (Upstash)
UPSTASH_REDIS_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_TOKEN="your-redis-token"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Analytics (optional)
GOOGLE_ADS_CONVERSION_ID="AW-XXXXX"
```

### **3. Set Up Upstash Redis**

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the URL and token to your `.env.local`

### **4. Google Cloud Setup**

#### **Google Analytics Data API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable Google Analytics Data API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Analytics Data API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3000/oauth/callback`
   - Copy Client ID and Client Secret to `.env.local`

#### **Google My Business API:**
1. Go to [Google Cloud Console APIs](https://console.cloud.google.com/apis/library)
2. Search for "My Business Business Information API"
3. Click "Enable"
4. Get Account & Location IDs:
   - Use: [My Business Basic Setup](https://developers.google.com/my-business/content/basic-setup)
   - Or call: `GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts`

### **5. Find Your GA4 Property ID:**
1. Go to [Google Analytics](https://analytics.google.com)
2. Admin > Property > Property Details
3. Copy Property ID (format: `properties/123456789`)

## 🎯 **Usage**

### **Landing Page**
- Visit `/landing` to see the complete landing page
- Progressive form with 3 steps: Website → Challenge → Contact
- Competitive FOMO shows competitor data
- Real-time conversion metrics

### **API Endpoints**

#### **Lead Capture:**
```bash
POST /api/leads
{
  "website": "example.com",
  "dealership_name": "Example Dealership",
  "challenge": "invisible",
  "email": "user@example.com",
  "name": "John Smith",
  "role": "owner"
}
```

#### **Conversion Metrics:**
```bash
GET /api/metrics/conversions
# Returns: page_views, form_start_rate, form_completion_rate, etc.
```

#### **Competitive Context:**
```bash
POST /api/competitive-context
{
  "url": "example.com"
}
# Returns: city, checks_today, competitors array
```

#### **Dealership Enrichment:**
```bash
POST /api/enrich-dealership
{
  "url": "example.com"
}
# Returns: extracted dealership name
```

## 📊 **Features**

### **Progressive Form:**
- **Step 1**: Website URL with validation
- **Step 2**: Challenge selection with smooth transitions
- **Step 3**: Contact information with role selection
- **Progress Indicator**: Visual progress bar
- **Animations**: Smooth transitions between steps

### **Competitive FOMO:**
- **Social Proof**: Shows how many dealerships checked today
- **Competitor Data**: Blurred competitor names with scores
- **City-Specific**: Shows data for the user's city
- **Real-Time**: Updates based on actual usage

### **Conversion Tracking:**
- **Redis Storage**: Fast, scalable metrics storage
- **Real-Time Updates**: Instant metric updates
- **Multiple Metrics**: Page views, form starts, completions, etc.
- **Caching**: Efficient data retrieval

### **Lead Management:**
- **Complete Capture**: All form data stored
- **IP Tracking**: User IP and user agent logging
- **Unique Tracking**: Prevents duplicate leads
- **Audit Triggering**: Automatically starts AI audit generation

## 🚀 **Production Deployment**

### **1. Set Up Production Redis:**
- Create production Upstash Redis instance
- Update environment variables
- Test connection

### **2. Configure Analytics:**
- Set up Google Analytics 4
- Configure conversion tracking
- Set up Google Ads conversion tracking

### **3. Deploy:**
```bash
vercel --prod
```

### **4. Monitor:**
- Check conversion metrics at `/api/metrics/conversions`
- Monitor lead capture success rate
- Track form completion rates

## 🎉 **Success Criteria**

The landing page is working correctly when:
- ✅ Progressive form captures leads successfully
- ✅ Competitive FOMO shows relevant data
- ✅ Conversion metrics update in real-time
- ✅ Dealership names are extracted correctly
- ✅ All API endpoints respond correctly
- ✅ Animations and transitions work smoothly

## 📋 **Next Steps**

1. **Set up Redis**: Create Upstash account and database
2. **Configure Analytics**: Set up Google Analytics and Ads
3. **Test Form**: Submit test leads to verify functionality
4. **Monitor Metrics**: Check conversion rates and optimize
5. **Deploy**: Push to production and monitor performance

The landing page system is now **fully implemented and ready for production deployment**! 🚀
