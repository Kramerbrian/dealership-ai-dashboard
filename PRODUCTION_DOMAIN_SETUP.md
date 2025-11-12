# 🌐 Production Domain Setup Guide

**Date:** 2025-11-10  
**Goal:** Deploy to `dealershipai.com`

---

## 📋 **Step-by-Step Process**

### **Step 1: Add Domain to Vercel** (5 min)

1. **Via Vercel Dashboard:**
   - Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
   - Click "Add Domain"
   - Enter: `dealershipai.com`
   - Click "Add"

2. **Via CLI:**
   ```bash
   npx vercel domains add dealershipai.com
   ```

### **Step 2: Get DNS Configuration** (2 min)

Vercel will provide DNS records to add:
- **A Record** or **CNAME Record**
- **TXT Record** (for verification)

**Example DNS Records:**
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
TXT     @       vercel-verification=xxxxx
```

### **Step 3: Update DNS at Your Domain Registrar** (10 min)

1. **Log in to your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Navigate to DNS Management**
3. **Add the DNS records** provided by Vercel:
   - Add A record for root domain (`@` or `dealershipai.com`)
   - Add CNAME for www subdomain (if needed)
   - Add TXT record for verification

4. **Save changes**

### **Step 4: Wait for DNS Propagation** (5-30 min)

DNS changes can take 5 minutes to 48 hours, but usually:
- **Vercel verification:** 5-15 minutes
- **Full propagation:** 1-24 hours

**Check propagation:**
```bash
# Check DNS records
dig dealershipai.com
nslookup dealershipai.com

# Check if pointing to Vercel
curl -I https://dealershipai.com
```

### **Step 5: Verify SSL Certificate** (Automatic)

Vercel automatically provisions SSL certificates via Let's Encrypt:
- ✅ Automatic HTTPS
- ✅ Certificate renewal
- ✅ Usually ready in 5-10 minutes after DNS propagates

**Check SSL:**
```bash
curl -I https://dealershipai.com
# Should show HTTPS working
```

### **Step 6: Update Environment Variables** (If needed)

If you have domain-specific env vars:
```bash
# Update Clerk redirect URLs (if needed)
npx vercel env ls | grep CLERK

# Update any domain-specific configs
```

### **Step 7: Test Production Domain** (5 min)

```bash
# Test landing page
curl -I https://dealershipai.com

# Test health endpoint
curl https://dealershipai.com/api/health

# Test in browser
# Visit: https://dealershipai.com
```

---

## 🔍 **Verification Checklist**

- [ ] Domain added to Vercel
- [ ] DNS records updated at registrar
- [ ] DNS propagation complete
- [ ] SSL certificate active
- [ ] Landing page loads
- [ ] Health endpoint works
- [ ] Clerk authentication works (production keys will work now!)

---

## 🛠️ **Troubleshooting**

### **DNS Not Propagating?**
- Wait up to 24 hours
- Check DNS records are correct
- Clear DNS cache: `sudo dscacheutil -flushcache` (Mac)

### **SSL Certificate Issues?**
- Wait 10-15 minutes after DNS propagates
- Check Vercel dashboard for certificate status
- Verify DNS records are correct

### **Clerk Not Working?**
- Production keys should work on `dealershipai.com`
- Verify Clerk domain configuration
- Check redirect URLs in Clerk dashboard

---

## 📝 **Current Status**

**Vercel Project:** `dealership-ai-dashboard`  
**Current URL:** `https://dealership-ai-dashboard-qlxfb45mb-brian-kramer-dealershipai.vercel.app`  
**Target Domain:** `dealershipai.com`

---

## 🚀 **Ready to Start?**

Let me know:
1. **Do you have access to your domain registrar?**
2. **What registrar are you using?** (GoDaddy, Namecheap, etc.)
3. **Do you want me to help add the domain to Vercel first?**

I can guide you through each step!

