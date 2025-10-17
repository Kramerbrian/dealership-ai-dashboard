# 🌐 **DealershipAI Domain Configuration Guide**

## 🎯 **Target Domains**

Based on your Vercel project at [https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains](https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains), here's how to configure all domains and services:

---

## 🔧 **1. Vercel Domain Configuration**

### **Go to Domain Settings:**
Visit: [https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains](https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains)

### **Add These Domains:**
- `marketing.dealershipai.com` (Landing Page)
- `dash.dealershipai.com` (Dashboard)
- `main.dealershipai.com` (Main Page)

### **Domain Configuration:**
1. Click "Add Domain"
2. Enter each domain name
3. Vercel will provide DNS records to configure
4. Follow the DNS setup instructions

---

## 🌍 **2. DNS Configuration**

### **For Each Domain, Add These Records:**

#### **A Record:**
- **Name:** `@` (root domain)
- **Value:** `76.76.19.61`
- **TTL:** 300

#### **CNAME Record:**
- **Name:** `www`
- **Value:** `cname.vercel-dns.com`
- **TTL:** 300

### **DNS Propagation:**
- Changes take 5-60 minutes to propagate
- Use `nslookup` or `dig` to verify DNS changes

---

## 🔐 **3. Supabase Configuration**

### **Update Project Settings:**
1. Go to your Supabase project dashboard
2. Navigate to Authentication → URL Configuration
3. Update the following:

#### **Site URL:**
```
https://marketing.dealershipai.com
```

#### **Redirect URLs:**
```
https://marketing.dealershipai.com/auth/callback
https://dash.dealershipai.com/auth/callback
https://main.dealershipai.com/auth/callback
https://marketing.dealershipai.com/api/auth/callback/google
https://dash.dealershipai.com/api/auth/callback/google
https://main.dealershipai.com/api/auth/callback/google
```

#### **Additional Redirect URLs:**
```
https://marketing.dealershipai.com/dashboard
https://dash.dealershipai.com/dashboard
https://main.dealershipai.com/dashboard
```

---

## 🔑 **4. Environment Variables**

### **Update .env.local:**
```bash
# App URLs
NEXT_PUBLIC_APP_URL=https://marketing.dealershipai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dash.dealershipai.com
NEXT_PUBLIC_MAIN_URL=https://main.dealershipai.com
NEXTAUTH_URL=https://marketing.dealershipai.com

# Ory Configuration
ORY_SDK_URL=https://optimistic-haslett-3r8udelhc2.projects.oryapis.com
NEXT_PUBLIC_ORY_SDK_URL=https://optimistic-haslett-3r8udelhc2.projects.oryapis.com

# Google OAuth (Update redirect URIs)
GOOGLE_CLIENT_ID=1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### **Update Vercel Environment Variables:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add/Update these variables:
   - `NEXT_PUBLIC_APP_URL` = `https://marketing.dealershipai.com`
   - `NEXT_PUBLIC_DASHBOARD_URL` = `https://dash.dealershipai.com`
   - `NEXT_PUBLIC_MAIN_URL` = `https://main.dealershipai.com`
   - `NEXTAUTH_URL` = `https://marketing.dealershipai.com`

---

## 🔗 **5. GitHub Repository Configuration**

### **Repository Settings:**
- **Repository:** `brian-kramers-projects/dealership-ai-dashboard`
- **Auto-deploy:** Enabled
- **Branch:** `main`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### **Webhook Configuration:**
1. Go to GitHub Repository → Settings → Webhooks
2. Add webhook URL: `https://api.vercel.com/v1/integrations/deploy/your-webhook-url`
3. Events: Push, Pull Request

---

## 🚀 **6. Deployment Configuration**

### **vercel.json Updates:**
```json
{
  "rewrites": [
    {
      "source": "/",
      "destination": "/marketing"
    },
    {
      "source": "/main",
      "destination": "/main"
    },
    {
      "source": "/dashboard",
      "destination": "/intelligence"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://marketing.dealershipai.com",
    "NEXT_PUBLIC_DASHBOARD_URL": "https://dash.dealershipai.com",
    "NEXT_PUBLIC_MAIN_URL": "https://main.dealershipai.com",
    "NEXTAUTH_URL": "https://marketing.dealershipai.com"
  }
}
```

---

## 🧪 **7. Testing Configuration**

### **Test Each Domain:**
```bash
# Test marketing domain
curl -I https://marketing.dealershipai.com

# Test dashboard domain
curl -I https://dash.dealershipai.com

# Test main domain
curl -I https://main.dealershipai.com
```

### **Test API Endpoints:**
```bash
# Test competitive advantage APIs
curl https://marketing.dealershipai.com/api/ai/recommendations
curl https://dash.dealershipai.com/api/competitors/intelligence
curl https://main.dealershipai.com/api/alerts/prioritization
```

---

## 📊 **8. Monitoring & Analytics**

### **Google Analytics:**
- Update GA4 property with new domains
- Configure cross-domain tracking
- Set up conversion goals

### **Vercel Analytics:**
- Enable Vercel Analytics in project settings
- Monitor performance across all domains
- Set up alerts for downtime

---

## 🔒 **9. Security Configuration**

### **SSL Certificates:**
- Vercel automatically provides SSL certificates
- Ensure all domains have valid certificates
- Monitor certificate expiration

### **CORS Configuration:**
- Update CORS settings for all domains
- Configure allowed origins
- Test cross-domain requests

---

## ✅ **10. Verification Checklist**

- [ ] All domains added to Vercel project
- [ ] DNS records configured correctly
- [ ] Supabase redirect URLs updated
- [ ] Environment variables configured
- [ ] GitHub webhooks working
- [ ] SSL certificates active
- [ ] All APIs responding correctly
- [ ] Authentication working across domains
- [ ] Analytics tracking configured
- [ ] Performance monitoring active

---

## 🚀 **Ready to Deploy!**

Once all configurations are complete:

1. **Deploy to Production:**
   ```bash
   vercel --prod --yes
   ```

2. **Verify All Domains:**
   - Check each domain loads correctly
   - Test all API endpoints
   - Verify authentication flows

3. **Monitor Performance:**
   - Check Vercel Analytics
   - Monitor error rates
   - Track user engagement

**All domains and services will be connected to your single repository!** 🎯💰
