# 🚨 URGENT OAuth Fix Required

## Current Issue
OAuth is returning 400 errors because the Google Cloud Console redirect URI doesn't match the new deployment URL.

## New Deployment URL
```
https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app
```

## IMMEDIATE ACTION REQUIRED

### 1. Update Google Cloud Console (2 minutes)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. **Add this redirect URI:**
   ```
   https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/callback/google
   ```
4. **Add this JavaScript origin:**
   ```
   https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app
   ```
5. Save changes

### 2. Test OAuth Flow
After updating Google Cloud Console:
```bash
curl -I "https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/signin/google"
```
Should return 302 (redirect) instead of 400.

### 3. Set Up Custom Domain (5 minutes)
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add domain: `dealershipai.com`
3. Update DNS records as instructed by Vercel
4. Update Google Cloud Console with new domain:
   - Redirect URI: `https://dealershipai.com/api/auth/callback/google`
   - JavaScript origin: `https://dealershipai.com`

## Environment Variables Status ✅
- ✅ GOOGLE_CLIENT_ID: Set
- ✅ GOOGLE_CLIENT_SECRET: Set  
- ✅ NEXTAUTH_URL: Updated to new deployment
- ✅ NEXTAUTH_SECRET: Set

## Next Steps After OAuth Fix
1. Test complete user flow: Sign up → OAuth → Dashboard
2. Configure Sentry for error monitoring
3. Set up GA4 tracking
4. Implement real data integration

## Test Commands
```bash
# Test OAuth providers
curl -s "https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/providers" | jq .

# Test Google OAuth
curl -I "https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/signin/google"

# Test GitHub OAuth  
curl -I "https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/signin/github"
```

**Priority: Update Google Cloud Console redirect URI immediately!**
