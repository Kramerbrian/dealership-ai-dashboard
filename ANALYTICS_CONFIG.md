# 📊 Analytics Configuration Guide

## Quick Setup

### 1. Google PageSpeed Insights API

**For report generation with real Lighthouse data:**

```bash
# Add to .env.local
GOOGLE_PAGESPEED_API_KEY=your_api_key_here
```

**Get API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select project
3. Enable "PageSpeed Insights API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key

**Usage:**
```bash
# Without API key (uses fallback data)
node scripts/generate-report.js

# With API key (real Lighthouse data)
GOOGLE_PAGESPEED_API_KEY=your_key node scripts/generate-report.js
```

---

### 2. Google Analytics 4 (GA4)

**For real CTR and Conversion data:**

```bash
# Add to .env.local
GA_PROPERTY_ID=your_property_id
GOOGLE_ANALYTICS_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Get Property ID:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Admin → Property Settings
3. Copy "Property ID" (numeric, e.g., `123456789`)

**Get Service Account Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. IAM & Admin → Service Accounts
3. Create service account or use existing
4. Grant "Viewer" role to GA4 property
5. Create JSON key → Download
6. Copy entire JSON content to `GOOGLE_ANALYTICS_CREDENTIALS` (as single-line JSON string)

**Alternative: Individual Variables**
```bash
GA_PROPERTY_ID=123456789
GA_PROJECT_ID=your-project-id
GA_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

### 3. Mixpanel

**For event-based analytics:**

```bash
# Add to .env.local
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

**Get Token:**
1. Go to [Mixpanel](https://mixpanel.com/)
2. Project Settings → Project Info
3. Copy "Project Token"

---

### 4. Segment

**For unified analytics:**

```bash
# Add to .env.local
NEXT_PUBLIC_SEGMENT_KEY=your_segment_write_key
```

**Get Write Key:**
1. Go to [Segment](https://segment.com/)
2. Workspace → Sources → Add Source
3. Select source type → Copy "Write Key"

---

## Complete .env.local Example

```bash
# ==========================================
# ANALYTICS CONFIGURATION
# ==========================================

# Google PageSpeed Insights (for report generation)
GOOGLE_PAGESPEED_API_KEY=your_pagespeed_api_key

# Google Analytics 4 (for real CTR/Conversion data)
GA_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_CREDENTIALS='{"type":"service_account","project_id":"your-project","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"analytics@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# OR use individual variables:
# GA_PROPERTY_ID=123456789
# GA_PROJECT_ID=your-project-id
# GA_SERVICE_ACCOUNT_EMAIL=analytics@your-project.iam.gserviceaccount.com
# GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Mixpanel (alternative analytics)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# Segment (alternative analytics)
NEXT_PUBLIC_SEGMENT_KEY=your_segment_write_key

# Application URL (for API endpoints)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing Your Configuration

### 1. Test Analytics API

```bash
# Test variant analytics endpoint
curl http://localhost:3000/api/analytics/variant?variant=fear&range=30d

# Expected response:
# {
#   "variant": "fear",
#   "ctr": 0.108,
#   "conv": 0.029,
#   "impressions": 1000,
#   "clicks": 108,
#   "conversions": 3
# }
```

### 2. Test Report Generation

```bash
# Without API key (uses fallback)
node scripts/generate-report.js

# With API key (real Lighthouse data)
GOOGLE_PAGESPEED_API_KEY=your_key node scripts/generate-report.js

# Check generated files
ls -lh public/audit-reports/
```

### 3. Verify Analytics Data

```bash
# Check if analytics data is being used
cat public/audit-reports/abtest_metrics.csv
# Should show real CTR/Conversion if analytics configured
```

---

## Priority Order

1. **GOOGLE_PAGESPEED_API_KEY** - For real Lighthouse metrics in reports
2. **GA_PROPERTY_ID + GOOGLE_ANALYTICS_CREDENTIALS** - For real CTR/Conversion data
3. **NEXT_PUBLIC_MIXPANEL_TOKEN** - Alternative analytics provider
4. **NEXT_PUBLIC_SEGMENT_KEY** - Alternative analytics provider

---

## Troubleshooting

### Issue: Analytics returns simulated data
**Solution:** Verify credentials are correct and provider is enabled

### Issue: PageSpeed API errors
**Solution:** 
- Verify API key is valid
- Check API quota limits
- Ensure URL is accessible

### Issue: GA4 authentication fails
**Solution:**
- Verify service account has GA4 Viewer access
- Check JSON credentials format (escape newlines)
- Ensure property ID is correct

---

## Next Steps

1. ✅ Add credentials to `.env.local`
2. ✅ Restart dev server: `npm run dev`
3. ✅ Test analytics endpoint
4. ✅ Regenerate reports: `node scripts/generate-report.js`
5. ✅ View reports at: `http://localhost:3000/admin/audit`

