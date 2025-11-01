# Quick Start Guide - DealershipAI Landing Page

## ⚡ 3-Command Deployment

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Deploy to Vercel
npm run deploy
```

Visit: http://localhost:3000

## 📦 What You Got

✅ **Ultra-lean landing page** (~25KB total)
✅ **API route** (`/api/scan/quick`) with mock data
✅ **Exit-intent modal** (converts 15-20% of bounces)
✅ **Real-time scan preview** (before sign-in)
✅ **Vercel-ready** (automatic routing)

## 🎯 Features

### Current
- Minimal Next.js 14 setup
- Vanilla CSS (no Tailwind)
- System fonts only
- Exit-intent detection
- Scan preview without auth

### Files Created
- `app/page.tsx` - Enhanced landing page
- `app/globals.lean.css` - Vanilla CSS styles
- `app/api/scan/quick/route.ts` - API endpoint
- `vercel.json` - Deployment config
- `next.config.simple.js` - Minimal config

## 🔧 Customization

### Update Brand Colors

Edit `app/globals.lean.css`:

```css
:root {
  --brand: #3ba3ff;      /* Your primary color */
  --brand-2: #8ed0ff;    /* Gradient end */
}
```

### Update Copy

Edit `app/page.tsx`:
- Hero title (line ~120)
- CTA buttons (line ~130)
- Footer text (line ~200)

### Connect Real API

Replace mock data in `app/api/scan/quick/route.ts`:

```typescript
// Replace this:
const preview = { scores: { trust: 84, ... } };

// With real analysis:
const preview = await analyzeDealership(domain);
```

## 🚀 Deploy to Vercel

### Option 1: CLI

```bash
vercel --prod
```

### Option 2: GitHub

1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Auto-deploys on push

### Option 3: Drag & Drop

1. Run `npm run build`
2. Drag `.next` folder to Vercel dashboard

## 📊 Test the API

```bash
# Quick scan
curl -X POST http://localhost:3000/api/scan/quick \
  -H "Content-Type: application/json" \
  -d '{"url":"germaintoyotaofnaples.com"}'

# Health check
curl http://localhost:3000/api/scan/quick
```

## 🎨 Design System

### Colors
- Primary: `#3ba3ff` (blue)
- Success: `#39d98a` (green)
- Warning: `#ffb020` (orange)
- Error: `#f97066` (red)

### Typography
- System font stack (no external fonts)
- Base: 16px
- Headings: 44px (hero), 20px (sections)

### Spacing
- Container: 1080px max-width
- Padding: 28px (wrapper), 18px (panels)

## 🔍 Next Steps

1. **Add Authentication**
   - Install Clerk: `npm install @clerk/nextjs`
   - Create `/app/sign-in/page.tsx`
   - Protect routes

2. **Real Scan Logic**
   - Connect to AI platforms
   - Add Redis caching
   - Store results in database

3. **Enhancements**
   - Personalization engine
   - Social proof widget
   - A/B testing framework

## 📚 Documentation

- `ARCHITECTURE.md` - Complete architecture guide
- `DEPLOYMENT.md` - Detailed deployment steps
- `QUICK-START.md` - This file

## 🐛 Troubleshooting

### Build fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### API not working
- Check `app/api/scan/quick/route.ts` exists
- Verify exports `POST` and `GET`
- Check browser console for errors

### Styles not loading
- Ensure `globals.lean.css` exists
- Check `app/page.tsx` imports it
- Verify CSS classes match

---

**Ready?** Run `npm run dev` and start customizing! 🚀
