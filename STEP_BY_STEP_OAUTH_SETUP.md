# 🚀 Step-by-Step OAuth Setup (5 Minutes)

## Step 1: Google OAuth Setup (2 minutes)

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create/Select Project
- Click "Select a project" → "New Project"
- Name: "DealershipAI" → Create

### 1.3 Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API" → Enable

### 1.4 Create OAuth Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Application type: "Web application"
- Name: "DealershipAI"

### 1.5 Add Redirect URIs
```
http://localhost:3000/api/auth/callback/google
https://dash.dealershipai.com/api/auth/callback/google
```

### 1.6 Copy Credentials
- Copy "Client ID" and "Client Secret"
- Update your `.env.local` file

## Step 2: GitHub OAuth Setup (2 minutes)

### 2.1 Go to GitHub Developer Settings
- Visit: https://github.com/settings/developers
- Sign in to GitHub

### 2.2 Create New OAuth App
- Click "New OAuth App"
- Fill in:
  - **Application name**: `DealershipAI`
  - **Homepage URL**: `https://dealershipai.com`
  - **Authorization callback URL**: `https://dash.dealershipai.com/api/auth/callback/github`

### 2.3 Copy Credentials
- Copy "Client ID" and "Client Secret"
- Update your `.env.local` file

## Step 3: Update Environment Variables (1 minute)

Edit your `.env.local` file and replace:

```bash
# Replace these placeholder values:
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
GITHUB_CLIENT_ID=your-actual-github-client-id-here
GITHUB_CLIENT_SECRET=your-actual-github-client-secret-here
```

## Step 4: Test OAuth Flow

1. **Restart your dev server**:
   ```bash
   # Stop current server (Ctrl+C) then:
   npm run dev
   ```

2. **Test OAuth providers**:
   - Visit: http://localhost:3000/test-auth
   - Click "Test Google OAuth"
   - Click "Test GitHub OAuth"

3. **Test sign-in page**:
   - Visit: http://localhost:3000/auth/signin
   - Try signing in with Google/GitHub

## Step 5: Deploy to Production

```bash
./deploy-to-production.sh
```

## 🎯 Quick Copy-Paste Commands

```bash
# 1. Edit environment file
nano .env.local

# 2. Restart dev server
npm run dev

# 3. Test OAuth
open http://localhost:3000/test-auth

# 4. Deploy to production
./deploy-to-production.sh
```

## ✅ Success Indicators

- ✅ OAuth buttons work on test page
- ✅ Sign-in redirects properly
- ✅ No "Invalid redirect URI" errors
- ✅ Production deployment successful

**Ready to close $499/month deals!** 🎯
