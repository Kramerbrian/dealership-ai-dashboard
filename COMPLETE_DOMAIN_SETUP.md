# 🌐 Complete Domain Setup for DealershipAI

## All Three Subdomains Configuration

You now have **three subdomains** to configure for your DealershipAI project:

1. **main.dealershipai.com** - Main application/landing
2. **marketing.dealershipai.com** - Marketing site
3. **dash.dealershipai.com** - Dashboard (NEW!)

---

## 📋 DNS Configuration (Domain Registrar)

Go to your domain registrar where `dealershipai.com` is managed and add these **3 CNAME records**:

### Record 1: main.dealershipai.com
```
Type:  CNAME
Name:  main
Value: cname.vercel-dns.com
TTL:   300
```

### Record 2: marketing.dealershipai.com
```
Type:  CNAME
Name:  marketing
Value: cname.vercel-dns.com
TTL:   300
```

### Record 3: dash.dealershipai.com (NEW!)
```
Type:  CNAME
Name:  dash
Value: cname.vercel-dns.com
TTL:   300
```

**Note**: All three point to `cname.vercel-dns.com` (the standard Vercel CNAME)

---

## ⚙️ Vercel Dashboard Configuration

### Add All Three Domains in Vercel

Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains

Click "**Add Domain**" and add each one:

1. ✅ Add: `main.dealershipai.com`
2. ✅ Add: `marketing.dealershipai.com`
3. ✅ Add: `dash.dealershipai.com`

Vercel will automatically:
- Verify domain ownership
- Issue SSL certificates
- Route traffic to the correct pages

---

## 🗺️ Domain Routing Strategy

### How Each Domain Works:

| Domain | Purpose | Route | Content |
|--------|---------|-------|---------|
| **main.dealershipai.com** | Main application/landing | `/` | Landing page |
| **marketing.dealershipai.com** | Marketing website | `/` | Marketing content |
| **dash.dealershipai.com** | Dashboard application | `/dash` | DealershipAIDashboardLA |

### URL Examples:
- `https://main.dealershipai.com` → Landing page
- `https://marketing.dealershipai.com` → Marketing site
- `https://dash.dealershipai.com/dash` → Full dashboard
- `https://dash.dealershipai.com` → Can redirect to `/dash`

---

## 🔄 Optional: Root Domain Redirect

You can also configure the root domain to redirect:

### Record 4: dealershipai.com (Root Domain)
```
Type:  A
Name:  @ (or leave blank for root)
Value: 76.76.19.61
TTL:   300
```

Then in Vercel, add `dealershipai.com` and set it to redirect to your preferred subdomain.

---

## 🎯 Vercel Project Settings

### Current Deployment URLs:

**Vercel Production URL:**
- https://dealership-ai-dashboard-brian-kramers-projects.vercel.app

**Current Routes:**
- `/` - Landing/main page
- `/dash` - DealershipAI Dashboard (NEW!)
- `/marketing` - Marketing content (if exists)

### After Domain Setup, You'll Have:

**Three Custom Domains:**
1. `main.dealershipai.com` → Main site
2. `marketing.dealershipai.com` → Marketing site
3. `dash.dealershipai.com/dash` → Dashboard

---

## 📝 Step-by-Step Implementation

### Phase 1: DNS Configuration (5 minutes)

1. Log in to your domain registrar
2. Navigate to DNS settings for `dealershipai.com`
3. Add the 3 CNAME records (main, marketing, dash)
4. Save changes

### Phase 2: Vercel Configuration (5 minutes)

1. Open: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains
2. Click "Add Domain" for each:
   - `main.dealershipai.com`
   - `marketing.dealershipai.com`
   - `dash.dealershipai.com`
3. Vercel will verify and configure SSL

### Phase 3: Wait & Verify (5-60 minutes)

1. Wait for DNS propagation
2. Check status at: https://dnschecker.org
3. Test each domain:
   ```bash
   curl -I https://main.dealershipai.com
   curl -I https://marketing.dealershipai.com
   curl -I https://dash.dealershipai.com/dash
   ```

---

## 🧪 Testing All Three Domains

### Test Commands:

```bash
# Check DNS propagation for all three
dig main.dealershipai.com
dig marketing.dealershipai.com
dig dash.dealershipai.com

# Test HTTP responses
curl -I https://main.dealershipai.com
curl -I https://marketing.dealershipai.com
curl -I https://dash.dealershipai.com/dash

# Check SSL certificates
openssl s_client -connect main.dealershipai.com:443 -servername main.dealershipai.com < /dev/null
openssl s_client -connect marketing.dealershipai.com:443 -servername marketing.dealershipai.com < /dev/null
openssl s_client -connect dash.dealershipai.com:443 -servername dash.dealershipai.com < /dev/null
```

### Vercel Domain Status:

