# DealershipAI Landing Page - Architecture & Scaffolding

## 🏗️ Ultra-Lean Architecture (≈25KB total)

This is a production-ready, minimal Next.js 14 landing page designed for maximum performance and conversion.

## 📁 Complete File Structure

```
dealershipai-landing/
├── app/
│   ├── layout.tsx              # Root layout (metadata, theme)
│   ├── page.tsx                # Main landing (enhanced with exit-intent)
│   ├── globals.lean.css        # Vanilla CSS (no frameworks)
│   └── api/
│       └── scan/
│           └── quick/
│               └── route.ts    # Quick scan endpoint
├── package.json                # Dependencies (Next.js only)
├── next.config.simple.js       # Minimal Next.js config
├── vercel.json                 # Vercel deployment config
├── DEPLOYMENT.md               # Deployment guide
└── ARCHITECTURE.md             # This file
```

## 🎯 Design Principles

### 1. **Zero Dependencies**
- ✅ No Tailwind (vanilla CSS)
- ✅ No external fonts (system stack)
- ✅ No heavy libs (React + Next.js only)
- ✅ No images (inline SVG placeholders)

### 2. **Performance First**
- ✅ CSS variables for theming
- ✅ Reduced motion support
- ✅ Minimal JavaScript
- ✅ Server-side API routes

### 3. **Conversion Optimized**
- ✅ Exit-intent detection
- ✅ Real-time scan preview
- ✅ Clear CTAs
- ✅ Trust indicators

## 🔌 API Architecture

### `/api/scan/quick` Route

**Purpose**: Fast preview scan without authentication

**Methods**:
- `POST` - Run scan (returns preview)
- `GET` - Health check

**Request Format**:
```json
{
  "url": "germaintoyotaofnaples.com"
}
```

**Response Format**:
```json
{
  "domain": "germaintoyotaofnaples.com",
  "timestamp": "2025-01-20T12:00:00Z",
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

**Caching Strategy**:
- Public cache: 60s
- Stale-while-revalidate: 300s
- Prevents excessive API calls

## 🎨 Styling Architecture

### CSS Variables System

```css
:root {
  --bg: #0b0f14;           /* Background */
  --panel: #0f141a;         /* Card background */
  --ink: #e6eef7;           /* Text color */
  --muted: #9bb2c9;         /* Secondary text */
  --brand: #3ba3ff;         /* Primary brand */
  --brand-2: #8ed0ff;       /* Gradient end */
  --ok: #39d98a;            /* Success */
  --warn: #ffb020;          /* Warning */
  --err: #f97066;           /* Error */
}
```

### Component Classes

- `.wrapper` - Max-width container (1080px)
- `.panel` - Card component (glassmorphic)
- `.hero` - Two-column hero layout
- `.card` - Feature card
- `.gauges` - KPI visualization
- `.exit-modal-overlay` - Exit-intent modal

## 🚀 Routing Strategy

### Static Routes (App Router)

- `/` - Landing page (`app/page.tsx`)
- `/sign-in` - Auth (Clerk - to be added)
- `/onboarding` - Onboarding flow (to be added)
- `/learn` - Docs/blog (to be added)

### API Routes

- `/api/scan/quick` - Quick scan endpoint

### Navigation Flow

```
Landing (/) 
  → Enter URL 
  → Run Scan 
  → Preview Results 
  → Sign In (required) 
  → Full Report
