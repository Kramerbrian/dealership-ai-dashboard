# DealershipAI Theatrical PLG Export - Deployment Guide

## 🚀 Quick Start

### Option 1: Cursor Create Command (Recommended)

Paste this into Cursor's Command Palette (**⌘ K**):

```
@import Create DealershipAI Theatrical PLG Experience from https://dealershipai.com/exports/dealershipai_theatrical_export.zip
```

Cursor will automatically:
- Unpack the zip
- Read `theatrical_manifest.json`
- Generate all TSX pages from stubs
- Link Clerk, hooks, and components
- Ready for deployment

### Option 2: Manual Setup

```bash
# 1. Extract the zip
unzip dealershipai_theatrical_export.zip

# 2. Create Next.js project
npx create-next-app@latest dealershipai-theatrical --typescript --tailwind --app

# 3. Copy stubs to appropriate locations
cp stubs/landing.page.tsx.stub app/landing/page.tsx
cp stubs/onboarding.page.tsx.stub app/onboarding/page.tsx
cp stubs/dashboard.page.tsx.stub app/dashboard/page.tsx
cp stubs/layout.middleware.stub.tsx app/layout.tsx
cp stubs/hooks.useBrandHue.stub.ts hooks/useBrandHue.ts

# 4. Install dependencies
npm install @clerk/nextjs framer-motion lucide-react

# 5. Configure environment variables
cp .env.example .env.local
# Add your Clerk and Supabase keys

# 6. Run dev server
npm run dev
```

---

## 📦 Package Contents

```
dealershipai_theatrical_export/
├── exports/
│   └── theatrical_manifest.json    # Project manifest
├── stubs/
│   ├── landing.page.tsx.stub       # Cinematic landing page
│   ├── onboarding.page.tsx.stub    # PVR onboarding flow
│   ├── layout.middleware.stub.tsx   # Clerk + brand hue provider
│   ├── dashboard.page.tsx.stub      # Pulse dashboard
│   └── hooks.useBrandHue.stub.ts   # Brand tint continuity
├── README_DEPLOY.md                 # This file
└── index.txt                        # Overview
```

---

## 🔧 Environment Variables

Required in `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (for Orchestrator)
OPENAI_API_KEY=sk-...

# Optional
ORCHESTRATOR_API=https://api.dealershipai.com
ORCHESTRATOR_TOKEN=your_token
```

---

## 🎨 Features

### Cinematic Landing Page
- Animated hero section with brand hue
- Instant analyzer CTA
- Clerk sign-up/sign-in modals
- Feature preview cards
- PG-safe motion animations

### Onboarding Flow
- 3-step PVR (Profile, Verification, Ready) process
- Tron acknowledgment hand-off
- Brand hue continuity
- Smooth step transitions

### Dashboard
- Pulse dashboard preview
- Quick stats cards
- Orchestrator 3.0 CTA
- Brand hue integration

### Brand Hue System
- Persistent hue across sessions
- Professional blue-cyan spectrum (200-280)
- localStorage persistence
- Context provider pattern

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
# Or use CLI:
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
# ... etc
```

### Other Platforms

The app is standard Next.js 14 and can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Railway
- Any Node.js hosting

---

## 🧪 Testing

```bash
# Local development
npm run dev

# Test routes:
# - http://localhost:3000/ (Landing)
# - http://localhost:3000/onboarding (Onboarding)
# - http://localhost:3000/dashboard (Dashboard)
# - http://localhost:3000/preview/orchestrator (Orchestrator)
```

---

## 📚 Documentation

- **Manifest**: `exports/theatrical_manifest.json`
- **Stubs**: `stubs/*.stub`
- **Deployment**: This file

---

## 🎯 Next Steps After Deployment

1. ✅ Configure Clerk authentication
2. ✅ Set up Supabase database
3. ✅ Add OpenAI API key for Orchestrator
4. ✅ Customize brand hue (optional)
5. ✅ Deploy to production
6. ✅ Test all routes

---

## 🆘 Troubleshooting

### Clerk not working
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- Check Clerk dashboard for correct domain configuration

### Brand hue not persisting
- Check browser localStorage
- Verify `BrandHueProvider` wraps your app in `layout.tsx`

### Build errors
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run type-check`

---

**Ready to deploy?** Use the Cursor create command or follow manual setup above.

