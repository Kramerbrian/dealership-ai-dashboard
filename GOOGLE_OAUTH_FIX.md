# 🔧 Google OAuth Redirect URI Fix

## 🚨 **Current Issue**
Error: `redirect_uri_mismatch` - Google OAuth doesn't recognize your production URL.

## ✅ **Quick Fix Steps**

### **Step 1: Update Google Cloud Console**

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Find your OAuth 2.0 Client ID**: `1039185326912-150t42hacgra02kljg4sj59gq8shb42b`
3. **Click "Edit"**
4. **Add these Authorized redirect URIs**:

```
https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app/api/auth/callback/google
https://dealershipai-dashboard-4obbenwbh-brian-kramers-projects.vercel.app/api/auth/callback/google
```

### **Step 2: Keep Existing URIs**
Make sure these are still there:
```
http://localhost:3000/api/auth/callback/google
```

### **Step 3: Save and Test**
1. **Click "Save"**
2. **Wait 5-10 minutes** for changes to propagate
3. **Test OAuth flow** again

## 🔄 **Alternative: Use Current Vercel URL**

If you want to use the current deployment URL as your main domain:

### **Update Environment Variables**
```bash
# Update NEXTAUTH_URL to current deployment
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production
# Enter: https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app
```

### **Update Google OAuth**
Add this redirect URI:
```
https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app/api/auth/callback/google
```

## 🎯 **Long-term Solution: Custom Domain**

### **Option 1: Use a New Subdomain**
```bash
# Try adding a new subdomain
vercel domains add app.dealershipai.com
# or
vercel domains add dashboard.dealershipai.com
```

### **Option 2: Use a Different Domain**
```bash
# Use a completely different domain
vercel domains add yournewdomain.com
```

## 🧪 **Test the Fix**

After updating Google OAuth:

1. **Go to**: https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app/auth/signin
2. **Click "Continue with Google"**
3. **Should redirect to Google OAuth** without the error

## 📋 **Current Production URLs**

- **Main App**: https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app
- **OAuth Callback**: https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app/api/auth/callback/google
- **Sign-in Page**: https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app/auth/signin

## ⚠️ **Important Notes**

1. **Changes take 5-10 minutes** to propagate
2. **Each Vercel deployment** gets a new URL
3. **Custom domain** is the best long-term solution
4. **Keep localhost URIs** for development

## 🚀 **After Fix**

Once OAuth is working:
1. **Test complete user flow**
2. **Set up custom domain**
3. **Update all redirect URIs**
4. **Start acquiring customers!**

---

**Need help?** The fix is simple - just add the production callback URL to your Google OAuth configuration!
