# 🚀 Production Domain Setup - Quick Start

**Domain:** dealershipai.com  
**Project:** dealership-ai-dashboard  
**Status:** Ready to configure

---

## ⚡ **Quick Steps (5 minutes)**

### **Step 1: Add Domain in Vercel Dashboard**

1. **Open Vercel Dashboard:**
   ```
   https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
   ```

2. **Click "Add Domain"**

3. **Enter:** `dealershipai.com`

4. **Click "Add"**

5. **Vercel will show you DNS records to add** (copy these!)

---

### **Step 2: Add DNS Records at Your Registrar**

**You'll need to add these records** (Vercel will provide exact values):

#### **For Root Domain:**
```
Type: A
Name: @ (or leave blank)
Value: [IP address from Vercel]
TTL: 300
```

#### **For WWW Subdomain (optional):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

#### **For Verification:**
```
Type: TXT
Name: @ (or leave blank)
Value: vercel-verification=xxxxx
TTL: 300
```

**Where to add:**
- Log in to your domain registrar (GoDaddy, Namecheap, etc.)
- Find "DNS Management" or "DNS Settings"
- Add the records Vercel provided
- Save changes

---

### **Step 3: Wait & Verify**

1. **Wait 15-30 minutes** for DNS propagation

2. **Check status in Vercel:**
   - Go back to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
   - Status should change to "Valid Configuration"

3. **Test the domain:**
   ```bash
   curl -I https://dealershipai.com
   # Should return HTTP 200
   ```

4. **SSL Certificate:**
   - Automatically provisioned by Vercel
   - Usually ready in 5-10 minutes after DNS propagates

---

## ✅ **What Happens Next**

- ✅ DNS propagates (15-30 minutes)
- ✅ Vercel verifies domain ownership
- ✅ SSL certificate is issued automatically
- ✅ Your site goes live at `https://dealershipai.com`

---

## 🎯 **After Domain is Live**

### **Test Everything:**
```bash
# Landing page
curl -I https://dealershipai.com

# Health endpoint
curl https://dealershipai.com/api/health

# Should work perfectly!
```

### **Clerk Authentication:**
- Production keys will work on `dealershipai.com`
- No more domain restriction errors!

---

## 🚨 **If You Get "Not Authorized" Error**

This means the domain might be:
1. **Already on another Vercel project** - Check other projects
2. **Needs verification** - Use Vercel dashboard (not CLI)
3. **Owned by different account** - Verify domain ownership

**Solution:** Use the Vercel dashboard - it handles verification automatically.

---

## 📝 **Need Help?**

**Common Questions:**

**Q: What if I don't know my registrar?**
- Check your email for domain purchase confirmation
- Or use: https://whois.net to find registrar

**Q: How long does it take?**
- DNS: 15-30 minutes (can take up to 24 hours)
- SSL: 5-10 minutes after DNS propagates

**Q: Will it break anything?**
- No! Your current Vercel URL will still work
- The domain just points to the same deployment

---

## 🎉 **Ready to Start?**

1. **Go to:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. **Click "Add Domain"**
3. **Enter:** `dealershipai.com`
4. **Follow the DNS instructions**

That's it! 🚀

