# 🚀 Deploy PLG Landing Page to dealershipai.com

## ✅ Pre-Deployment Checklist

- [x] PLG landing page implemented
- [x] PostCSS configured
- [x] Page routing set up
- [ ] Environment variables configured
- [ ] Build passes locally
- [ ] Custom domain configured
- [ ] Vercel deployment ready

---

## 🚀 Deployment Steps

### Step 1: Test Local Build
```bash
# Ensure dev server is running on port 3001
# Test the landing page:
open http://localhost:3001/landing/plg

# Build for production
npm run build

# If build succeeds, you're ready to deploy!
```

### Step 2: Deploy to Vercel
```bash
# If not already logged in
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? [your account]
# - Link to existing project? Y
# - What's the name of your existing project? dealership-ai-dashboard
```

### Step 3: Configure Custom Domain
```bash
# In Vercel dashboard:
# 1. Go to project settings
# 2. Navigate to "Domains"
# 3. Add: dealershipai.com
# 4. Add: www.dealershipai.com
# 5. Follow DNS configuration instructions
```

### Step 4: Update DNS Records
```
Type: A (or CNAME)
Name: @
Value: 76.76.19.61 (or Vercel's IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com.
```

---

## 📋 Deployment Commands

### Quick Deploy (One Command)
```bash
npm run build && vercel --prod
```

### Deploy with Preview
```bash
vercel          # Creates preview deployment
vercel --prod   # Pushes to production
```

### Force Deploy (Skip Checks)
```bash
vercel --prod --force
```

---

## 🎯 Access URLs

**Production:**
- https://dealershipai.com/landing/plg
- https://www.dealershipai.com/landing/plg

**Vercel Default (before custom domain):**
- https://dealership-ai-dashboard.vercel.app/landing/plg

---

## 🔧 Environment Variables

Make sure these are set in Vercel:

```bash
# Required
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
UPSTASH_REDIS_URL=https://...
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional (for PLG features)
SESSION_COOKIE_SECRET=...
ADMIN_EMAIL=...
```

**To add in Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Set scope to Production (and Preview/Development if needed)
4. Redeploy

---

## 🎨 Post-Deployment Checklist

- [ ] Visit https://dealershipai.com/landing/plg
- [ ] Test URL input field
- [ ] Run sample analysis
- [ ] Verify 5-pillar scores display
- [ ] Check share modal works
- [ ] Test on mobile
- [ ] Verify decay tax counter
- [ ] Check console for errors
- [ ] Run Lighthouse audit
- [ ] Test in different browsers

---

## 🐛 Troubleshooting

### Domain Not Resolving?
```bash
# Check DNS propagation
dig dealershipai.com

# Check Vercel deployment
vercel inspect dealershipai.com
```

### Styles Not Loading?
```bash
# Ensure Tailwind is properly configured
npx tailwindcss -i ./app/globals.css -o ./app/output.css

# Check if Next.js is caching
rm -rf .next && npm run build
```

### 404 on Custom Domain?
```bash
# Ensure domain is added in Vercel
# Check rewrite rules in vercel.json

# May need to add to next.config.js:
async rewrites() {
  return [
    {
      source: '/landing/:path*',
      destination: '/landing/:path*',
    },
  ]
}
```

---

## 📊 Monitor Your Landing Page

### Google Analytics Setup
```typescript
// In app/layout.tsx, add:
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Track Landing Page Events
```typescript
// In components/landing/plg/advanced-plg-landing.tsx

// Track when analysis completes
gtag('event', 'analysis_complete', {
  score: score.overall,
  domain: url,
  session_number: sessions
});

// Track share-to-unlock
gtag('event', 'share_unlock', {
  feature: shareFeature
});
```

---

## 🚀 Next: Enhance the Landing Page

### Add Real API Backend
- [ ] Create `/api/analyze-dealer` endpoint
- [ ] Connect to actual AI platforms
- [ ] Store results in database
- [ ] Implement real-time updates

### Add Authentication
- [ ] Integrate Clerk
- [ ] Add "Start Free Trial" button
- [ ] Connect to user database
- [ ] Implement session tracking

### Add Payments
- [ ] Integrate Stripe
- [ ] Set up pricing plans
- [ ] Add checkout flow
- [ ] Connect to subscription logic

### Add Email Automation
- [ ] Send welcome emails (Resend)
- [ ] Weekly AI visibility reports
- [ ] Competitor alerts
- [ ] Trial expiration reminders

---

## 📈 Expected Performance

Based on similar PLG landing pages:
- **Load Time:** < 2 seconds
- **Conversion Rate:** 25-40% (visitor → email)
- **Share Rate:** 10-15% (analysis → share)
- **Upgrade Rate:** 5-10% (email → paid)

**Optimization Targets:**
- Lighthouse Performance: 90+
- SEO Score: 90+
- Accessibility: 95+
- Best Practices: 95+

---

## ✅ You're Ready to Deploy!

1. Run the build command
2. Deploy to Vercel
3. Configure custom domain
4. Test everything
5. Monitor analytics

**Let's ship it! 🚀**

