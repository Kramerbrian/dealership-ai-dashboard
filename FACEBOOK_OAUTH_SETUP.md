# 📘 FACEBOOK OAUTH SETUP GUIDE

## 🎯 CURRENT STATUS:
- ✅ Google OAuth: Needs Google Cloud Console update
- 🔧 Facebook OAuth: Ready to set up
- ✅ Privacy Policy & Terms: Working

## 📋 STEP 1: CREATE FACEBOOK DEVELOPER APP

### 1.1 Go to Facebook Developers
**URL**: https://developers.facebook.com/

1. **Click "My Apps"**
2. **Click "Create App"**
3. **Select "Consumer" or "Business"**
4. **Fill in app details**:
   - **App Name**: `DealershipAI`
   - **App Contact Email**: `kainomura@dealershipai.com`
   - **App Purpose**: `Business`
5. **Click "Create App"**

### 1.2 Configure Facebook Login
1. **In your app dashboard, click "Add Product"**
2. **Find "Facebook Login" and click "Set Up"**
3. **Select "Web" platform**
4. **Enter your site URL**: `https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app`

## 📋 STEP 2: CONFIGURE OAUTH SETTINGS

### 2.1 Facebook Login Settings
**Go to**: Facebook Login > Settings

**Update these settings**:
```
Valid OAuth Redirect URIs:
https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/api/auth/callback/facebook

App Domains:
dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app
```

### 2.2 App Settings
**Go to**: Settings > Basic

**Update these fields**:
```
App Domains:
dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app

Privacy Policy URL:
https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/privacy

Terms of Service URL:
https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/terms

User Data Deletion Instructions URL:
https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/privacy
```

## 📋 STEP 3: GET CREDENTIALS

### 3.1 App ID and Secret
**Go to**: Settings > Basic

**Copy these values**:
- **App ID**: `YOUR_FACEBOOK_APP_ID`
- **App Secret**: `YOUR_FACEBOOK_APP_SECRET`

### 3.2 Update Environment Variables
```bash
# Add to .env.local
FACEBOOK_CLIENT_ID=YOUR_FACEBOOK_APP_ID
FACEBOOK_CLIENT_SECRET=YOUR_FACEBOOK_APP_SECRET
```

## 📋 STEP 4: UPDATE VERCEL ENVIRONMENT

### 4.1 Add to Vercel
```bash
# Add Facebook credentials to Vercel
vercel env add FACEBOOK_CLIENT_ID production
vercel env add FACEBOOK_CLIENT_SECRET production
```

### 4.2 Redeploy
```bash
vercel --prod
```

## 📋 STEP 5: TEST FACEBOOK OAUTH

### 5.1 Test API
```bash
curl -s -w "Status: %{http_code}\nRedirect: %{redirect_url}\n" "https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/api/auth/signin/facebook"
```

**Expected Result**:
- **Status**: 302
- **Redirect**: `https://www.facebook.com/v18.0/dialog/oauth?client_id=...`

### 5.2 Test Browser Flow
1. **Go to**: https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app/auth/signin
2. **Click**: "Continue with Facebook"
3. **Expected**: Redirects to Facebook OAuth consent screen
4. **Complete**: OAuth flow and verify redirect to dashboard

## 🧪 VERIFICATION CHECKLIST

### ✅ Facebook App Configuration:
- [ ] App created with name "DealershipAI"
- [ ] Facebook Login product added
- [ ] Valid OAuth redirect URI set
- [ ] App domains configured
- [ ] Privacy policy URL set
- [ ] Terms of service URL set

### ✅ Environment Variables:
- [ ] FACEBOOK_CLIENT_ID set in Vercel
- [ ] FACEBOOK_CLIENT_SECRET set in Vercel
- [ ] App redeployed with new variables

### ✅ OAuth Testing:
- [ ] Facebook OAuth API returns 302 redirect
- [ ] Browser OAuth flow works end-to-end
- [ ] User can sign in with Facebook
- [ ] Redirects to dashboard after OAuth

## 🚨 TROUBLESHOOTING

### If Facebook OAuth Shows Error:
1. **Check App ID and Secret** are correct
2. **Verify redirect URI** matches exactly
3. **Ensure app is not in development mode** (if needed)
4. **Check app domains** are configured
5. **Verify privacy policy and terms URLs** are accessible

### If App Review Required:
1. **Submit app for review** if using advanced permissions
2. **Use basic permissions** for initial testing
3. **Add test users** for development testing

## 📊 SUCCESS CRITERIA

### ✅ Facebook OAuth Working:
- [ ] Returns 302 redirect to Facebook
- [ ] Shows "DealershipAI" app name
- [ ] User can complete sign-in flow
- [ ] Redirects to dashboard after OAuth
- [ ] No error messages

---

**Priority**: HIGH - Complete OAuth provider setup
**ETA**: 15 minutes to complete Facebook OAuth setup
**Status**: Ready to execute
