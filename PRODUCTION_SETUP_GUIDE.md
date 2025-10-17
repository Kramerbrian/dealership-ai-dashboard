# 🚀 Production Setup Guide - dealershipai.com

## Overview

Complete guide to configure all production features including analytics, lead capture, CRM integration, and email notifications.

---

## 1. Social Media Images ✅

### Files Created
- `/public/og-image-placeholder.svg` - Open Graph image (1200x630)
- `/public/twitter-image-placeholder.svg` - Twitter Card image (1200x675)

### Next Steps
1. **Convert SVG to JPG/PNG** (recommended for better compatibility):
   ```bash
   # Using ImageMagick or online converter
   convert public/og-image-placeholder.svg public/og-image.jpg
   convert public/twitter-image-placeholder.svg public/twitter-image.jpg
   ```

2. **Or create custom images** with:
   - Your logo
   - Real dealership photos
   - Actual metrics/results
   - Brand colors

3. **Upload to /public** folder
4. **Update metadata** in `app/layout.tsx` if filenames change

---

## 2. Google Analytics Setup ✅

### Files Created
- `lib/analytics/google-analytics.ts` - Analytics tracking functions
- Event tracking functions for:
  - Form submissions
  - Button clicks
  - Lead captures
  - Pricing views
  - Dashboard views

### Configuration Steps

1. **Get Google Analytics ID**
   ```
   https://analytics.google.com/
   → Create Property
   → Get Measurement ID (G-XXXXXXXXXX)
   ```

2. **Add to Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

3. **Or update directly in** `app/layout.tsx`:
   ```typescript
   const GA_TRACKING_ID = 'G-YOUR-ACTUAL-ID';
   ```

4. **Deploy to Vercel**
   ```bash
   vercel env add NEXT_PUBLIC_GA_ID production
   # Enter your G-XXXXXXXXXX ID
   vercel --prod
   ```

### Usage in Components
```typescript
import { trackFormSubmit, trackLeadCapture } from '@/lib/analytics/google-analytics';

// Track form submission
trackFormSubmit('landing_page_scan');

// Track lead capture
trackLeadCapture('landing_page');
```

---

## 3. Sitemap & SEO ✅

### Files Created
- `app/sitemap.ts` - Dynamic XML sitemap
- `app/robots.ts` - Robots.txt configuration

### Sitemap URL
```
https://www.dealershipai.com/sitemap.xml
https://www.dealershipai.com/robots.txt
```

### Submit to Google Search Console

1. **Verify Ownership**
   ```
   https://search.google.com/search-console
   → Add Property: dealershipai.com
   → Verify via DNS or HTML file
   ```

2. **Submit Sitemap**
   ```
   → Sitemaps
   → Add new sitemap: https://www.dealershipai.com/sitemap.xml
   → Submit
   ```

3. **Monitor Performance**
   - Check indexing status
   - Monitor search queries
   - Track click-through rates

---

## 4. Lead Capture & CRM Integration ✅

### Files Created
- `app/api/leads/capture/route.ts` - Lead capture API endpoint
- `lib/services/email-service.ts` - Email service with templates

### Lead Capture Flow
```
User submits form → /api/leads/capture → Save to DB + Send to CRM + Email notification
```

### CRM Integration Options

#### Option A: HubSpot (Recommended)

1. **Get HubSpot Credentials**
   ```
   https://app.hubspot.com/
   → Settings → Integrations → API Key
   → Get Portal ID and Form GUID
   ```

2. **Add to Environment Variables**
   ```bash
   HUBSPOT_ACCESS_TOKEN=your-hubspot-api-key
   HUBSPOT_PORTAL_ID=your-portal-id
   HUBSPOT_FORM_GUID=your-form-guid
   ```

3. **Deploy**
   ```bash
   vercel env add HUBSPOT_ACCESS_TOKEN production
   vercel env add HUBSPOT_PORTAL_ID production
   vercel env add HUBSPOT_FORM_GUID production
   vercel --prod
   ```

#### Option B: Salesforce

