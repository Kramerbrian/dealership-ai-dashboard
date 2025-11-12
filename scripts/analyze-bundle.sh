#!/bin/bash

# Bundle Size Analysis Script
# Analyzes Next.js bundle and identifies optimization opportunities

echo "🔍 Analyzing Bundle Size..."
echo "================================"

# Build with analysis
ANALYZE=true npm run build

echo ""
echo "✅ Bundle analysis complete!"
echo "📊 Reports generated in: bundle-analyzer/"
echo ""
echo "Next steps:"
echo "1. Review bundle-analyzer/client.html"
echo "2. Review bundle-analyzer/server.html"
echo "3. Identify large dependencies"
echo "4. Consider code splitting or dynamic imports"
