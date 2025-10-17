# 🚀 Real Data Integration Setup Guide

## 📊 **Overview**

Your DealershipAI dashboard now supports real data integration with:
- **Google Search Console** - Real search performance data
- **Google Analytics 4** - Traffic and user behavior data  
- **PageSpeed Insights** - Performance and Core Web Vitals
- **Fallback to Mock Data** - Ensures dashboard always works

## 🔧 **Required Environment Variables**

### **Google Analytics 4 Setup**

1. **Create GA4 Property**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new GA4 property for your domain
   - Note the Property ID (format: `123456789`)

2. **Create Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to IAM & Admin → Service Accounts
   - Create a new service account
   - Download the JSON credentials file

3. **Add Environment Variables**
   ```bash
   # Add to Vercel environment variables
   GA4_PROPERTY_ID=your_property_id_here
   GOOGLE_ANALYTICS_CREDENTIALS={"type":"service_account","project_id":"your_project_id","private_key_id":"your_private_key_id","private_key":"-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n","client_email":"your_service_account@your_project.iam.gserviceaccount.com","client_id":"your_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your_service_account%40your_project.iam.gserviceaccount.com"}
   ```

### **Google Search Console Setup**

1. **Add Property to Search Console**
   - Go to [Google Search Console](https://search.google.com/search-console/)
   - Add your domain as a property
   - Verify ownership

2. **Grant Service Account Access**
   - In Search Console, go to Settings → Users and permissions
   - Add your service account email as a user with "Full" access

### **PageSpeed Insights Setup**

1. **Get API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable PageSpeed Insights API
   - Create an API key

2. **Add Environment Variable**
   ```bash
   PAGESPEED_INSIGHTS_API_KEY=your_api_key_here
   ```

## 🚀 **Quick Setup Commands**

### **Add to Vercel Environment Variables**

```bash
# Google Analytics 4
vercel env add GA4_PROPERTY_ID production
# Enter your GA4 property ID

vercel env add GOOGLE_ANALYTICS_CREDENTIALS production
# Paste your service account JSON credentials

# PageSpeed Insights
vercel env add PAGESPEED_INSIGHTS_API_KEY production
# Enter your PageSpeed API key
```

### **Redeploy with New Environment Variables**

```bash
vercel --prod
```

## 📈 **What You'll Get**

### **Real SEO Data**
- **Search Console**: Actual search impressions, clicks, CTR, position
- **Analytics**: Real traffic, sessions, bounce rate, session duration
- **PageSpeed**: Live performance scores, Core Web Vitals
- **Calculated Scores**: SEO, AEO, GEO scores based on real data

### **Fallback System**
- **Graceful Degradation**: If APIs fail, falls back to mock data
- **Always Functional**: Dashboard works even without API access
- **Error Logging**: All API errors are logged for debugging

## 🧪 **Testing Real Data**

### **Test API Endpoints**

1. **SEO Analysis**
   ```bash
   curl "https://your-domain.vercel.app/api/visibility/seo?domain=yourdomain.com&timeRange=30d"
   ```

2. **AEO Analysis**
   ```bash
   curl "https://your-domain.vercel.app/api/visibility/aeo?domain=yourdomain.com&timeRange=30d"
   ```

3. **GEO Analysis**
   ```bash
   curl "https://your-domain.vercel.app/api/visibility/geo?domain=yourdomain.com&timeRange=30d"
   ```

### **Check Data Source**

Look for `"source": "real_data"` in API responses to confirm real data is being used.

## 🔍 **Data Processing Logic**

### **SEO Score Calculation**
- **PageSpeed Performance** (30% weight)
- **Search Console Impressions** (25% weight)
- **Analytics Sessions** (25% weight)
- **SEO Score** (20% weight)

### **AEO Score Calculation**
- **Click-through Rate** (40% weight)
- **Bounce Rate** (30% weight)
- **Accessibility Score** (30% weight)

### **GEO Score Calculation**
- **Session Duration** (40% weight)
- **Best Practices Score** (30% weight)
- **Search Position** (30% weight)

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **"No data available"**
   - Check if domain is added to Search Console
   - Verify service account has proper permissions
   - Ensure GA4 property ID is correct

2. **"API quota exceeded"**
   - PageSpeed Insights has daily limits
   - Consider implementing rate limiting
   - Use caching to reduce API calls

3. **"Authentication failed"**
   - Verify service account credentials
   - Check if JSON is properly formatted
   - Ensure all required scopes are granted

### **Debug Mode**

Enable debug logging by adding:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## 📊 **Performance Impact**

### **API Response Times**
- **With Real Data**: 2-5 seconds (first load)
- **With Cache**: 200-500ms (subsequent loads)
- **With Mock Data**: 100-200ms (fallback)

### **Caching Strategy**
- **SEO Data**: 5 minutes cache
- **Analytics Data**: 1 hour cache
- **PageSpeed Data**: 24 hours cache

## 🎯 **Next Steps**

1. **Set up environment variables** (5 minutes)
2. **Test with your domain** (2 minutes)
3. **Verify real data is flowing** (1 minute)
4. **Start using for customer demos** (immediately!)

## 💡 **Pro Tips**

1. **Start with PageSpeed** - Easiest to set up and test
2. **Use your own domain** - Test with a domain you control
3. **Monitor API quotas** - Set up alerts for quota usage
4. **Cache aggressively** - Reduce API calls and improve performance

---

**Your DealershipAI dashboard is now ready to provide real, actionable insights to your customers! 🚀**