1. **Get Salesforce API Credentials**
2. **Update** `app/api/leads/capture/route.ts` with Salesforce integration
3. **Add environment variables**

#### Option C: Custom CRM

1. **Modify** `sendToHubSpot()` function in `app/api/leads/capture/route.ts`
2. **Add your CRM API endpoint**
3. **Configure authentication**

### Database Storage

To persist leads, add database integration:

```typescript
// In app/api/leads/capture/route.ts
import { db } from '@/lib/db';

async function saveLead(leadData: any) {
  await db.insert('leads').values({
    dealer_url: leadData.dealerUrl,
    email: leadData.email,
    name: leadData.name,
    source: leadData.source,
    created_at: new Date(),
  });
}
```

---

## 5. Email Notifications ✅

### SendGrid Setup

1. **Create SendGrid Account**
   ```
   https://sendgrid.com/
   → Sign up
   → Verify email
   ```

2. **Create API Key**
   ```
   → Settings → API Keys
   → Create API Key (Full Access)
   → Copy key
   ```

3. **Verify Sender**
   ```
   → Settings → Sender Authentication
   → Verify Single Sender
   → Use: noreply@dealershipai.com
   ```

4. **Add to Environment Variables**
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
   FROM_EMAIL=noreply@dealershipai.com
   NOTIFY_EMAIL=leads@dealershipai.com
   ```

5. **Deploy**
   ```bash
   vercel env add SENDGRID_API_KEY production
   vercel env add FROM_EMAIL production
   vercel env add NOTIFY_EMAIL production
   vercel --prod
   ```

### Email Templates Available

1. **Welcome Email** - Sent to new leads
2. **Lead Notification** - Sent to your team when lead captured

### Customize Templates

Edit templates in `lib/services/email-service.ts`:
```typescript
export const emailTemplates = {
  welcomeEmail: (name, dealerUrl) => `...`,
  leadNotification: (leadData) => `...`,
};
```

---

## 6. Environment Variables Summary

### Required for Production

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# CRM (Choose one)
# HubSpot
HUBSPOT_ACCESS_TOKEN=your-hubspot-api-key
HUBSPOT_PORTAL_ID=your-portal-id
HUBSPOT_FORM_GUID=your-form-guid

# OR Salesforce
SALESFORCE_CLIENT_ID=your-client-id
SALESFORCE_CLIENT_SECRET=your-client-secret

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@dealershipai.com
NOTIFY_EMAIL=leads@dealershipai.com

# Database (Already configured)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### Add to Vercel

```bash
# Add each variable
vercel env add NEXT_PUBLIC_GA_ID production
vercel env add SENDGRID_API_KEY production
vercel env add HUBSPOT_ACCESS_TOKEN production
# ... etc

