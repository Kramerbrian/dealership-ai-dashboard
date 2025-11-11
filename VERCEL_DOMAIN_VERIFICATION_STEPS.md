# 🔧 Vercel Domain Verification - Step by Step

**Domain:** `dealershipai.com`  
**Issue:** Domain is linked to another Vercel account  
**Solution:** Add TXT record to verify ownership

---

## 📋 Step-by-Step Instructions

### Step 1: Get Verification Code from Vercel

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Select your project:**
   - Project: `dealership-ai-dashboard`
   - Team: `brian-kramer-dealershipai`

3. **Navigate to Domains:**
   - Click: **Settings** → **Domains**
   - Or go directly: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

4. **Add Domain:**
   - Click: **"Add Domain"** button
   - Enter: `dealershipai.com`
   - Click: **"Add"**

5. **Vercel will show verification instructions:**
   - It will display a **TXT record name** (usually `_vercel`)
   - It will display a **TXT record value** (unique verification code)
   - **Copy both values** - you'll need them in Step 2

---

### Step 2: Add TXT Record to DNS

**Go to your domain registrar** (where you manage `dealershipai.com` DNS):

**Common registrars:**
- GoDaddy
- Namecheap
- Cloudflare
- Google Domains
- Squarespace

**Add this DNS record:**

```
Type: TXT
Name: _vercel
Value: [Paste the verification code from Vercel]
TTL: 3600 (or Auto)
```

**Important Notes:**
- Some registrars require the full subdomain: `_vercel.dealershipai.com`
- The value should be exactly as shown in Vercel (no extra spaces)
- Save the record

---

### Step 3: Wait for DNS Propagation

- **Typical time:** 5-30 minutes
- **Maximum:** 48 hours
- **Check status:** Use the verification script

**Verify DNS record is live:**
```bash
# Run the verification script
./scripts/verify-domain-ownership.sh

# Or check manually
dig TXT _vercel.dealershipai.com
```

---

### Step 4: Complete Verification in Vercel

1. **Go back to Vercel Dashboard**
2. **Navigate to:** Settings → Domains
3. **Find:** `dealershipai.com` in the list
4. **Click:** **"Verify"** button (or refresh the page)
5. **Vercel will automatically detect** the TXT record
6. **Domain will be verified** ✅

---

## 🔍 Verify TXT Record

**Run the verification script:**
```bash
./scripts/verify-domain-ownership.sh
```

**Or check manually:**
```bash
# Check if TXT record exists
dig TXT _vercel.dealershipai.com

# Should show the verification code
```

**Online DNS checker:**
- https://dnschecker.org/#TXT/_vercel.dealershipai.com

---

## ✅ After Verification

Once verified, you can:

1. **Add domain to project** (if not already added):
   ```bash
   npx vercel domains add dealershipai.com
   ```

2. **Add subdomains:**
   ```bash
   npx vercel domains add dash.dealershipai.com
   ```

3. **Deploy to production:**
   ```bash
   npx vercel --prod
   ```

---

## 🚨 Troubleshooting

### Issue: TXT Record Not Found
**Solutions:**
- Wait longer (DNS can take up to 48 hours)
- Double-check the record name and value
- Some registrars need full subdomain format
- Try removing and re-adding the record

### Issue: Domain Still Shows "Linked to Another Account"
**Solutions:**
- Remove domain from the other Vercel account first
- Contact Vercel support: https://vercel.com/support
- They can transfer domain ownership

### Issue: Verification Code Expired
**Solutions:**
- Remove the old TXT record
- Request a new verification code from Vercel
- Add the new TXT record

---

## 📝 Quick Reference

**Vercel Dashboard:**
- https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

**Verification Script:**
```bash
./scripts/verify-domain-ownership.sh
```

**Check DNS:**
```bash
dig TXT _vercel.dealershipai.com
```

---

**Follow these steps to verify domain ownership, then you can add it to your project!** 🚀

