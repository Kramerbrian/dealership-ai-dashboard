# 📋 DNS Setup Order - Correct Sequence

**Domain:** `dealershipai.com`

---

## ✅ Step 1: Domain Verification (Do This First!)

**ONLY add the TXT record for now:**

```
Type: TXT
Name: _vercel
Value: vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56
TTL: 3600
```

**Do NOT add A records yet!** Wait until verification is complete.

---

## ✅ Step 2: After Verification (Then Add A Record)

**Once verified in Vercel dashboard, then add:**

### Option A: A Record (Recommended for root domain)
```
Type: A
Name: @ (or blank)
Value: 76.76.21.21
TTL: 3600
```

**Note:** Vercel's IP is `76.76.21.21`, NOT `215.150.1.1`

### Option B: CNAME (If your registrar supports CNAME on root)
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

---

## ❌ Do NOT Use: 215.150.1.1

**That IP is NOT a Vercel IP.** Use Vercel's official IP: `76.76.21.21`

---

## 📋 Complete DNS Setup (After Verification)

### Root Domain (dealershipai.com)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

### WWW Subdomain
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Dashboard Subdomain (dash.dealershipai.com)
```
Type: CNAME
Name: dash
Value: cname.vercel-dns.com
TTL: 3600
```

---

## 🎯 Current Action

**Right now, ONLY add the TXT record:**
- Type: TXT
- Name: _vercel
- Value: vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56

**After verification completes, then add the A record with Vercel's IP: `76.76.21.21`**

---

**Don't add A records yet - verify the domain first with the TXT record!** 🚀

