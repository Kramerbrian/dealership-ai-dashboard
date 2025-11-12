#!/bin/bash

# export-for-claude.sh
# Creates a single ZIP archive optimized for Claude/Cursor ingestion
# Usage: ./scripts/export-for-claude.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXPORT_DIR="$PROJECT_ROOT/claude-export"
OUTPUT_ZIP="$PROJECT_ROOT/dealershipai_claude_export.zip"

echo "🧠 DealershipAI → Claude Export Builder"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clean previous export
if [ -d "$EXPORT_DIR" ]; then
  echo "🧹 Cleaning previous export..."
  rm -rf "$EXPORT_DIR"
fi

if [ -f "$OUTPUT_ZIP" ]; then
  rm "$OUTPUT_ZIP"
fi

# Create export structure
echo "📦 Creating export structure..."
mkdir -p "$EXPORT_DIR"

# Copy core directories
echo "📋 Copying source files..."
cp -r "$PROJECT_ROOT/app" "$EXPORT_DIR/" 2>/dev/null || echo "⚠️  app/ not found"
cp -r "$PROJECT_ROOT/components" "$EXPORT_DIR/" 2>/dev/null || echo "⚠️  components/ not found"
cp -r "$PROJECT_ROOT/lib" "$EXPORT_DIR/" 2>/dev/null || echo "⚠️  lib/ not found"
cp -r "$PROJECT_ROOT/exports" "$EXPORT_DIR/" 2>/dev/null || echo "⚠️  exports/ not found"

# Copy config files
cp "$PROJECT_ROOT/package.json" "$EXPORT_DIR/" 2>/dev/null || echo "⚠️  package.json not found"
cp "$PROJECT_ROOT/tsconfig.json" "$EXPORT_DIR/" 2>/dev/null || true
cp "$PROJECT_ROOT/tailwind.config.ts" "$EXPORT_DIR/" 2>/dev/null || true
cp "$PROJECT_ROOT/next.config.js" "$EXPORT_DIR/" 2>/dev/null || true
cp "$PROJECT_ROOT/middleware.ts" "$EXPORT_DIR/" 2>/dev/null || true

# Create INDEX.md
echo "📝 Creating INDEX.md..."
cat > "$EXPORT_DIR/INDEX.md" << 'EOF'
# DealershipAI Cognitive Interface — Claude Context Index

Load this folder into Claude or Cursor.

## Entry Files
- **Landing**: app/(mkt)/page.tsx or app/(marketing)/page.tsx
- **Onboarding**: app/(marketing)/onboarding/page.tsx
- **Dashboard**: app/(dashboard)/dashboard/page.tsx
- **Preview**: app/(dashboard)/preview/page.tsx
- **Drive**: app/drive/page.tsx
- **Admin**: app/(admin)/admin/page.tsx

