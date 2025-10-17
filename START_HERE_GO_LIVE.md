# 🚀 START HERE - Go Live in 5 Minutes

## Your Current Status

✅ **All Done:**
- Application built and tested
- Database configured (Supabase)
- Domains configured (dealershipai.com, dash.dealershipai.com)
- Vercel account connected
- Environment variables mostly set

⚠️ **Need to Complete:**
- Google OAuth credentials
- GitHub OAuth credentials
- Deploy to production

---

## 🎯 Quick Path to Production

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Google OAuth (2 min)                           │
│  https://console.cloud.google.com/                      │
│  → Create OAuth Client ID                               │
│  → Add redirect URI                                     │
│  → Copy credentials                                     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 2: GitHub OAuth (2 min)                           │
│  https://github.com/settings/developers                 │
│  → Create OAuth App                                     │
│  → Add callback URL                                     │
│  → Copy credentials                                     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Update Credentials (1 min)                     │
│  ./update-oauth-credentials.sh                          │
│  → Paste Google credentials                             │
│  → Paste GitHub credentials                             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Deploy (1 min)                                 │
│  ./deploy-to-production.sh                              │
│  → Auto-validates                                       │
│  → Uploads env vars                                     │
│  → Deploys to Vercel                                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  ✅ LIVE!                                               │
│  Test: https://dash.dealershipai.com                    │
└─────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Instructions

### STEP 1: Google OAuth Setup (2 minutes)

#### 1.1 Open Google Cloud Console
Click here: **https://console.cloud.google.com/**

#### 1.2 Navigate to Credentials
- Click on **"APIs & Services"** in the left sidebar
- Click **"Credentials"**

#### 1.3 Create OAuth Client
- Click **"+ CREATE CREDENTIALS"**
- Select **"OAuth client ID"**
- Choose **"Web application"**
- Name it: **"DealershipAI Dashboard"**

#### 1.4 Add Redirect URIs
Under **"Authorized redirect URIs"**, add:
```
https://dash.dealershipai.com/api/auth/callback/google
```

Optional (for local testing):
```
http://localhost:3000/api/auth/callback/google
```

#### 1.5 Save Credentials
Click **"CREATE"** and you'll see:
- **Client ID**: Starts with numbers, ends with `.apps.googleusercontent.com`
- **Client Secret**: Starts with `GOCSPX-`

**Keep this window open!** You'll need these in Step 3.

---

### STEP 2: GitHub OAuth Setup (2 minutes)

#### 2.1 Open GitHub Developer Settings
Click here: **https://github.com/settings/developers**

#### 2.2 Create New OAuth App
- Click **"New OAuth App"** (or "Register a new application")

#### 2.3 Fill in Application Details
```
Application name: DealershipAI Dashboard
Homepage URL: https://dealershipai.com
Application description: AI-powered dealership intelligence platform
Authorization callback URL: https://dash.dealershipai.com/api/auth/callback/github
```

#### 2.4 Register Application
Click **"Register application"**

#### 2.5 Generate Client Secret
- You'll see your **Client ID** (starts with `Iv1.` or `Ov1.`)
- Click **"Generate a new client secret"**
- **IMPORTANT**: Copy the secret immediately - it only shows once!

**Keep this window open!** You'll need these in Step 3.

---

### STEP 3: Update Credentials (1 minute)

#### 3.1 Run the Update Script
In your terminal, run:
```bash
./update-oauth-credentials.sh
```

#### 3.2 Enter Credentials When Prompted
The script will ask for:
1. **Google Client ID** → Paste from Step 1
2. **Google Client Secret** → Paste from Step 1
3. **GitHub Client ID** → Paste from Step 2
4. **GitHub Client Secret** → Paste from Step 2

Press Enter after each one.

#### 3.3 Confirm Success
You should see:
```
✅ Google OAuth credentials updated
✅ GitHub OAuth credentials updated
✅ OAuth credentials updated successfully!
```

---

### STEP 4: Deploy to Production (1 minute)

#### 4.1 Run the Deployment Script
```bash
./deploy-to-production.sh
```

#### 4.2 What Happens
The script will:
1. ✓ Validate all environment variables
2. ✓ Check OAuth credentials are set
3. ✓ Upload environment variables to Vercel
4. ✓ Deploy your application
5. ✓ Show you the live URL

#### 4.3 Expected Output
```
✅ Environment variables validated
✅ Google OAuth configured
✅ GitHub OAuth configured
✅ Environment variables added to Vercel
🚀 Deploying to production...
✅ Deployment successful!
```

