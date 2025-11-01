# DealershipAI Landing Page - Deployment Guide

## 🚀 Ultra-Lean Architecture (≈25KB total)

This is a minimal Next.js 14 landing page with:
- ✅ Zero external dependencies (no Tailwind, no fonts)
- ✅ Vanilla CSS with CSS variables
- ✅ Single API route (`/api/scan/quick`)
- ✅ Exit-intent detection
- ✅ Reduced motion support
- ✅ Production-ready Vercel config

## 📁 File Structure

```
dealershipai-landing/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main landing page (enhanced)
│   ├── globals.css         # Vanilla CSS (no framework)
│   └── api/
│       └── scan/
│           └── quick/
│               └── route.ts # Scan endpoint
├── package.json
├── next.config.js
├── vercel.json            # Deployment config
└── DEPLOYMENT.md         # This file
```

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 3. Build for Production

```bash
npm run build
```

### 4. Test Production Build

```bash
npm start
```

## 🌐 Deploy to Vercel

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Deploy
vercel --prod
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time) or **Yes** (update)
- Project name? **dealershipai-landing**
- Directory? **./**

### Option B: GitHub Integration

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial landing page"
git remote add origin https://github.com/yourusername/dealershipai-landing.git
git push -u origin main
```

2. Connect to Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel auto-detects Next.js
   - Click "Deploy"

### Option C: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Upload folder or connect Git
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **./**
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Deploy"

## 🔧 Environment Variables

Currently none required. Add when integrating:
- `CLERK_SECRET_KEY` (for auth)
- `DATABASE_URL` (for storing scans)
- `OPENAI_API_KEY` (for real analysis)

## 📊 API Routes

### `/api/scan/quick`

**POST** - Run quick scan (no auth required)

Request:
```json
{
  "url": "germaintoyotaofnaples.com"
}
```

Response:
```json
{
  "domain": "germaintoyotaofnaples.com",
  "scores": {
    "trust": 84,
    "schema": 78,
    "zeroClick": 42,
    "freshness": 72
  },
  "mentions": {
    "chatgpt": true,
    "perplexity": false,
    "gemini": true,
    "google_ai": true
  },
  "insights": [
    "Schema coverage is incomplete",
    "Content freshness needs attention"
  ],
  "requiresAuth": true
}
```

**GET** - Health check

Response:
```json
{
  "status": "ok",
  "endpoint": "/api/scan/quick",
  "version": "1.0.0"
}
```

## 🎨 Customization

### Update Colors (globals.css)

```css
:root {
  --brand: #3ba3ff;      /* Primary brand color */
  --brand-2: #8ed0ff;   /* Gradient end */
  --ok: #39d98a;        /* Success green */
  --warn: #ffb020;      /* Warning orange */
  --err: #f97066;       /* Error red */
}
```

### Update Copy (app/page.tsx)

Search for text strings and update:
- Hero title: `"See how trusted your dealership looks to AI."`
- CTA buttons: `"Get started"`, `"Run Free Scan"`
- Footer: Company name and links

### Add Real Scan Logic

Replace mock data in `app/api/scan/quick/route.ts`:

```typescript
// Current: Mock data
const preview = { scores: { trust: 84, ... } };

// Production: Real analysis
const preview = await analyzeDealership(domain);
```

## 🚀 Performance

Expected bundle size:
- **HTML**: ~8KB
- **CSS**: ~3KB
- **JS**: ~14KB (Next.js runtime)
- **Total**: ~25KB (compressed)

**Lighthouse targets:**
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

## 🔒 Security Headers

Already configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📈 Next Steps

1. **Add Authentication**
   - Integrate Clerk for `/sign-in` route
   - Protect `/onboarding` route

2. **Real Analysis**
   - Replace mock data with actual AI platform queries
   - Cache results in Redis (Upstash)

3. **Enhanced Features**
   - Personalization engine (geographic targeting)
   - Social proof widget (live activity feed)
   - A/B testing framework

4. **Analytics**
   - Google Analytics 4
   - PostHog (product analytics)
   - Vercel Analytics

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### API Route Not Found

Ensure `app/api/scan/quick/route.ts` exists and exports `POST` and/or `GET`.

### Styling Not Applied

Check `app/layout.tsx` imports `globals.css`:
```tsx
import "./globals.css";
```

### Exit-Intent Not Working

Check browser console for errors. Modal only shows if:
- User moves mouse to top of viewport
- OR 45 seconds of inactivity
- AND no preview has been shown

## ✅ Pre-Launch Checklist

- [ ] Update brand colors
- [ ] Replace placeholder logos
- [ ] Update copy (hero, CTA, footer)
- [ ] Test on mobile/tablet/desktop
- [ ] Test API endpoint (`/api/scan/quick`)
- [ ] Verify exit-intent modal
- [ ] Check reduced motion support
- [ ] Run Lighthouse audit
- [ ] Deploy to Vercel
- [ ] Test production URL
- [ ] Monitor Vercel logs

## 📞 Support

If deployment fails:
1. Check Vercel build logs
2. Verify `next.config.js` is correct
3. Ensure `package.json` has correct Next.js version
4. Clear `.next` folder and rebuild

---

**Ready to ship?** Run `vercel --prod` and you're live! 🚀
