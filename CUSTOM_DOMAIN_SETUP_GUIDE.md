# 🌐 CUSTOM DOMAIN SETUP GUIDE - dealershipai.com

## 🎉 DOMAIN PURCHASED!
**Domain**: dealershipai.com ✅

## 🔧 STEP 1: CONFIGURE DOMAIN IN VERCEL

### Option A: Transfer Domain to Current Project
Since the domain is already assigned to another project, you need to:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find the project** that has dealershipai.com assigned
3. **Remove the domain** from that project
4. **Add it to dealership-ai-dashboard** project

### Option B: Use Vercel CLI to Transfer
```bash
# List all projects to find where domain is assigned
vercel projects list

# Remove domain from other project (replace PROJECT_ID)
vercel domains remove dealershipai.com --project PROJECT_ID

# Add domain to current project
vercel domains add dealershipai.com
```

## 🔧 STEP 2: CONFIGURE DNS SETTINGS

### DNS Configuration Required:
**Add these DNS records to your domain registrar**:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Alternative DNS Configuration:
```
Type: A
Name: @
Value: 76.76.19.61

Type: A
Name: @
Value: 76.76.19.62

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 🔧 STEP 3: UPDATE OAUTH CONFIGURATION

### Google Cloud Console OAuth Settings:
**Go to**: https://console.cloud.google.com/apis/credentials?project=dealershipai-473217

### OAuth 2.0 Client ID:
```
Authorized redirect URIs:
https://dealershipai.com/api/auth/callback/google

Authorized JavaScript origins:
https://dealershipai.com
```

### OAuth Consent Screen:
```
App name: DealershipAI
User support email: kainomura@dealershipai.com
Developer contact information: kainomura@dealershipai.com
Privacy policy URL: https://dealershipai.com/privacy
Terms of service URL: https://dealershipai.com/terms
```

## 🔧 STEP 4: UPDATE VERCEL ENVIRONMENT VARIABLES

### Update NEXTAUTH_URL:
```bash
# Remove old NEXTAUTH_URL
vercel env rm NEXTAUTH_URL production

# Add new NEXTAUTH_URL
echo "https://dealershipai.com" | vercel env add NEXTAUTH_URL production
```

### Update Other Environment Variables:
```bash
# Update app URLs
echo "https://dealershipai.com" | vercel env add NEXT_PUBLIC_APP_URL production
echo "https://dealershipai.com" | vercel env add NEXT_PUBLIC_DASHBOARD_URL production
echo "https://dealershipai.com" | vercel env add NEXT_PUBLIC_MARKETING_URL production
```

## 🔧 STEP 5: DEPLOY WITH CUSTOM DOMAIN

### Deploy to Production:
```bash
vercel --prod
```

### Verify Domain:
```bash
# Test domain accessibility
curl -I https://dealershipai.com

# Test OAuth
curl -I https://dealershipai.com/api/auth/signin/google

# Test pages
curl -I https://dealershipai.com/privacy
curl -I https://dealershipai.com/terms
```

## 🧪 TESTING CHECKLIST

### ✅ Domain Setup:
- [ ] Domain added to Vercel project
- [ ] DNS records configured
- [ ] Domain resolves to Vercel
- [ ] SSL certificate active

### ✅ OAuth Configuration:
- [ ] Google Cloud Console updated
- [ ] Redirect URI: https://dealershipai.com/api/auth/callback/google
- [ ] JavaScript origin: https://dealershipai.com
- [ ] Privacy policy: https://dealershipai.com/privacy
- [ ] Terms of service: https://dealershipai.com/terms
- [ ] OAuth consent screen published

### ✅ Environment Variables:
- [ ] NEXTAUTH_URL: https://dealershipai.com
- [ ] NEXT_PUBLIC_APP_URL: https://dealershipai.com
- [ ] NEXT_PUBLIC_DASHBOARD_URL: https://dealershipai.com
- [ ] NEXT_PUBLIC_MARKETING_URL: https://dealershipai.com

### ✅ Testing:
- [ ] Domain loads: https://dealershipai.com
- [ ] OAuth redirects: https://dealershipai.com/api/auth/signin/google
- [ ] Privacy policy: https://dealershipai.com/privacy
- [ ] Terms of service: https://dealershipai.com/terms
- [ ] Sign-in page: https://dealershipai.com/auth/signin

## 🚨 TROUBLESHOOTING

### If Domain Not Working:
1. **Check DNS propagation**: https://dnschecker.org
2. **Verify DNS records** are correct
3. **Wait 24-48 hours** for full propagation
4. **Check Vercel domain settings**

### If OAuth Not Working:
1. **Verify Google Cloud Console** settings
2. **Check redirect URI** matches exactly
3. **Ensure OAuth consent screen** is published
4. **Wait 2-3 minutes** for changes to propagate

### If SSL Issues:
1. **Wait for SSL certificate** to be issued
2. **Check Vercel domain status**
3. **Verify DNS configuration**

## 🎯 SUCCESS CRITERIA

### ✅ Clean URLs Working:
- [ ] https://dealershipai.com loads
- [ ] No "brian-kramers-projects" in URLs
- [ ] Professional branding throughout
- [ ] SSL certificate active

### ✅ OAuth Working:
- [ ] Google OAuth redirects to Google
- [ ] Shows "DealershipAI" app name
- [ ] User can complete sign-in flow
- [ ] Redirects to dashboard after OAuth

---

**Priority**: HIGH - Professional branding and clean URLs
**ETA**: 30 minutes to complete setup
**Status**: Ready to execute
