# DealershipAI Claude Export

## 🧠 Quick Access

**Download**: [dealershipai_claude_export.zip](./dealershipai_claude_export.zip)

**Size**: ~2.1 MB

## 📋 What's Inside

This export contains the complete DealershipAI Cognitive Interface codebase, optimized for Claude and Cursor AI assistants:

- **Full source code**: `app/`, `components/`, `lib/`
- **Configuration files**: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `middleware.ts`
- **Documentation**: `INDEX.md`, `README.md`
- **Manifest**: `exports/manifest.json` (master architecture map)

## 🚀 Tech Stack

- **Next.js 14** (App Router with route groups)
- **Clerk** (Authentication & user management)
- **Framer Motion** (Cinematic animations)
- **Tailwind CSS** (Styling)
- **Zustand** (State management)
- **Supabase** (PostgreSQL database)
- **Upstash Redis** (Caching & rate limiting)

## 🎯 Key Features

### Cognitive Interface Components
- `TronAcknowledgment.tsx` - System initialization sequence
- `OrchestratorReadyState.tsx` - Orchestration readiness UI
- `PulseAssimilation.tsx` - Real-time data integration
- `SystemOnlineOverlay.tsx` - System status overlay

### Route Structure
- **Marketing**: `app/(marketing)/` - Landing & onboarding
- **Dashboard**: `app/(dashboard)/` - Main application interface
- **Admin**: `app/(admin)/` - Administration panel
- **Drive**: `app/drive/` - AI visibility testing

### API Routes
- `/api/claude/export` - Export metadata & version tracking
- `/api/claude/manifest` - Project manifest JSON
- `/api/telemetry/` - Event tracking
- `/api/pulse/*` - Market pulse monitoring
- `/api/health` - System health checks

## 🧠 Claude Handoff Prompt

Use this prompt when loading the export into Claude:

```
Load project from https://dealershipai.vercel.app/claude/dealershipai_claude_export.zip

Manifest: /exports/manifest.json

Build cinematic Next.js 14 interface with Clerk + Framer Motion.
Use the cognitive interface patterns in components/cognitive/*.
Maintain brand hue continuity using the useBrandHue hook.
```

## 📖 Quick Start Guide

After downloading and extracting:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Visit:
- `/` - Landing page
- `/onboarding` - Onboarding flow
- `/dashboard` - Main dashboard
- `/drive` - AI visibility testing
- `/admin` - Admin panel

## 🔑 Required Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional: AI Platform APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

## 📊 Architecture Highlights

- **Route Groups**: Clean separation of concerns with Next.js 14 route groups
- **Edge Middleware**: Clerk authentication on Vercel Edge runtime
- **Real-time Updates**: Supabase subscriptions + Redis caching
- **Brand Theming**: Dynamic color system via `useBrandHue` hook
- **Type Safety**: Full TypeScript coverage with strict mode

## 🎨 Cinematic UX Patterns

The interface uses a "cognitive interface" design pattern:

1. **TronAcknowledgment**: System boot sequence
2. **OrchestratorReadyState**: Readiness confirmation
3. **PulseAssimilation**: Data synchronization
4. **SystemOnlineOverlay**: Operational status

All animations respect `prefers-reduced-motion` for accessibility.

## 📚 Documentation

- **INDEX.md**: Quick reference guide (included in ZIP)
- **README.md**: Setup and architecture overview (included in ZIP)
- **manifest.json**: Complete project metadata for AI agents

## 🔗 Live URLs

- **Production**: https://dealershipai.vercel.app
- **Export Download**: https://dealershipai.vercel.app/claude/dealershipai_claude_export.zip
- **Manifest API**: https://dealershipai.vercel.app/api/claude/manifest
- **Export Metadata**: https://dealershipai.vercel.app/api/claude/export

## 📝 Version

- **Version**: 3.0.0
- **Export Format**: 3.0-cognitive
- **Last Updated**: 2025-11-10

---

**Generated with** ❤️ **by DealershipAI**

For questions or support, visit the [GitHub repository](https://github.com/Kramerbrian/dealership-ai-dashboard)