```

## 🔐 Authentication Integration (Future)

### Clerk Integration Points

1. **Sign In Button** (`/sign-in`)
   - Currently redirects to placeholder
   - Replace with Clerk sign-in page

2. **Protected Routes**
   - `/dashboard` - Full reports
   - `/onboarding` - Setup flow

3. **API Protection**
   - Add middleware to protect `/api/*` routes
   - Return full scan data only for authenticated users

## 📊 Enhancement Architecture

### Current Enhancements

1. **Exit-Intent Detection**
   - Triggers on mouse leave (top of viewport)
   - Triggers on 45s inactivity
   - Shows modal with lead capture

2. **Real-Time Scan Preview**
   - Immediate API call on submit
   - Live preview before sign-in
   - Smooth fade-in animation

3. **Micro-Interactions**
   - Button hover states
   - Focus indicators
   - Disabled states

### Planned Enhancements

1. **Personalization Engine**
   - Geographic targeting
   - Referrer-based messaging
   - Time-of-day variations

2. **Social Proof Widget**
   - Live activity feed
   - Recent signups
   - Trust badges

3. **A/B Testing Framework**
   - Vercel Edge Config
   - Feature flags
   - Variant tracking

## 🗄️ Data Architecture

### Current (Mock)

- In-memory preview data
- No persistence
- No database

### Production (Planned)

```
PostgreSQL (Supabase)
├── scans
│   ├── id
│   ├── domain
│   ├── user_id (nullable)
│   ├── scores (JSONB)
│   ├── insights (JSONB)
│   └── created_at
└── users
    ├── id (Clerk)
    ├── email
    ├── tier
    └── created_at
```

### Caching Layer

```
Redis (Upstash)
├── scan:{domain} → cached results (24h TTL)
├── session:{id} → scan history (session TTL)
└── geo:{city} → pooled data (24h TTL)
```

## 🔄 State Management

### Client State (React)

- `url` - Input value
- `submitting` - Loading state
- `msg` - Status message
- `preview` - Scan results
- `exitIntentShown` - Modal visibility

### Server State (API)

- Scan results cached in API route
- No global state management needed (yet)

## 📈 Analytics Integration (Future)

### Current

- None (ultra-lean)

### Planned

1. **Vercel Analytics**
   - Web Vitals
   - Performance metrics

2. **PostHog**
   - Product analytics
   - Conversion funnels
   - A/B test tracking

3. **Google Analytics 4**
   - Traffic sources
   - User behavior
   - Conversion events

## 🔒 Security Architecture

### Headers (via `vercel.json`)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### API Security

- Input validation (URL sanitization)
- Rate limiting (to be added)
- CORS (same-origin by default)

## 🚢 Deployment Architecture

### Vercel Configuration

```json
{
  "buildCommand": "NEXT_TELEMETRY_DISABLED=1 next build",
  "framework": "nextjs",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "headers": [ /* Security headers */ ]
}
```

### Build Process

1. `next build` - Compile Next.js app
2. `.next/` - Build output
3. Vercel deploys `.next/` folder
4. API routes auto-route via rewrites

## 📦 Bundle Analysis

### Expected Sizes

- **HTML**: ~8KB
- **CSS**: ~3KB (globals.lean.css)
- **JS**: ~14KB (Next.js runtime)
- **Total**: ~25KB (gzipped)

### Optimization Strategies

1. **Code Splitting**
   - Next.js auto-splits pages
   - API routes separate chunks

2. **Tree Shaking**
   - Only imported code included
   - Unused CSS removed

3. **Minification**
   - Next.js minifies by default
   - CSS minified in production

## 🧪 Testing Strategy

### Current

- Manual testing
- Browser DevTools

### Planned

1. **Unit Tests**
   - Jest + React Testing Library
   - API route tests

2. **E2E Tests**
   - Playwright
   - Critical user flows

3. **Visual Regression**
   - Chromatic
   - Component snapshots

## 🔄 Migration Path

### Phase 1: Static (Current)
- ✅ Landing page
- ✅ Mock API
- ✅ Exit-intent

### Phase 2: Dynamic (Next)
- [ ] Clerk auth
- [ ] Real scan logic
- [ ] Database persistence

### Phase 3: Enhanced (Future)
- [ ] Personalization
- [ ] Social proof
- [ ] A/B testing

## 📚 Best Practices

1. **Keep it lean** - Resist adding dependencies
2. **Performance first** - Measure before optimizing
3. **Progressive enhancement** - Core works, enhancements add value
4. **Accessibility** - Semantic HTML, ARIA labels
5. **Mobile-first** - Responsive from day one

---

**Next Steps**: See `DEPLOYMENT.md` for deployment instructions.

