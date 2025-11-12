# 🔧 Vercel CLI Domain Verification Fix

**Domain:** `dealershipai.com`  
**Issue:** Domain linked to another Vercel account  
**Solution:** Verify ownership via Vercel Dashboard (CLI limitation)

---

## ⚠️ CLI Limitation

**The Vercel CLI cannot retrieve verification codes** for domains linked to other accounts. You must use the **Vercel Dashboard** to get the verification TXT record.

---

## ✅ Solution: Use Vercel Dashboard

### Step 1: Get Verification Code

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
   ```

2. **Click "Add Domain"**

3. **Enter:** `dealershipai.com`

4. **Vercel will display:**
   - TXT record name: `_vercel`
   - TXT record value: (unique verification code)
   - **Copy the value**

---

### Step 2: Add TXT Record to DNS

**Go to your domain registrar** and add:

```
Type: TXT
Name: _vercel
Value: [paste verification code from Vercel]
TTL: 3600
```

---

### Step 3: Verify with CLI

**After adding TXT record, wait 5-30 minutes, then:**

```bash
# Check if TXT record is live
./scripts/verify-domain-ownership.sh

# Or manually
dig TXT _vercel.dealershipai.com
```

---

### Step 4: Complete Verification

**Option A: Via Dashboard**
- Go back to Vercel Dashboard → Domains
- Click "Verify" or refresh the page
- Vercel will automatically detect the TXT record

**Option B: Via CLI (after verification)**
```bash
# Once verified in dashboard, add to project
npx vercel domains add dealershipai.com dealership-ai-dashboard
```

---

## 🔍 Verification Script

**Run the verification helper:**
```bash
./scripts/vercel-domain-verify.sh
```

This script will:
- ✅ Check if you're logged into Vercel
- ✅ Attempt to add the domain (will show error if linked to another account)
- ✅ Provide instructions for dashboard verification

---

## 📋 Quick Reference

**Vercel Dashboard:**
- https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

**Verification Scripts:**
```bash
./scripts/vercel-domain-verify.sh      # Vercel CLI helper
./scripts/verify-domain-ownership.sh    # DNS verification checker
```

**Check DNS:**
```bash
dig TXT _vercel.dealershipai.com
```

---

## 🚨 Why CLI Can't Get Verification Code

When a domain is linked to another account, Vercel CLI returns:
```
Error: Not authorized to use dealershipai.com (403)
```

The CLI doesn't have access to generate verification codes for domains in other accounts. This is a security feature - you must use the dashboard to verify ownership.

---

## ✅ After Verification

Once verified in the dashboard:

1. **Add domain to project:**
   ```bash
   npx vercel domains add dealershipai.com dealership-ai-dashboard
   ```

2. **Add subdomains:**
   ```bash
   npx vercel domains add dash.dealershipai.com dealership-ai-dashboard
   ```

3. **Deploy:**
   ```bash
   npx vercel --prod
   ```

---

**Use the Vercel Dashboard to get the verification code, then add the TXT record to DNS!** 🚀

