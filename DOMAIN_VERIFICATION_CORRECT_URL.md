# ✅ Domain Verification - Correct Dashboard URL

**Correct URL:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

---

## 📋 Domain Verification Steps

### Step 1: Access Vercel Dashboard

**Go to:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

**Note:** This is the correct URL (not `brian-kramer-dealershipai`)

### Step 2: Add Domain

1. **Click:** "Add Domain" button
2. **Enter:** `dealershipai.com`
3. **Click:** "Add"

### Step 3: Get Verification Code

**Vercel will display:**
- **TXT Record Name:** `_vercel`
- **TXT Record Value:** (unique verification code)
- **Copy the value**

### Step 4: Add TXT Record to DNS

**Go to your domain registrar** and add:

```
Type: TXT
Name: _vercel
Value: [paste verification code from Vercel]
TTL: 3600
```

### Step 5: Wait for Propagation

- **Typical:** 5-30 minutes
- **Maximum:** 48 hours

**Check if TXT record is live:**
```bash
./scripts/verify-domain-ownership.sh
```

### Step 6: Complete Verification

1. **Go back to:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. **Find:** `dealershipai.com` in the list
3. **Click:** "Verify" button (or refresh the page)
4. **Vercel will automatically detect** the TXT record
5. **Domain will be verified** ✅

---

## ✅ After Verification

Once verified, add subdomains:

```bash
# Add subdomain
npx vercel domains add dash.dealershipai.com dealership-ai-dashboard
```

---

## 📝 Quick Reference

**Dashboard URL:**
- ✅ **Correct:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
- ❌ **Wrong:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

**Verification Script:**
```bash
./scripts/verify-domain-ownership.sh
```

---

**Use the correct dashboard URL to verify domain ownership!** 🚀

