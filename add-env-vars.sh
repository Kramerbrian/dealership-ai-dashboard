#!/bin/bash

# Add missing environment variables for OAuth
echo "Adding NEXTAUTH_URL..."
echo "https://dealershipai.com" | vercel env add NEXTAUTH_URL production

echo "Adding placeholder Azure AD variables..."
echo "placeholder-azure-client-id" | vercel env add AZURE_AD_CLIENT_ID production
echo "placeholder-azure-client-secret" | vercel env add AZURE_AD_CLIENT_SECRET production  
echo "placeholder-azure-tenant-id" | vercel env add AZURE_AD_TENANT_ID production

echo "Adding placeholder Facebook variables..."
echo "placeholder-facebook-app-id" | vercel env add FACEBOOK_CLIENT_ID production
echo "placeholder-facebook-app-secret" | vercel env add FACEBOOK_CLIENT_SECRET production

echo "Environment variables added successfully!"
