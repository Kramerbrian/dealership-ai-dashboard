#!/bin/bash

# Fix API routes with missing req parameter
echo "🔧 Fixing API routes with missing req parameter..."

# Find all API route files that use req.url but don't have req parameter
find app/api -name "route.ts" -type f | while read file; do
  if grep -q "new URL(req.url)" "$file" && ! grep -q "export async function GET(req:" "$file"; then
    echo "Fixing $file..."
    
    # Add NextRequest import if not present
    if ! grep -q "NextRequest" "$file"; then
      sed -i '' 's/import { NextResponse }/import { NextRequest, NextResponse }/' "$file"
    fi
    
    # Add req parameter to GET function
    sed -i '' 's/export async function GET()/export async function GET(req: NextRequest)/' "$file"
  fi
done

echo "✅ API routes fixed"