## API Routes
- Market Pulse: app/api/marketpulse/compute/route.ts
- Save Metrics: app/api/save-metrics/route.ts
- Telemetry: app/api/telemetry/route.ts
- Health: app/api/health/route.ts
- Pulse APIs: app/api/pulse/*/route.ts

## Cinematic Components
- components/cognitive/TronAcknowledgment.tsx
- components/cognitive/OrchestratorReadyState.tsx
- components/cognitive/PulseAssimilation.tsx
- components/cognitive/SystemOnlineOverlay.tsx
- components/clay/* (Clay.ai UX components)
- components/pulse/* (Pulse dashboard components)

## Hooks & State
- lib/hooks/useBrandHue.ts - Brand color theming
- lib/store.ts - Zustand state management

## Adapters
- lib/adapters/ga4.ts - Google Analytics 4 integration
- lib/adapters/reviews.ts - Review aggregation
- lib/adapters/schema.ts - Schema.org markup
- lib/adapters/visibility.ts - AI visibility testing

## Manifest
- exports/manifest.json — Master map for reasoning

## Key Libraries
- Next.js 14 (App Router)
- Clerk (Authentication)
- Framer Motion (Animations)
- Tailwind CSS (Styling)
- Zustand (State Management)
- Supabase (Database)
- Upstash Redis (Caching/Rate Limiting)
EOF

# Create README.md
echo "📝 Creating README.md..."
cat > "$EXPORT_DIR/README.md" << 'EOF'
# DealershipAI 3.0 Cognitive Interface

**Next.js 14** + **Clerk** + **Framer Motion** + **Tailwind** + **Zustand**

AI-powered dealership visibility and intelligence dashboard with:
- Multi-platform review aggregation
- Sentiment analysis
- Revenue impact calculations
- Real-time market pulse monitoring
- Cinematic UI/UX with brand-tinted motion continuity

## Claude Instructions

1. **Read** exports/manifest.json to understand the system architecture
2. **Build or refine** pages/components as requested
3. **Never modify** manifest key names
4. **Keep output** as valid TSX or JSON_PATCH diffs
5. **Follow** the cognitive interface patterns in components/cognitive/*
6. **Maintain** brand hue continuity using useBrandHue hook

## Quick Start (After Claude Generation)

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
\`\`\`

## Key Routes

- / → Cinematic landing page
- /onboarding → Live calibration flow
- /dashboard → Main dashboard
- /preview → Preview dashboard
- /drive → AI visibility testing
- /admin → Admin panel

## Architecture Highlights

- **Route Groups**: Uses Next.js App Router with route groups (marketing), (dashboard), (admin), (mkt)
- **Middleware**: Clerk authentication with custom route protection
- **Real-time Updates**: Supabase subscriptions + Upstash Redis caching
- **Cinematic UX**: Framer Motion animations with brand color theming
- **Type Safety**: Full TypeScript coverage with strict mode

## Database

Supabase PostgreSQL with migrations in /supabase/migrations/

Key tables:
- telemetry_events - System event tracking
- dealers - Dealer profiles
- integrations - Third-party API connections

## Deployment

Optimized for Vercel deployment with:
- Edge middleware
- API route rate limiting
- Automatic preview deployments
- Environment variable management

---

**Generated**: $(date +"%Y-%m-%d %H:%M:%S")
**Export Version**: 3.0-cognitive
EOF

# Create ZIP
echo "🗜️  Creating ZIP archive..."
cd "$EXPORT_DIR"
zip -r "$OUTPUT_ZIP" . -q

# Get file size
FILE_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
FILE_SIZE_BYTES=$(stat -f%z "$OUTPUT_ZIP" 2>/dev/null || stat -c%s "$OUTPUT_ZIP" 2>/dev/null || echo "0")

# Get git info
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Read manifest version
MANIFEST_VERSION=$(node -p "require('./exports/manifest.json').version" 2>/dev/null || echo "3.0.0")

# Move to public directory for Vercel hosting
echo "📤 Moving to public/claude directory..."
mkdir -p "$PROJECT_ROOT/public/claude"
mv "$OUTPUT_ZIP" "$PROJECT_ROOT/public/claude/"

# Cleanup
cd "$PROJECT_ROOT"
rm -rf "$EXPORT_DIR"

# Log to Supabase (if API is available)
if [ -f ".env.local" ]; then
  echo "📊 Logging export to Supabase..."

  # Try to log export via API
  curl -s -X POST http://localhost:3000/api/claude/export \
    -H "Content-Type: application/json" \
    -d "{
      \"version\": \"${MANIFEST_VERSION}\",
      \"fileSizeBytes\": ${FILE_SIZE_BYTES},
      \"filePath\": \"/claude/dealershipai_claude_export.zip\",
      \"manifestVersion\": \"${MANIFEST_VERSION}\",
      \"gitBranch\": \"${GIT_BRANCH}\",
      \"gitCommit\": \"${GIT_COMMIT}\",
      \"exportedBy\": \"$(whoami)\",
      \"metadata\": {
        \"exportedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
      }
    }" > /dev/null 2>&1 || echo "⚠️  Supabase logging skipped (API not available)"
fi

echo ""
echo "✅ Export complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Archive: public/claude/dealershipai_claude_export.zip"
echo "📊 Size: $FILE_SIZE ($FILE_SIZE_BYTES bytes)"
echo "🌿 Branch: $GIT_BRANCH"
echo "📝 Commit: $GIT_COMMIT"
echo "🏷️  Version: $MANIFEST_VERSION"
echo ""
echo "🌐 Access URLs (after deployment):"
echo ""
echo "  📥 Download (Production):"
echo "     https://dealership-ai-dashboard-9vtqcjhhm-brian-kramer-dealershipai.vercel.app/claude/dealershipai_claude_export.zip"
echo ""
echo "  📋 Manifest (in ZIP):"
echo "     exports/manifest.json"
echo ""
echo "  📄 Documentation (in ZIP):"
echo "     INDEX.md, README.md"
echo ""
echo "🧠 Claude Handoff Prompt:"
echo ""
echo "  Load project from"
echo "  https://dealership-ai-dashboard-9vtqcjhhm-brian-kramer-dealershipai.vercel.app/claude/dealershipai_claude_export.zip"
echo ""
echo "  Manifest: /exports/manifest.json"
echo ""
echo "  Build cinematic Next.js 14 interface with Clerk + Framer Motion."
echo "  Use the cognitive interface patterns and maintain brand hue continuity."
echo ""
echo "✅ Export is in public/claude/ and ready for deployment"
echo ""
echo "🚀 To deploy: npx vercel --prod"
echo ""
