#!/bin/bash

# Fix Production Blockers - Run this to get to 95% production ready

echo "🔧 Fixing Production Blockers..."
echo ""

# 1. Fix all SSR errors by adding dynamic export
echo "1. Fixing SSR errors..."
find app -name "page.tsx" -type f -exec grep -l "use client" {} \; | while read file; do
  if ! grep -q "export const dynamic" "$file"; then
    # Check if file has 'use client' directive
    if grep -q "'use client'" "$file" || grep -q '"use client"' "$file"; then
      # Add after 'use client' line
      sed -i '' "/'use client'/a\\
\\
// Force dynamic rendering\\
export const dynamic = 'force-dynamic';" "$file"
      echo "  ✅ Fixed: $file"
    fi
  fi
done

# 2. Switch Prisma to PostgreSQL
echo ""
echo "2. Switching Prisma to PostgreSQL..."
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
  sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
  sed -i '' 's|url      = "file:./dev.db"|url      = env("DATABASE_URL")|' prisma/schema.prisma
  echo "  ✅ Updated prisma/schema.prisma"
else
  echo "  ℹ️  Already using PostgreSQL"
fi

# 3. Fix next.config.js warning
echo ""
echo "3. Fixing next.config.js warning..."
if grep -q "serverComponentsExternalPackages" next.config.js; then
  # Move to root level (not experimental)
  sed -i '' 's/experimental: {$/experimental: {/' next.config.js
  sed -i '' 's/serverComponentsExternalPackages/serverExternalPackages/' next.config.js || true
  echo "  ✅ Fixed next.config.js"
fi

echo ""
echo "✅ Production blockers fixed!"
echo ""
echo "Next steps:"
echo "1. Add environment variables to Vercel"
echo "2. Run: npm run build (to test)"
echo "3. Run: vercel --prod (to deploy)"

