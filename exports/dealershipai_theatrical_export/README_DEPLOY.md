# DealershipAI Theatrical PLG Export

## 🎬 What This Is

A complete, ready-to-deploy **cinematic product-led growth (PLG) experience** for DealershipAI featuring:

- **Landing Page**: Nolan-inspired neural glass aesthetic with brand tinting
- **Clerk Authentication**: Seamless sign-up/sign-in with middleware
- **Onboarding**: Collect dealership data (URL, role, PVR metrics)
- **Pulse Dashboard**: Real-time decision inbox with AI prioritization
- **Brand Continuity**: useBrandHue hook for consistent theming

---

## 📦 Package Contents

```
dealershipai_theatrical_export/
├── exports/
│   └── theatrical_manifest.json    # Project metadata and structure
├── stubs/
│   ├── landing.page.tsx.stub       # Cinematic landing page
│   ├── onboarding.page.tsx.stub    # PVR collection flow
│   ├── dashboard.page.tsx.stub     # Pulse inbox entry point
│   ├── layout.middleware.stub.tsx  # Clerk provider + routing
│   └── hooks.useBrandHue.stub.ts   # Brand tint hook
├── README_DEPLOY.md                # This file
└── index.txt                       # File listing
```

---

## 🚀 Quick Start (Cursor)

### Option 1: One-Line Import (Recommended)

Paste this into Cursor's Command Palette (**⌘ K**):

```
@import Create DealershipAI Theatrical PLG Experience from https://dealershipai.com/exports/dealershipai_theatrical_export.zip
```

Cursor will automatically:
1. Extract the zip
2. Read `theatrical_manifest.json`
3. Scaffold a new Next.js 14 project
4. Install dependencies (Clerk, Framer Motion, Tailwind, etc.)
5. Wire up all components and routing

### Option 2: Manual Setup

```bash
# 1. Extract the zip
unzip dealershipai_theatrical_export.zip
cd dealershipai_theatrical_export

# 2. Create Next.js project
npx create-next-app@latest dealershipai-app --typescript --tailwind --app --no-src-dir

# 3. Install dependencies
cd dealershipai-app
npm install @clerk/nextjs framer-motion lucide-react zustand

# 4. Copy stubs to appropriate locations
cp ../stubs/landing.page.tsx.stub app/page.tsx
cp ../stubs/onboarding.page.tsx.stub app/onboarding/page.tsx
cp ../stubs/dashboard.page.tsx.stub app/dash/page.tsx
cp ../stubs/layout.middleware.stub.tsx app/layout.tsx
mkdir -p lib/hooks
cp ../stubs/hooks.useBrandHue.stub.ts lib/hooks/useBrandHue.ts

# 5. Set environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk keys

# 6. Run development server
npm run dev
```

---

## 🔑 Environment Variables

Create `.env.local` with:

```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Supabase (Optional - for Pulse features)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Sentry (Optional - for error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

Get Clerk keys at: https://clerk.com/dashboard

---

## 🎨 Brand Customization

### Change Brand Hue

Edit `lib/hooks/useBrandHue.ts`:

```typescript
export function useBrandHue(defaultHue: number = 195): number {
  // 195 = cyan-blue (default)
  // 270 = purple
  // 340 = pink
  // 30 = orange
  const [hue, setHue] = useState(defaultHue);
  // ...
}
```

Or set dynamically in localStorage:

```javascript
localStorage.setItem('brand_hue', '270'); // Purple theme
```

---

## 📂 Project Structure

After deployment, your project will look like:

```
dealershipai-app/
├── app/
│   ├── page.tsx                   # Landing page (from landing.page.tsx.stub)
│   ├── onboarding/
│   │   └── page.tsx               # Onboarding flow
│   ├── dash/
│   │   └── page.tsx               # Dashboard
│   ├── sign-in/[[...sign-in]]/    # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/    # Clerk sign-up
│   └── layout.tsx                 # Root layout with Clerk provider
├── components/
│   ├── pulse/
│   │   └── PulseInboxEnhanced.tsx # Main dashboard component
│   └── providers/
│       └── ClerkProviderWrapper.tsx
├── lib/
│   ├── hooks/
│   │   └── useBrandHue.ts         # Brand tinting hook
│   └── store/
│       └── pulse-store.ts         # Zustand state management
└── middleware.ts                  # Clerk middleware
```

---

## 🌊 User Flow

1. **Landing** (`/`) - Hero with Clerk CTA
2. **Sign Up** (`/sign-up`) - Clerk authentication
3. **Onboarding** (`/onboarding`) - Collect PVR data
4. **Dashboard** (`/dash`) - Pulse Decision Inbox

---

## 🎯 Key Features

### Landing Page
- Framer Motion animations (Tron aesthetic)
- Brand hue tinting throughout
- Mobile-responsive
- Clerk sign-in/sign-up buttons

### Onboarding
- 2-step form (dealership info → revenue metrics)
- Progress indicator
- Brand-tinted UI elements
- Data saved to localStorage

### Dashboard (Pulse Inbox)
- Real-time SSE updates
- AI-powered prioritization
- Virtual scrolling (10,000+ cards)
- Dark mode support
- Export to JSON/CSV

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard:
https://vercel.com/[your-project]/settings/environment-variables

### Other Platforms

Works on any Node.js 18+ platform:
- Netlify
- Railway
- Render
- AWS Amplify

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install --legacy-peer-deps
```

### Clerk redirects not working
Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set and starts with `pk_`

### Brand hue not applying
Check that `useBrandHue` is imported and called in components:
```typescript
const hue = useBrandHue();
```

### Build errors
```bash
rm -rf .next
npm run build
```

---

## 📚 Documentation

- Full docs: https://github.com/Kramerbrian/dealership-ai-dashboard/tree/main/docs
- Clerk setup: [docs/CLERK_DOMAIN_CONFIG.md](https://github.com/Kramerbrian/dealership-ai-dashboard/blob/main/docs/CLERK_DOMAIN_CONFIG.md)
- Pulse features: [docs/PULSE_FEATURES.md](https://github.com/Kramerbrian/dealership-ai-dashboard/blob/main/docs/PULSE_FEATURES.md)
- Monitoring: [docs/MONITORING.md](https://github.com/Kramerbrian/dealership-ai-dashboard/blob/main/docs/MONITORING.md)

---

## 🤝 Support

- GitHub Issues: https://github.com/Kramerbrian/dealership-ai-dashboard/issues
- Repository: https://github.com/Kramerbrian/dealership-ai-dashboard

---

## ⚖️ License

MIT License - See LICENSE file in main repository

---

**Built with:** Next.js 15 • React 18 • Clerk • Framer Motion • Tailwind CSS • Zustand

**Theme:** Cupertino × Tron × Christopher Nolan

**Status:** Production Ready ✅
