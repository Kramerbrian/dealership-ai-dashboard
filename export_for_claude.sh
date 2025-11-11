#!/usr/bin/env bash

# --------------------------------------------------------------------
# DealershipAI Claude Export Builder v3.0
# Creates a clean, LLM-ready zip bundle for Claude or Cursor ingestion.
# --------------------------------------------------------------------

set -e

EXPORT_DIR="claude-export"
ZIP_NAME="dealershipai_claude_export.zip"

echo "🚀  Building Claude export bundle..."

# Clean previous builds
rm -rf "$EXPORT_DIR" "$ZIP_NAME"

# Copy essentials
mkdir -p "$EXPORT_DIR"
cp -r app components lib exports package.json "$EXPORT_DIR"/

# Optional docs
cat > "$EXPORT_DIR/INDEX.md" <<'EOF'
# DealershipAI Cognitive Interface — Claude Context Index

Load this folder into Claude or Cursor.

## Entry files

- Landing: app/(mkt)/page.tsx  
- Onboarding: app/(marketing)/onboarding/page.tsx  
- Dashboard: app/(dashboard)/preview/page.tsx  
- Middleware: middleware.ts  
- Layout: app/layout.tsx  
- API: app/api/marketpulse/compute/route.ts, app/api/save-metrics/route.ts

## Cinematic components

TronAcknowledgment, OrchestratorReadyState, PulseAssimilation, SystemOnlineOverlay.

## Hooks / State

useBrandHue.ts, store.ts (Zustand).

## Manifest

exports/manifest.json — master map for reasoning.
EOF

cat > "$EXPORT_DIR/README.md" <<'EOF'
DealershipAI 3.0 Cognitive Interface  
Next.js 14 + Clerk + Framer Motion + Tailwind + Zustand.

Claude Instructions:

1. Read exports/manifest.json  
2. Build or refine pages/components as requested.  
3. Never modify manifest key names.  
4. Keep output as valid TSX or JSON_PATCH diffs.
EOF

# Zip bundle
cd "$EXPORT_DIR"
zip -rq "../$ZIP_NAME" .
cd ..

echo "✅  Export complete: $ZIP_NAME"
echo "📦  Upload to /public/claude/ or GitHub release."
echo "🌐  Example URL: https://dealershipai.vercel.app/claude/$ZIP_NAME"

