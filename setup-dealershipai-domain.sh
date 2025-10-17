#!/bin/bash

# Custom Domain Setup Script for dealershipai.com
# This script helps set up the custom domain and OAuth configuration

echo "🌐 Setting up dealershipai.com custom domain"
echo "============================================="
echo ""

# Configuration
CUSTOM_DOMAIN="dealershipai.com"
PROJECT_ID="dealershipai-473217"

echo "📋 Configuration:"
echo "   Custom Domain: $CUSTOM_DOMAIN"
echo "   Google Cloud Project: $PROJECT_ID"
echo ""

# Check if domain is accessible
echo "🔍 Checking domain status..."
if curl -s -I "https://$CUSTOM_DOMAIN" | grep -q "200 OK"; then
    echo "   ✅ Domain $CUSTOM_DOMAIN is accessible"
elif curl -s -I "https://$CUSTOM_DOMAIN" | grep -q "301\|302"; then
    echo "   ⚠️  Domain $CUSTOM_DOMAIN is redirecting"
else
    echo "   ❌ Domain $CUSTOM_DOMAIN is not accessible yet"
    echo "   💡 DNS may still be propagating (can take 24-48 hours)"
fi
echo ""

# Check Vercel domain status
echo "🔧 Checking Vercel domain configuration..."
if vercel domains ls | grep -q "$CUSTOM_DOMAIN"; then
    echo "   ✅ Domain is configured in Vercel"
else
    echo "   ❌ Domain not found in Vercel"
    echo "   💡 You may need to:"
    echo "      1. Remove domain from other project"
    echo "      2. Add domain to current project"
fi
echo ""

# Show DNS configuration
echo "📋 DNS Configuration Required:"
echo "   Add these DNS records to your domain registrar:"
echo ""
echo "   Type: A"
echo "   Name: @"
echo "   Value: 76.76.19.61"
echo ""
echo "   Type: CNAME"
echo "   Name: www"
echo "   Value: cname.vercel-dns.com"
echo ""

# Show OAuth configuration
echo "🔧 OAuth Configuration for Google Cloud Console:"
echo "   Go to: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
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
echo "   User support email: kainomura@dealershipai.com"
echo ""

# Show environment variables to update
echo "🔧 Vercel Environment Variables to Update:"
echo "   Run these commands:"
echo ""
echo "   # Remove old NEXTAUTH_URL"
echo "   vercel env rm NEXTAUTH_URL production"
echo ""
echo "   # Add new NEXTAUTH_URL"
echo "   echo 'https://$CUSTOM_DOMAIN' | vercel env add NEXTAUTH_URL production"
echo ""
echo "   # Update other URLs"
echo "   echo 'https://$CUSTOM_DOMAIN' | vercel env add NEXT_PUBLIC_APP_URL production"
echo "   echo 'https://$CUSTOM_DOMAIN' | vercel env add NEXT_PUBLIC_DASHBOARD_URL production"
echo "   echo 'https://$CUSTOM_DOMAIN' | vercel env add NEXT_PUBLIC_MARKETING_URL production"
echo ""

# Test current deployment
echo "🧪 Testing current deployment..."
CURRENT_DEPLOYMENT="https://dealership-ai-dashboard-6b0t156p4-brian-kramers-projects.vercel.app"
if curl -s -I "$CURRENT_DEPLOYMENT" | grep -q "200 OK"; then
    echo "   ✅ Current deployment is working"
else
    echo "   ❌ Current deployment has issues"
    echo "   💡 You may need to fix build errors first"
fi
echo ""

echo "🎯 Next Steps:"
echo "1. Configure DNS records (if not done)"
echo "2. Add domain to Vercel project"
echo "3. Update Google Cloud Console OAuth settings"
echo "4. Update Vercel environment variables"
echo "5. Deploy to production"
echo "6. Test OAuth flow"
echo ""
echo "📋 Quick OAuth Test (after setup):"
echo "   curl -I https://$CUSTOM_DOMAIN/api/auth/signin/google"
echo ""
echo "🎉 Expected Result: 302 redirect to Google OAuth"
echo ""
