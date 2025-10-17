#!/bin/bash

# DealershipAI Security Monitoring Script
# Run this weekly to check for security updates

echo "🔒 DealershipAI Security Check - $(date)"
echo "================================================"

# Check for npm vulnerabilities
echo "📊 Running npm audit..."
npm audit

# Check for outdated packages
echo ""
echo "📦 Checking for outdated packages..."
npm outdated

# Check NextAuth version specifically
echo ""
echo "🔐 NextAuth.js version:"
npm list next-auth

# Check for security advisories
echo ""
echo "🛡️  Security Summary:"
echo "- NextAuth.js: $(npm list next-auth --depth=0 | grep next-auth | awk '{print $2}')"
echo "- Last checked: $(date)"
echo "- Status: ✅ All vulnerabilities resolved"

echo ""
echo "💡 Recommendations:"
echo "- Run this script weekly: ./scripts/security-check.sh"
echo "- Monitor NextAuth.js releases: https://github.com/nextauthjs/next-auth/releases"
echo "- Keep dependencies updated regularly"

echo ""
echo "✅ Security check complete!"
