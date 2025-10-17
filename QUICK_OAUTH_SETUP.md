# 🚀 Quick OAuth Setup Guide for DealershipAI

## ⚡ Quick Start (5 Minutes)

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → Enable Google+ API
3. Credentials → Create OAuth 2.0 Client ID
4. **Redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google`
   - `https://dash.dealershipai.com/api/auth/callback/google`
5. Copy Client ID & Secret to `.env.local`

### 2. GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. **Settings:**
   - Name: `DealershipAI`
   - Homepage: `https://dealershipai.com`
   - Callback: `https://dash.dealershipai.com/api/auth/callback/github`
4. Copy Client ID & Secret to `.env.local`

### 3. Update Environment Variables
Edit `.env.local` and replace:
```bash
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GITHUB_CLIENT_ID=your-actual-github-client-id
GITHUB_CLIENT_SECRET=your-actual-github-client-secret
```

### 4. Test Authentication
```bash
npm run dev
# Visit: http://localhost:3000/test-auth
```

## 🎯 Production Deployment

### Vercel Environment Variables
Add these to your Vercel project:
- `NEXTAUTH_URL` = `https://dash.dealershipai.com`
- `NEXTAUTH_SECRET` = `your-secret-key`
- `GOOGLE_CLIENT_ID` = `your-google-client-id`
- `GOOGLE_CLIENT_SECRET` = `your-google-client-secret`
- `GITHUB_CLIENT_ID` = `your-github-client-id`
- `GITHUB_CLIENT_SECRET` = `your-github-client-secret`

### Deploy
```bash
vercel --prod
```

## ✅ Testing Checklist
- [ ] Landing page loads with Sign In button
- [ ] OAuth providers work on `/test-auth`
- [ ] Sign-in page functions properly
- [ ] CTAs redirect correctly
- [ ] Production deployment successful

## 🚨 Troubleshooting
- **"Invalid redirect URI"**: Check OAuth provider settings match exactly
- **"Client ID not found"**: Verify environment variables are set
- **"Access denied"**: Ensure OAuth app is properly configured

Ready to close $499/month deals! 🎯
