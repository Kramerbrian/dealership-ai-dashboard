# 🌐 **Manual Domain Setup Required**

## ⚠️ **Issue Identified**
The Vercel project has a path configuration issue pointing to `~/dealership-ai-dashboard/apps/web` which doesn't exist.

## 🔧 **Manual Setup Required**

### **1. Fix Vercel Project Settings**
Go to: [https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings](https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings)

**Update Root Directory:**
- Change from: `apps/web`
- Change to: `.` (root directory)

### **2. Add Domains in Vercel Dashboard**
Go to: [https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains](https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains)

**Add These Domains:**
- `marketing.dealershipai.com`
- `dash.dealershipai.com`
- `main.dealershipai.com`

### **3. Update Environment Variables**
In Vercel Dashboard → Environment Variables:

```bash
NEXT_PUBLIC_APP_URL=https://marketing.dealershipai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dash.dealershipai.com
NEXT_PUBLIC_MAIN_URL=https://main.dealershipai.com
NEXTAUTH_URL=https://marketing.dealershipai.com
```

### **4. Configure DNS Records**
For each domain, add:

**A Record:**
- Name: `@`
- Value: `76.76.19.61`

**CNAME Record:**
- Name: `www`
- Value: `cname.vercel-dns.com`

### **5. Update Supabase Settings**
In your Supabase project:

**Site URL:**
```
https://marketing.dealershipai.com
```

**Redirect URLs:**
```
https://marketing.dealershipai.com/auth/callback
https://dash.dealershipai.com/auth/callback
https://main.dealershipai.com/auth/callback
```

### **6. Update Google OAuth**
In Google Cloud Console:

**Authorized Redirect URIs:**
```
https://marketing.dealershipai.com/api/auth/callback/google
https://dash.dealershipai.com/api/auth/callback/google
https://main.dealershipai.com/api/auth/callback/google
```

## 🚀 **After Manual Setup**

Once you've completed the manual configuration:

1. **Test Domains:**
   ```bash
   curl -I https://marketing.dealershipai.com
   curl -I https://dash.dealershipai.com
   curl -I https://main.dealershipai.com
   ```

2. **Test APIs:**
   ```bash
   curl https://marketing.dealershipai.com/api/ai/recommendations
   curl https://dash.dealershipai.com/api/competitors/intelligence
   ```

3. **Verify Authentication:**
   - Test login flows on each domain
   - Verify redirects work correctly
   - Check session persistence

## ✅ **Expected Results**

After configuration:
- All domains will point to the same repository
- Each domain will serve different content (marketing, dashboard, main)
- All APIs will be accessible across domains
- Authentication will work seamlessly
- Competitive advantage features will be live

## 🎯 **Current Status**

**APIs:** ✅ All activated and working locally
**Repository:** ✅ Connected to Vercel project
**Configuration:** ⚠️ Needs manual domain setup
**Deployment:** ⚠️ Blocked by path configuration

**Next Step:** Complete manual domain configuration in Vercel dashboard
