#!/bin/bash

# Custom Domain Setup Script for DealershipAI
# This script helps set up dealershipai.com custom domain

echo "🌐 Custom Domain Setup for DealershipAI"
echo "======================================"
echo ""

# Configuration
CUSTOM_DOMAIN="dealershipai.com"
CURRENT_DEPLOYMENT="https://dealership-ai-dashboard-foiwkel6w-brian-kramers-projects.vercel.app"

echo "📋 Configuration:"
echo "   Custom Domain: $CUSTOM_DOMAIN"
echo "   Current Deployment: $CURRENT_DEPLOYMENT"
echo ""

# Check if domain is available
echo "🔍 Checking domain availability..."
if curl -s -I "https://$CUSTOM_DOMAIN" | grep -q "200 OK"; then
    echo "   ✅ Domain $CUSTOM_DOMAIN is accessible"
else
    echo "   ⚠️  Domain $CUSTOM_DOMAIN may not be configured yet"
fi
echo ""

# Add domain to Vercel
echo "🔧 Adding custom domain to Vercel..."
if vercel domains add $CUSTOM_DOMAIN; then
    echo "   ✅ Domain added to Vercel successfully"
else
    echo "   ❌ Failed to add domain to Vercel"
    echo "   💡 You may need to:"
    echo "      1. Purchase the domain first"
    echo "      2. Transfer domain to Vercel"
    echo "      3. Configure DNS manually"
fi
echo ""

# Show DNS configuration
echo "📋 DNS Configuration Required:"
echo "   Add these DNS records to your domain registrar:"
echo ""
echo "   Type: CNAME"
echo "   Name: www"
echo "   Value: cname.vercel-dns.com"
echo ""
echo "   Type: A"
echo "   Name: @"
echo "   Value: 76.76.19.61"
echo ""

# Show OAuth configuration
echo "🔧 OAuth Configuration for Google Cloud Console:"
echo "   Go to: https://console.cloud.google.com/apis/credentials?project=dealershipai-473217"
echo ""
echo "   Update OAuth 2.0 Client ID:"
echo "   Authorized redirect URIs:"
echo "   https://$CUSTOM_DOMAIN/api/auth/callback/google"
echo ""
echo "   Authorized JavaScript origins:"
echo "   https://$CUSTOM_DOMAIN"
echo ""
echo "   Update OAuth Consent Screen:"
echo "   Privacy policy URL: https://$CUSTOM_DOMAIN/privacy"
echo "   Terms of service URL: https://$CUSTOM_DOMAIN/terms"
echo ""

# Test current deployment
echo "🧪 Testing current deployment..."
if curl -s -I "$CURRENT_DEPLOYMENT" | grep -q "200 OK"; then
    echo "   ✅ Current deployment is working"
    echo "   📋 Current OAuth URLs to update:"
    echo "   Authorized redirect URIs:"
    echo "   $CURRENT_DEPLOYMENT/api/auth/callback/google"
    echo ""
    echo "   Authorized JavaScript origins:"
    echo "   $CURRENT_DEPLOYMENT"
    echo ""
    echo "   Privacy policy URL: $CURRENT_DEPLOYMENT/privacy"
    echo "   Terms of service URL: $CURRENT_DEPLOYMENT/terms"
else
    echo "   ❌ Current deployment is not accessible"
fi
echo ""

echo "🎯 Next Steps:"
echo "1. Set up custom domain (if not done)"
echo "2. Configure DNS records"
echo "3. Update Google Cloud Console OAuth settings"
echo "4. Test OAuth flow"
echo "5. Update all references to use clean URLs"
echo ""
echo "📋 Quick OAuth Fix (Use Current Deployment):"
echo "   Update Google Cloud Console with:"
echo "   $CURRENT_DEPLOYMENT/api/auth/callback/google"
echo ""