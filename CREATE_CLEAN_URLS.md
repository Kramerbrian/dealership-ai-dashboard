# 🎯 CREATE CLEAN URLs - Remove "brian-kramers-projects"

## 🔍 CURRENT SITUATION:
- **Vercel Account**: brian-kramers-projects (this is your Vercel team name)
- **Current URLs**: All contain "brian-kramers-projects"
- **Need**: Clean URLs without personal references

## 🚀 SOLUTION OPTIONS:

### Option 1: Custom Domain (Recommended)
**Set up**: dealershipai.com pointing to Vercel deployment

### Option 2: Vercel Subdomain
**Use**: dealershipai.vercel.app (if available)

### Option 3: New Vercel Account
**Create**: New Vercel account with business name

## 📋 OPTION 1: CUSTOM DOMAIN SETUP

### Step 1: Configure Custom Domain in Vercel
```bash
# Add custom domain to Vercel project
vercel domains add dealershipai.com
```

### Step 2: Update DNS Settings
**Point DNS to Vercel**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

### Step 3: Update OAuth Settings
**New URLs for Google Cloud Console**:
```
Authorized redirect URIs:
https://dealershipai.com/api/auth/callback/google

Authorized JavaScript origins:
https://dealershipai.com

Privacy policy URL: https://dealershipai.com/privacy
Terms of service URL: https://dealershipai.com/terms
```

## 📋 OPTION 2: VERCEL SUBDOMAIN

### Step 1: Check Available Subdomains
```bash
# Check if dealershipai.vercel.app is available
curl -I https://dealershipai.vercel.app
```

### Step 2: Configure Subdomain
```bash
# Set up subdomain in Vercel
vercel domains add dealershipai.vercel.app
```

### Step 3: Update OAuth Settings
**New URLs for Google Cloud Console**:
```
Authorized redirect URIs:
https://dealershipai.vercel.app/api/auth/callback/google

Authorized JavaScript origins:
https://dealershipai.vercel.app

Privacy policy URL: https://dealershipai.vercel.app/privacy
Terms of service URL: https://dealershipai.vercel.app/terms
```

## 📋 OPTION 3: NEW VERCEL ACCOUNT

### Step 1: Create New Vercel Account
1. **Go to**: https://vercel.com/signup
2. **Use business email**: kainomura@dealershipai.com
3. **Create account**: DealershipAI

### Step 2: Transfer Project
```bash
# Link to new account
vercel --scope dealershipai
```

### Step 3: Deploy to New Account
```bash
# Deploy with new scope
vercel --prod --scope dealershipai
```

## 🎯 RECOMMENDED APPROACH: CUSTOM DOMAIN

### Why Custom Domain is Best:
- ✅ Professional appearance
- ✅ No personal references
- ✅ Better branding
- ✅ SEO benefits
- ✅ Easy to remember

### Implementation Steps:
1. **Purchase domain**: dealershipai.com (if not owned)
2. **Configure in Vercel**: Add custom domain
3. **Update DNS**: Point to Vercel
4. **Update OAuth**: Use new clean URLs
5. **Test**: Verify everything works

## 🧪 TESTING NEW URLs

### After Setting Up Clean URLs:
```bash
# Test new deployment
curl -I https://dealershipai.com

# Test OAuth
curl -I https://dealershipai.com/api/auth/signin/google

# Test pages
curl -I https://dealershipai.com/privacy
curl -I https://dealershipai.com/terms
```

## 📊 CURRENT DEPLOYMENT STATUS:

### Latest Deployment:
**URL**: https://dealership-ai-dashboard-foiwkel6w-brian-kramers-projects.vercel.app

### OAuth URLs to Update:
```
Authorized redirect URIs:
https://dealership-ai-dashboard-foiwkel6w-brian-kramers-projects.vercel.app/api/auth/callback/google

Authorized JavaScript origins:
https://dealership-ai-dashboard-foiwkel6w-brian-kramers-projects.vercel.app

Privacy policy URL: https://dealership-ai-dashboard-foiwkel6w-brian-kramers-projects.vercel.app/privacy
Terms of service URL: https://dealership-ai-dashboard-foiwkel6w-brian-kramers-projects.vercel.app/terms
```

## 🚨 IMMEDIATE ACTION:

### Quick Fix (Use Current Deployment):
1. **Update Google Cloud Console** with latest deployment URL
2. **Test OAuth flow**
3. **Plan custom domain setup** for long-term solution

### Long-term Solution:
1. **Set up custom domain**: dealershipai.com
2. **Configure DNS** to point to Vercel
3. **Update all OAuth settings** to use custom domain
4. **Deploy and test** with clean URLs

---

**Priority**: HIGH - Professional branding
**ETA**: 30 minutes for custom domain setup
**Status**: Ready to implement
