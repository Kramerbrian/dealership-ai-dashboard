# ✅ Domain Verification Code Received

**Domain:** `dealershipai.com`  
**Verification Code:** `vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56`

---

## 📋 Add TXT Record to DNS

### Step 1: Go to Your Domain Registrar

**Go to your DNS provider** (GoDaddy, Namecheap, Cloudflare, Squarespace, etc.)

### Step 2: Add TXT Record

**Add this DNS record:**

```
Type: TXT
Name: _vercel
Value: vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56
TTL: 3600 (or Auto)
```

**Important Notes:**
- Some registrars require the full subdomain: `_vercel.dealershipai.com`
- The value should be exactly as shown above (no extra spaces)
- Save the record

### Step 3: Wait for DNS Propagation

- **Typical:** 5-30 minutes
- **Maximum:** 48 hours

---

## 🔍 Verify TXT Record is Live

**Run the verification script:**
```bash
./scripts/verify-domain-ownership.sh
```

**Or check manually:**
```bash
dig TXT _vercel.dealershipai.com
```

**Expected output should include:**
```
"vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56"
```

**Online DNS checker:**
- https://dnschecker.org/#TXT/_vercel.dealershipai.com

---

## ✅ Complete Verification in Vercel

1. **Go to:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. **Find:** `dealershipai.com` in the list
3. **Click:** "Verify" button (or refresh the page)
4. **Vercel will automatically detect** the TXT record
5. **Domain will be verified** ✅

---

## 📝 Quick Reference

**TXT Record:**
- Name: `_vercel`
- Value: `vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56`

**Dashboard:**
- https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains

**Verification:**
```bash
./scripts/verify-domain-ownership.sh
```

---

**Add the TXT record to DNS, wait for propagation, then verify in Vercel dashboard!** 🚀

