# ⚡ Quick Setup Checklist

## Immediate Actions (10 minutes)

### 1. Google Analytics (2 min)
```bash
# Get ID from: https://analytics.google.com/
vercel env add NEXT_PUBLIC_GA_ID production
# Enter: G-XXXXXXXXXX
```

### 2. SendGrid Email (3 min)
```bash
# Get API key from: https://sendgrid.com/
vercel env add SENDGRID_API_KEY production
vercel env add FROM_EMAIL production
vercel env add NOTIFY_EMAIL production
```

### 3. HubSpot CRM (3 min)
```bash
# Get from: https://app.hubspot.com/
vercel env add HUBSPOT_ACCESS_TOKEN production
vercel env add HUBSPOT_PORTAL_ID production
vercel env add HUBSPOT_FORM_GUID production
```

### 4. Deploy (2 min)
```bash
vercel --prod
```

---

## Environment Variables Quick Copy

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxx
FROM_EMAIL=noreply@dealershipai.com
NOTIFY_EMAIL=leads@dealershipai.com

# CRM
HUBSPOT_ACCESS_TOKEN=your-token
HUBSPOT_PORTAL_ID=your-id
HUBSPOT_FORM_GUID=your-guid
```

---

## Service Setup Links

| Service | Purpose | Setup URL |
|---------|---------|-----------|
| Google Analytics | Track visitors | https://analytics.google.com/ |
| SendGrid | Email notifications | https://sendgrid.com/ |
| HubSpot | CRM & lead management | https://app.hubspot.com/ |
| Google Search Console | SEO & sitemap | https://search.google.com/search-console |

---

## Test Everything

```bash
# 1. Test lead capture
curl -X POST https://www.dealershipai.com/api/leads/capture \
  -H "Content-Type: application/json" \
  -d '{"dealerUrl":"test.com","source":"test"}'

# 2. Check sitemap
curl https://www.dealershipai.com/sitemap.xml

# 3. Check analytics (visit site and check GA dashboard)

# 4. Test email (submit a real lead)
```

---

## What's Already Working ✅

- [x] Site live at dealershipai.com
- [x] Landing page deployed
- [x] Dashboard functional
- [x] API endpoints working
- [x] Lead capture API ready
- [x] Email templates created
- [x] Analytics tracking ready
- [x] Sitemap generated
- [x] Social images created

---

## What Needs Your Input

1. **Google Analytics ID** - Get from analytics.google.com
2. **SendGrid API Key** - Get from sendgrid.com
3. **HubSpot Credentials** - Get from app.hubspot.com
4. **Custom Social Images** - Replace placeholder SVGs (optional)

---

## Priority Order

**Week 1:**
1. ✅ Site launched
2. Add Google Analytics
3. Setup email notifications
4. Configure CRM
5. Submit sitemap

**Week 2:**
6. Launch paid ads
7. Monitor conversions
8. Optimize based on data
9. A/B test landing page
10. Scale traffic

---

## Need Help?

**Full Documentation**: `PRODUCTION_SETUP_GUIDE.md`

**Quick Links**:
- Site: https://www.dealershipai.com
- Dashboard: https://www.dealershipai.com/dash
- Vercel: https://vercel.com/brian-kramers-projects/dealershipai-dashboard
- Analytics: https://analytics.google.com/

---

**Next Step**: Add environment variables and redeploy!