---

## Verify Your Deployment

### Test These URLs:

#### 1. Landing Page
**URL**: https://dealershipai.com

**Should show:**
- Marketing landing page
- "Get Started" button
- Feature highlights
- Pricing information

#### 2. Sign In Page
**URL**: https://dash.dealershipai.com/auth/signin

**Should show:**
- "Sign in with Google" button
- "Sign in with GitHub" button
- DealershipAI branding

#### 3. Dashboard (After Login)
**URL**: https://dash.dealershipai.com

**Should show:**
- Dashboard with metrics
- AI Intelligence panels
- Navigation menu
- User profile

---

## Troubleshooting

### Issue: "Redirect URI mismatch"

**Problem**: OAuth provider doesn't recognize the callback URL

**Solution**:
1. Go back to your OAuth provider (Google or GitHub)
2. Make sure the callback URL is **exactly**:
   - Google: `https://dash.dealershipai.com/api/auth/callback/google`
   - GitHub: `https://dash.dealershipai.com/api/auth/callback/github`
3. No trailing slashes, must match exactly!

---

### Issue: "Invalid client"

**Problem**: Client ID or Secret is wrong

**Solution**:
1. Double-check you copied the entire Client ID and Secret
2. No extra spaces or line breaks
3. Run `./update-oauth-credentials.sh` again with correct values

---

### Issue: "Not logged in to Vercel"

**Problem**: Vercel CLI not authenticated

**Solution**:
```bash
vercel login
```
Follow the prompts, then retry deployment.

---

### Issue: Deployment Fails

**Problem**: Build or deployment error

**Solution**:
1. Check the error message in terminal
2. Verify all environment variables are set:
   ```bash
   grep -E "(GOOGLE|GITHUB)" .env.local
   ```
3. Make sure you don't have placeholder values (no "your-" text)
4. Retry deployment

---

## After Successful Deployment

### 🎉 You're Live!

Your application is now running at:
- **Marketing**: https://dealershipai.com
- **Dashboard**: https://dash.dealershipai.com
- **Main App**: https://main.dealershipai.com

### Next Steps:

1. **Test OAuth Login**
   - Visit https://dash.dealershipai.com/auth/signin
   - Try signing in with Google
   - Try signing in with GitHub

2. **Share with Prospects**
   - Send them to: https://dealershipai.com
   - Demo the platform live
   - Start closing deals at $499/month!

3. **Monitor Performance**
   ```bash
   vercel logs
   ```

4. **Make Updates**
   - Make changes locally
   - Test with `npm run dev`
   - Deploy with `vercel --prod`

---

## Quick Reference

### Important URLs

| Purpose | URL |
|---------|-----|
| Marketing Site | https://dealershipai.com |
| Dashboard | https://dash.dealershipai.com |
| Sign In | https://dash.dealershipai.com/auth/signin |
| Main App | https://main.dealershipai.com |

### OAuth Callback URLs

| Provider | Callback URL |
|----------|-------------|
| Google | https://dash.dealershipai.com/api/auth/callback/google |
| GitHub | https://dash.dealershipai.com/api/auth/callback/github |

### Quick Commands

```bash
# Update OAuth credentials
./update-oauth-credentials.sh

# Deploy to production
./deploy-to-production.sh

# Check deployment status
vercel ls

# View production logs
vercel logs

# Test locally first
npm run dev
```

---

## Need Help?

### Documentation
- [GO_LIVE_CHECKLIST.md](GO_LIVE_CHECKLIST.md) - Comprehensive checklist
- [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) - Detailed OAuth setup
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment documentation

### Quick Help
- **Vercel Support**: https://vercel.com/support
- **Google OAuth**: https://support.google.com/cloud/
- **GitHub OAuth**: https://docs.github.com/en/apps/oauth-apps

---

## Success Checklist

Before considering yourself "live", verify:

- [ ] Google OAuth login works in production
- [ ] GitHub OAuth login works in production
- [ ] Dashboard loads after authentication
- [ ] All metrics and data display correctly
- [ ] Mobile view works properly
- [ ] No console errors on sign-in
- [ ] Can navigate between pages
- [ ] User profile displays correctly

---

## Ready to Close Deals! 💰

Once all checkboxes are complete:
- Share the platform with prospects
- Start onboarding dealerships
- Close deals at **$499/month**
- Scale your business!

**Good luck! 🚀**
