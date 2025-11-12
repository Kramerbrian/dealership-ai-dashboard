# 🌐 Production Domain Setup - dealershipai.com

**Date:** 2025-11-10  
**Project:** dealership-ai-dashboard  
**Target Domain:** dealershipai.com

---

## 🎯 **Quick Setup Guide**

### **Option 1: Via Vercel Dashboard (Recommended)**

1. **Go to Domain Settings:**
   ```
   https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
   ```

2. **Add Domain:**
   - Click "Add Domain"
   - Enter: `dealershipai.com`
   - Click "Add"

3. **Vercel will show DNS records to add:**
   - Copy the DNS records provided
   - You'll need to add these at your domain registrar

### **Option 2: Via CLI**

```bash
# Add domain to project
npx vercel domains add dealershipai.com

# Or specify project
npx vercel domains add dealershipai.com --scope brian-kramer-dealershipai
```

---

## 📋 **DNS Configuration**

After adding the domain in Vercel, you'll get DNS records like:

### **For Apex Domain (dealershipai.com):**

**Option A: A Record (Recommended)**
```
Type: A
Name: @ (or dealershipai.com)
Value: 76.76.21.21 (Vercel will provide the exact IP)
TTL: 300
```

**Option B: CNAME Record**
```
Type: CNAME
Name: @ (or dealershipai.com)
Value: cname.vercel-dns.com
TTL: 300
```

### **For WWW Subdomain (www.dealershipai.com):**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

### **TXT Record (for verification):**
```
Type: TXT
Name: @
Value: vercel-verification=xxxxx (Vercel will provide)
TTL: 300
```

---

## 🔧 **Where to Add DNS Records**

1. **Log in to your domain registrar** (where you bought dealershipai.com)
   - Common registrars: GoDaddy, Namecheap, Google Domains, Cloudflare

2. **Find DNS Management:**
   - Usually under "DNS Settings" or "Domain Management"

3. **Add the records** provided by Vercel

4. **Save changes**

---

## ⏱️ **Timeline**

- **DNS Propagation:** 5 minutes to 24 hours (usually 15-30 minutes)
- **SSL Certificate:** Automatic, ready in 5-10 minutes after DNS propagates
- **Verification:** Vercel will verify automatically

---

## ✅ **Verification Steps**

### **1. Check DNS Propagation:**
```bash
# Check if DNS is pointing to Vercel
dig dealershipai.com
nslookup dealershipai.com

# Should show Vercel IP addresses
```

### **2. Check Domain Status in Vercel:**
- Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
- Status should show "Valid Configuration" when ready

### **3. Test the Domain:**
```bash
# Test HTTP
curl -I http://dealershipai.com

# Test HTTPS (after SSL is ready)
curl -I https://dealershipai.com

# Should return HTTP 200
```

### **4. Test in Browser:**
- Visit: https://dealershipai.com
- Should load your landing page
- Check SSL certificate (lock icon in browser)

---

## 🔐 **SSL Certificate**

Vercel automatically provisions SSL certificates:
- ✅ Free SSL via Let's Encrypt
- ✅ Auto-renewal
- ✅ Usually ready in 5-10 minutes after DNS propagates
- ✅ No action needed from you

---

## 🎯 **After Domain is Live**

### **1. Update Clerk Configuration (If needed):**
```bash
# Clerk production keys should work on dealershipai.com
# Verify redirect URLs in Clerk dashboard:
# https://dashboard.clerk.com
```

### **2. Update Environment Variables (If needed):**
```bash
# Check if any domain-specific vars need updating
npx vercel env ls | grep -i domain
```

### **3. Test Everything:**
- [ ] Landing page loads
- [ ] Health endpoint works: `https://dealershipai.com/api/health`
- [ ] Sign-in works (Clerk should work now!)
- [ ] All features functional

---

## 🚨 **Troubleshooting**

### **Domain Not Resolving?**
- Wait up to 24 hours for DNS propagation
- Check DNS records are correct
- Verify at your registrar

### **SSL Certificate Not Ready?**
- Wait 10-15 minutes after DNS propagates
- Check Vercel dashboard for certificate status
- Verify DNS records are correct

### **Clerk Still Not Working?**
- Production keys should work on `dealershipai.com`
- Verify Clerk domain configuration
- Check redirect URLs in Clerk dashboard

---

## 📝 **Current Status**

**Vercel Project:** `dealership-ai-dashboard`  
**Current Deployment:** `https://dealership-ai-dashboard-qlxfb45mb-brian-kramer-dealershipai.vercel.app`  
**Target Domain:** `dealershipai.com`  
**Status:** Ready to configure

---

## 🚀 **Next Steps**

1. **Add domain to Vercel** (via dashboard or CLI)
2. **Add DNS records** at your registrar
3. **Wait for propagation** (15-30 minutes)
4. **Verify everything works**

**Need help?** Let me know:
- What registrar are you using?
- Do you have access to DNS settings?
- Any issues you're encountering?

