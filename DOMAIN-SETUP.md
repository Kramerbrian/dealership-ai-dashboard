# DealershipAI Dashboard - Custom Domain Setup

## 🌐 **Domain Configuration Guide**

### **Primary Domain: `dash.dealershipai.com`**
- **Purpose**: Main dashboard access for clients
- **SSL**: Automatic HTTPS via Vercel
- **CDN**: Global edge network for fast loading

### **Secondary Domains:**
- **`app.dealershipai.com`** - Alternative dashboard access
- **`dashboard.dealershipai.com`** - Backup domain
- **`admin.dealershipai.com`** - Admin testing environment

## 🔧 **Vercel Domain Configuration**

### **Step 1: Add Domains in Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dealership-ai-dashboard` project
3. Go to Settings → Domains
4. Add the following domains:
   - `dash.dealershipai.com`
   - `app.dealershipai.com`
   - `dashboard.dealershipai.com`
   - `admin.dealershipai.com`

### **Step 2: DNS Configuration**
Configure these DNS records with your domain provider:

```
Type: CNAME
Name: dash
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: dashboard
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: admin
Value: cname.vercel-dns.com
TTL: 3600
```

### **Step 3: SSL Certificate**
- Vercel automatically provisions SSL certificates
- Wait 5-10 minutes for DNS propagation
- Test HTTPS access: `https://dash.dealershipai.com`

## 📋 **Domain Verification Checklist**

- [ ] DNS records configured
- [ ] Domains added to Vercel project
- [ ] SSL certificates provisioned
- [ ] HTTPS redirect working
- [ ] All subdomains accessible
- [ ] Performance testing completed

## 🔄 **Redirect Configuration**

Update `vercel.json` to handle domain redirects:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://dash.dealershipai.com/$1",
      "permanent": true,
      "has": [
        {
          "type": "host",
          "value": "dealership-ai-dashboard.vercel.app"
        }
      ]
    }
  ]
}
```

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **DNS Propagation**: Wait up to 24 hours for full propagation
2. **SSL Certificate**: May take 5-10 minutes to provision
3. **Caching**: Clear browser cache and DNS cache
4. **CORS Issues**: Update CSP headers for new domain

### **Testing Commands:**
```bash
# Test DNS resolution
nslookup dash.dealershipai.com

# Test HTTPS
curl -I https://dash.dealershipai.com

# Test redirect
curl -I https://dealership-ai-dashboard.vercel.app
```
