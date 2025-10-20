#!/bin/bash
# DealershipAI Release Final Script
set -e
VERSION="v1.0.0-final"
echo "🚀 DealershipAI Release $VERSION"
npm run build && git tag -a "$VERSION" -m "Option D Complete" && echo "✅ Release ready"
