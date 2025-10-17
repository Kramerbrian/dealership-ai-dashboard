# 🚀 Quick Google APIs Setup Guide

## ⚡ **5-Minute Setup**

### **Step 1: Google Analytics 4 (2 minutes)**

1. **Go to**: https://analytics.google.com/
2. **Create new property** for your domain
3. **Copy Property ID** (looks like: `123456789`)

### **Step 2: Google Cloud Console (2 minutes)**

1. **Go to**: https://console.cloud.google.com/
2. **Create new project**: "DealershipAI Analytics"
3. **Enable APIs**:
   - Google Analytics Data API
   - Google Search Console API  
   - PageSpeed Insights API

### **Step 3: Service Account (1 minute)**

1. **Go to**: IAM & Admin → Service Accounts
2. **Create service account**: "dealershipai-analytics"
3. **Download JSON key** file
4. **Copy the entire JSON content**

## 🔧 **Add to Vercel**

```bash
# Run the setup script
./setup-google-apis.sh

# Or manually add environment variables:
vercel env add GA4_PROPERTY_ID production
# Enter your GA4 Property ID

vercel env add GOOGLE_ANALYTICS_CREDENTIALS production  
# Paste your service account JSON

vercel env add PAGESPEED_INSIGHTS_API_KEY production
# Enter your PageSpeed API key
```

## 🧪 **Test Setup**

```bash
# Test the integration
node test-real-data.js

# Should show "real_data" as source
```

## 🎯 **Expected Results**

After setup, your dashboard will show:
- ✅ **Real PageSpeed scores** from Google
- ✅ **Actual search data** from Search Console
- ✅ **Live traffic metrics** from Analytics
- ✅ **Calculated SEO scores** based on real data

## 🚨 **Troubleshooting**

### **"No data available"**
- Check if domain is added to Search Console
- Verify service account has proper permissions
- Ensure GA4 property ID is correct

### **"API quota exceeded"**
- PageSpeed Insights has daily limits
- Caching reduces API calls automatically
- Consider upgrading to paid tier

### **"Authentication failed"**
- Verify service account JSON is valid
- Check if all required APIs are enabled
- Ensure service account has proper roles

## 💡 **Pro Tips**

1. **Start with PageSpeed** - Easiest to test
2. **Use your own domain** - Test with a domain you control
3. **Check quotas** - Monitor API usage in Google Cloud Console
4. **Cache aggressively** - Reduces API calls and improves performance

---

**Ready to provide real insights to your customers! 🚀**