```bash
# List all domains
vercel domains ls

# Check specific domain status
vercel domains inspect main.dealershipai.com
vercel domains inspect marketing.dealershipai.com
vercel domains inspect dash.dealershipai.com
```

---

## 🎨 Content Routing Configuration

### Option 1: Use Vercel Rewrites (Current Setup)

In `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/main",
      "destination": "/landing"
    },
    {
      "source": "/dashboard",
      "destination": "/dash"
    }
  ]
}
```

### Option 2: Domain-Based Routing (Advanced)

You can configure different content per domain using headers in `next.config.js` or middleware.

---

## 🔒 Security Considerations

### SSL Certificates
- ✅ Vercel automatically provisions SSL certs
- ✅ Auto-renewal enabled
- ✅ HTTPS enforced by default

### Domain Protection
- Consider enabling Vercel's deployment protection
- Set up proper CORS policies
- Configure security headers in `vercel.json`

---

## 📊 Current Status Overview

| Domain | DNS Record | Vercel Config | Status |
|--------|-----------|---------------|--------|
| main.dealershipai.com | ⏳ Pending | ⏳ Pending | Not configured |
| marketing.dealershipai.com | ⏳ Pending | ⏳ Pending | Not configured |
| dash.dealershipai.com | ⏳ Pending | ⏳ Pending | Not configured |

### Deployment Status:
- ✅ Code deployed to Vercel
- ✅ Dashboard live at `/dash` route
- ✅ Production URL working
- ⏳ Custom domains pending configuration

---

## 🚀 Quick Setup Script

Want to automate the Vercel domain addition? Here's a script:

```bash
#!/bin/bash
# add-domains.sh

echo "Adding domains to Vercel project..."

# Add main domain
vercel domains add main.dealershipai.com --yes

# Add marketing domain
vercel domains add marketing.dealershipai.com --yes

# Add dashboard domain
vercel domains add dash.dealershipai.com --yes

echo "✅ All domains added! Now configure DNS records."
```

Run with:
```bash
chmod +x add-domains.sh
./add-domains.sh
```

---

## 📞 Support & Resources

### Domain Registrar Help
- **GoDaddy**: https://www.godaddy.com/help/add-a-cname-record-19236
- **Namecheap**: https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain
- **Cloudflare**: https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/

### Vercel Documentation
- **Custom Domains**: https://vercel.com/docs/concepts/projects/domains
- **DNS Configuration**: https://vercel.com/docs/concepts/projects/domains/dns
- **SSL Certificates**: https://vercel.com/docs/concepts/projects/domains/ssl

### Testing Tools
- **DNS Checker**: https://dnschecker.org
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **What's My DNS**: https://www.whatsmydns.net/

---

## ✅ Success Checklist

### DNS Configuration:
- [ ] Added CNAME for `main.dealershipai.com`
- [ ] Added CNAME for `marketing.dealershipai.com`
- [ ] Added CNAME for `dash.dealershipai.com`
- [ ] All records point to `cname.vercel-dns.com`
- [ ] TTL set to 300 or 3600

### Vercel Configuration:
- [ ] Opened Vercel domains settings
- [ ] Added `main.dealershipai.com` domain
- [ ] Added `marketing.dealershipai.com` domain
- [ ] Added `dash.dealershipai.com` domain
- [ ] Verified all domains in Vercel

### Verification:
- [ ] DNS propagation complete (checked with dnschecker.org)
- [ ] All three domains resolve correctly
- [ ] SSL certificates issued for all domains
- [ ] `main.dealershipai.com` loads correctly
- [ ] `marketing.dealershipai.com` loads correctly
- [ ] `dash.dealershipai.com/dash` loads dashboard
- [ ] HTTPS works for all domains
- [ ] No mixed content warnings

### Testing:
- [ ] Tested all domains in Chrome/Safari/Firefox
- [ ] Tested on mobile devices
- [ ] Verified responsive design works
- [ ] Checked browser console for errors
- [ ] Tested all dashboard features

---

## 🎯 Final Architecture

```
dealershipai.com
├── main.dealershipai.com
│   └── Landing/Main Application
│
├── marketing.dealershipai.com
│   └── Marketing Website
│
└── dash.dealershipai.com
    └── /dash → DealershipAI Dashboard
        ├── SEO Visibility Metrics
        ├── AEO Visibility Metrics
        ├── GEO Visibility Metrics
        ├── AI Opportunities Engine
        └── Interactive EEAT Modals
```

---

## 🎉 Next Steps

1. **Add DNS Records** (3 CNAME records in domain registrar)
2. **Add Domains in Vercel** (3 domains in Vercel dashboard)
3. **Wait for Propagation** (5-60 minutes)
4. **Test All Domains** (Use testing checklist above)
5. **Celebrate!** 🎊

---

**Created**: October 16, 2025
**Status**: Configuration Pending
**Domains**: 3 (main, marketing, dash)
**Next Action**: Add DNS records in domain registrar
