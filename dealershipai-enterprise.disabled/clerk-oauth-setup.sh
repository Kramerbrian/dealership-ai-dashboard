#!/bin/bash
# Run this after configuring OAuth providers in Clerk

echo "Add these environment variables to Vercel:"
echo ""
echo "For Google OAuth:"
echo "vercel env add GOOGLE_CLIENT_ID production"
echo "vercel env add GOOGLE_CLIENT_SECRET production"
echo ""
echo "For GitHub OAuth:"
echo "vercel env add GITHUB_ID production"
echo "vercel env add GITHUB_SECRET production"
echo ""
echo "Then redeploy:"
echo "vercel --prod"
