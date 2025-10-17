# 🚨 IMMEDIATE ACTION STEPS (5 minutes)

## Step 1: Update Google Cloud Console (2 minutes)

### 1.1 Go to Google Cloud Console
- **URL**: https://console.cloud.google.com/apis/credentials
- **Project**: Select your DealershipAI project

### 1.2 Edit OAuth 2.0 Client ID
- Click on your OAuth 2.0 Client ID
- Scroll down to "Authorized redirect URIs"
- **ADD this URI**:
  ```
  https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/callback/google
  ```
- Scroll down to "Authorized JavaScript origins"
- **ADD this origin**:
  ```
  https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app
  ```
- Click "Save"

## Step 2: Set Up Custom Domain (2 minutes)

### 2.1 Go to Vercel Dashboard
- **URL**: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains
- Click "Add Domain"
- Enter: `dealershipai.com`
- Click "Add"

### 2.2 Update DNS Records
- Vercel will show DNS instructions
- Update your domain registrar with the provided records
- Wait for DNS propagation (usually 5-10 minutes)

### 2.3 Update Google Cloud Console (Again)
After custom domain is live, update Google Cloud Console:
- **New redirect URI**: `https://dealershipai.com/api/auth/callback/google`
- **New JavaScript origin**: `https://dealershipai.com`

## Step 3: Test OAuth Flow (1 minute)

### 3.1 Test Current Deployment
```bash
# Test Google OAuth
curl -I "https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/api/auth/signin/google"

# Should return 302 (redirect) - SUCCESS!
# Should return 400 - Still needs Google Cloud Console update
```

### 3.2 Test in Browser
1. Go to: https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app/auth/signin
2. Click "Continue with Google"
3. Complete OAuth flow
4. Verify redirect to dashboard

### 3.3 Test Custom Domain (After DNS propagation)
1. Go to: https://dealershipai.com/auth/signin
2. Click "Continue with Google"
3. Complete OAuth flow
4. Verify redirect to dashboard

## 🎯 SUCCESS CRITERIA

### ✅ Google Cloud Console Updated
- Redirect URI added
- JavaScript origin added
- Changes saved

### ✅ Custom Domain Working
- Domain added to Vercel
- DNS records updated
- Domain resolves to Vercel deployment

### ✅ OAuth Flow Working
- Google OAuth returns 302 (not 400)
- Browser OAuth flow completes successfully
- User redirected to dashboard after authentication

## 🚨 TROUBLESHOOTING

### If OAuth still returns 400:
1. Check Google Cloud Console redirect URI is exact match
2. Wait 5 minutes for Google changes to propagate
3. Clear browser cache and try again

### If custom domain not working:
1. Check DNS records are correct
2. Wait for DNS propagation (up to 24 hours)
3. Use Vercel's domain verification tool

### If OAuth flow fails:
1. Check browser console for errors
2. Verify NEXTAUTH_URL environment variable
3. Test with different browser/incognito mode

---

**Total Time**: 5 minutes
**Priority**: HIGH - Required for production launch
**Status**: Ready to execute
