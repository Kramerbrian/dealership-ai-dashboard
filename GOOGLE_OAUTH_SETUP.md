# Google OAuth Setup for DealershipAI

## 🎯 Step-by-Step Google Cloud Console Setup

### Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Create a new project or select existing one

### Step 2: Enable Required APIs
1. Navigate to **"APIs & Services"** → **"Library"**
2. Search for and enable these APIs:
   - **Google+ API** (for user profile access)
   - **Google OAuth2 API** (for authentication)

### Step 3: Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. If prompted, configure the OAuth consent screen first

### Step 4: Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type
3. Fill in required fields:
   - **App name**: DealershipAI
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### Step 5: Create OAuth Client
1. Go back to **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
2. Choose **"Web application"**
3. Configure:
   - **Name**: DealershipAI OAuth
   - **Authorized JavaScript origins**:
     ```
     https://www.dealershipai.com
     https://dealershipai.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://www.dealershipai.com/api/auth/callback/google
     https://dealershipai.com/api/auth/callback/google
     ```

### Step 6: Get Your Credentials
1. After creating, you'll see a popup with:
   - **Client ID** (starts with something like `123456789-abc...`)
   - **Client Secret** (starts with `GOCSPX-...`)
2. Copy both values - you'll need them for Vercel

## 🔧 Add Credentials to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
# Add Google Client ID
echo "your-google-client-id-here" | vercel env add GOOGLE_CLIENT_ID production

# Add Google Client Secret  
echo "your-google-client-secret-here" | vercel env add GOOGLE_CLIENT_SECRET production
```

### Option 2: Vercel Dashboard
1. Go to: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/environment-variables
2. Add these environment variables:
   - **Name**: `GOOGLE_CLIENT_ID`, **Value**: `your-client-id`
   - **Name**: `GOOGLE_CLIENT_SECRET`, **Value**: `your-client-secret`

## 🧪 Test Your Setup

### Deploy Changes
```bash
vercel --prod
```

### Test OAuth Flow
1. Visit: https://www.dealershipai.com/test-oauth
2. Click **"Sign in with Google"**
3. Complete Google OAuth flow
4. Verify session data is captured

### Expected Results
- ✅ Redirects to Google sign-in page
- ✅ After authentication, returns to your app
- ✅ Session data shows user information
- ✅ No error messages

## 🔍 Troubleshooting

### Common Issues
1. **"redirect_uri_mismatch"**: Check redirect URIs in Google Console
2. **"invalid_client"**: Verify Client ID and Secret are correct
3. **"access_denied"**: Check OAuth consent screen configuration
4. **"scope_not_granted"**: Ensure required scopes are enabled

### Debug Commands
```bash
# Check OAuth status
curl -s "https://www.dealershipai.com/api/test-oauth" | jq .

# Test Google OAuth endpoint
curl -I "https://www.dealershipai.com/api/auth/signin/google"

# Check environment variables
vercel env ls | grep GOOGLE
```

## 📋 Checklist

- [ ] Google Cloud Console project created
- [ ] Google+ API and OAuth2 API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] Client ID and Secret copied
- [ ] Credentials added to Vercel
- [ ] Application deployed
- [ ] OAuth flow tested successfully

## 🎉 Success!

Once Google OAuth is working, you'll have:
- ✅ **Google OAuth** - Fully functional
- ✅ **Microsoft OAuth** - Ready (with real credentials)
- ✅ **Facebook OAuth** - Ready (with real credentials)
- ✅ **Enterprise SSO** - Complete authentication system

Your DealershipAI platform will have enterprise-grade OAuth authentication! 🚀
