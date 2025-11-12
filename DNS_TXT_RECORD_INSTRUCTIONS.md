# 📝 DNS TXT Record Instructions

**Domain:** `dealershipai.com`  
**Verification Code:** `vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56`

---

## 🔧 Add TXT Record

### For Different DNS Providers

#### GoDaddy
1. Log in to GoDaddy
2. Go to: **My Products** → **DNS**
3. Click: **"Add"** button
4. Select: **TXT**
5. **Name:** `_vercel`
6. **Value:** `vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56`
7. **TTL:** 1 Hour (or 3600)
8. Click: **"Save"**

#### Namecheap
1. Log in to Namecheap
2. Go to: **Domain List** → **Manage** → **Advanced DNS**
3. Click: **"Add New Record"**
4. Select: **TXT Record**
5. **Host:** `_vercel`
6. **Value:** `vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56`
7. **TTL:** Automatic
8. Click: **"Save"**

#### Cloudflare
1. Log in to Cloudflare
2. Select domain: `dealershipai.com`
3. Go to: **DNS** → **Records**
4. Click: **"Add record"**
5. **Type:** TXT
6. **Name:** `_vercel`
7. **Content:** `vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56`
8. **Proxy status:** DNS only (gray cloud)
9. Click: **"Save"**

#### Squarespace
1. Log in to Squarespace
2. Go to: **Settings** → **Domains** → **dealershipai.com**
3. Click: **"DNS Settings"**
4. Click: **"Add Record"**
5. **Type:** TXT
6. **Host:** `_vercel`
7. **Data:** `vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56`
8. Click: **"Save"**

#### Google Domains
1. Log in to Google Domains
2. Select: `dealershipai.com`
3. Go to: **DNS** → **Custom records**
4. Click: **"Add custom record"**
5. **Type:** TXT
6. **Name:** `_vercel`
7. **Data:** `vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56`
8. Click: **"Save"**

---

## 🔍 Verify Record is Added

**Check if TXT record is live:**
```bash
./scripts/verify-domain-ownership.sh
```

**Or manually:**
```bash
dig TXT _vercel.dealershipai.com
```

**Expected output:**
```
"vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56"
```

---

## ⏱️ Wait for Propagation

- **Typical:** 5-30 minutes
- **Maximum:** 48 hours

**Check propagation:**
- https://dnschecker.org/#TXT/_vercel.dealershipai.com

---

## ✅ Complete Verification

Once the TXT record is live:

1. **Go to:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. **Find:** `dealershipai.com`
3. **Click:** "Verify" button
4. **Domain will be verified** ✅

---

**Add the TXT record to your DNS provider, then verify in Vercel!** 🚀