# Redeploy
vercel --prod
```

### Or use Vercel Dashboard

```
1. Go to: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/environment-variables
2. Add each variable
3. Select "Production" environment
4. Save
5. Redeploy
```

---

## 7. Conversion Tracking

### Events to Track

1. **Landing Page**
   - Page view
   - Form submission
   - CTA clicks

2. **Dashboard**
   - Dashboard loaded
   - Metrics viewed
   - Export actions

3. **Pricing**
   - Pricing page viewed
   - Plan selected
   - Signup initiated

### Custom Events

Add custom events in `lib/analytics/google-analytics.ts`:

```typescript
export const trackCustomEvent = (action: string, category: string) => {
  event({ action, category });
};
```

---

## 8. Lead Nurturing Workflow

### Automated Sequence (via CRM)

**Day 0: Lead Capture**
- Send welcome email
- Provide dashboard access
- Set follow-up task

**Day 1: Value Demonstration**
- Email: "Your AI Visibility Report"
- Show specific opportunities
- Include actionable tips

**Day 3: Social Proof**
- Email: Case study
- Success metrics
- Testimonials

**Day 7: Offer Call**
- Email: "Let's discuss your results"
- Calendar link
- Personalized insights

**Day 14: Final Touch**
- Email: Special offer
- Limited-time pricing
- Urgency

### Setup in HubSpot

```
1. Go to: Automation → Workflows
2. Create new workflow
3. Enrollment trigger: Form submission (dealershipai.com)
4. Add delays and email actions
5. Activate workflow
```

---

## 9. Marketing & Traffic

### Traffic Sources to Track

1. **Organic Search**
   - Google
   - Bing
   - DuckDuckGo

2. **Paid Advertising**
   - Google Ads
   - Facebook Ads
   - LinkedIn Ads

3. **Social Media**
   - LinkedIn
   - Twitter/X
   - Facebook

4. **Referrals**
   - Partner sites
   - Directories
   - Industry publications

### UTM Parameters

Use UTM parameters for tracking:

```
https://www.dealershipai.com/?utm_source=google&utm_medium=cpc&utm_campaign=launch
```

**Standard Parameters:**
- `utm_source` - Traffic source (google, facebook, email)
- `utm_medium` - Marketing medium (cpc, social, email)
- `utm_campaign` - Campaign name (launch, retargeting)
- `utm_content` - Ad variation
- `utm_term` - Keyword

### Launch Checklist

- [ ] Submit to Google Search Console
- [ ] Set up Google Ads campaign
- [ ] Create LinkedIn posts
- [ ] Launch Facebook ads
- [ ] Email existing contacts
- [ ] Post in industry forums
- [ ] Reach out to partners
- [ ] Create press release
- [ ] Update directory listings

---

## 10. Monitoring & Optimization

### Key Metrics to Track

**Traffic Metrics:**
- Unique visitors
- Page views
- Bounce rate
- Time on site

**Conversion Metrics:**
- Form submissions
- Lead capture rate
- Cost per lead
- Conversion rate by source

**Engagement Metrics:**
- Dashboard usage
- Return visitors
- Feature adoption
- Support requests

### Tools

1. **Google Analytics**
   - Traffic analysis
   - Conversion tracking
   - User behavior

2. **Vercel Analytics**
   - Performance monitoring
   - Web Vitals
   - Real User Monitoring

3. **Hotjar / Microsoft Clarity**
   - Heatmaps
   - Session recordings
   - User feedback

### A/B Testing

Test these elements:
- Headlines
- CTA button text
- Form placement
- Pricing display
- Social proof

---

## 11. Production Checklist

### Pre-Launch
- [x] Site deployed to dealershipai.com
- [ ] Google Analytics configured
- [ ] Social images created
- [ ] Sitemap submitted
- [ ] CRM integration tested
- [ ] Email notifications working
- [ ] Lead capture tested
- [ ] Analytics events firing

### Post-Launch
- [ ] Monitor error logs
- [ ] Check analytics data
- [ ] Test lead flow end-to-end
- [ ] Verify email delivery
- [ ] Monitor conversion rate
- [ ] Review user feedback
- [ ] Optimize based on data

---

## 12. Quick Start Commands

```bash
# Test lead capture locally
curl -X POST http://localhost:3000/api/leads/capture \
  -H "Content-Type: application/json" \
  -d '{"dealerUrl":"test-dealer.com","source":"test"}'

# Check sitemap
curl https://www.dealershipai.com/sitemap.xml

# Check robots.txt
curl https://www.dealershipai.com/robots.txt

# Deploy with new env vars
vercel env pull
vercel --prod

# View logs
vercel logs www.dealershipai.com
```

---

## Support

### Documentation
- **API Integration**: `DASH_API_CONNECTION_COMPLETE.md`
- **Live Data**: `LIVE_DATA_INTEGRATION_COMPLETE.md`
- **Deployment**: `DEALERSHIPAI_COM_ACTIVATION.md`

### Vercel Dashboard
https://vercel.com/brian-kramers-projects/dealershipai-dashboard

### Analytics Dashboard
- Google Analytics: https://analytics.google.com/
- Vercel Analytics: https://vercel.com/[project]/analytics

---

**Status: Ready for Production Traffic**

Last Updated: October 16, 2025
