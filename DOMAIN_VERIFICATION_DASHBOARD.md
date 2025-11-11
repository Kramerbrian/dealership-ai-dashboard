# ✅ Domain Verification - Vercel Dashboard

**Dashboard URL:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

---

## 📋 Domain Verification Steps

### Step 1: Access Vercel Dashboard

1. **Go to:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. **Log in** if prompted
3. **You'll see** the domains management page

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

**Go to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)

**Add this DNS record:**
```
Type: TXT
Name: _vercel
Value: [paste verification code from Vercel]
TTL: 3600
```

**Important:**
- Some registrars require: `_vercel.dealershipai.com` (full subdomain)
- Value should match exactly (no extra spaces)

### Step 5: Wait for Propagation

- **Typical:** 5-30 minutes
- **Maximum:** 48 hours

**Check if TXT record is live:**
```bash
./scripts/verify-domain-ownership.sh
```

Or manually:
```bash
dig TXT _vercel.dealershipai.com
```

### Step 6: Complete Verification

1. **Go back to:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. **Find:** `dealershipai.com` in the list
3. **Click:** "Verify" button (or refresh the page)
4. **Vercel will automatically detect** the TXT record
5. **Domain will be verified** ✅

---

## ✅ After Verification

Once verified, you can:

1. **Add subdomains:**
   - `dash.dealershipai.com`
   - `www.dealershipai.com`

2. **Assign to project:**
   - Domain will automatically be available for the project

3. **Deploy:**
   ```bash
   npx vercel --prod
   ```

---

## 🔍 Verification Tools

**Check DNS record:**
```bash
./scripts/verify-domain-ownership.sh
```

**Check domain status:**
```bash
npx vercel domains ls
npx vercel domains inspect dealershipai.com
```

---

## 📝 Quick Reference

**Dashboard URL:**
- https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

**TXT Record:**
- Name: `_vercel`
- Value: (from Vercel dashboard)

**Verification Script:**
```bash
./scripts/verify-domain-ownership.sh
```

---

**Follow these steps in the Vercel Dashboard to verify domain ownership!** 🚀

