# 🔧 Fix: Domain Verification for dealershipai.com

**Issue:** `dealershipai.com` is linked to another Vercel account. Need to verify ownership with TXT record.

---

## ✅ Solution: Add TXT Record for Verification

### Step 1: Get Verification Code from Vercel

When you try to add the domain in Vercel Dashboard, it will provide a verification code.

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Domains → Add Domain

**Enter:** `dealershipai.com`

**Vercel will show:**
- A TXT record name: `_vercel`
- A TXT record value: (unique verification code)

---

### Step 2: Add TXT Record to DNS

**Go to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)

**Add this DNS record:**

```
Type: TXT
Name: _vercel
Value: [The verification code from Vercel]
TTL: 3600 (or Auto)
```

**Important:** 
- The name should be exactly `_vercel` (not `_vercel.dealershipai.com`)
- Some registrars require the full subdomain: `_vercel.dealershipai.com`
- Check your registrar's documentation

---

### Step 3: Wait for DNS Propagation

- **Typical time:** 5-30 minutes
- **Maximum:** 48 hours
- **Check status:** Vercel dashboard will show verification status

**Verify DNS record is live:**
```bash
# Check if TXT record exists
dig TXT _vercel.dealershipai.com

# Or use online tool
# https://dnschecker.org/#TXT/_vercel.dealershipai.com
```

---

### Step 4: Complete Verification in Vercel

Once the TXT record is propagated:

1. **Go back to Vercel Dashboard**
2. **Click "Verify"** or refresh the domain page
3. **Vercel will automatically detect** the TXT record
4. **Domain will be verified** and added to your account

---

## 🔍 Alternative: Check Current Domain Status

### Check if Domain is in Another Account

1. **Go to:** https://vercel.com/dashboard
2. **Check all teams/accounts** you have access to
3. **Look for:** `dealershipai.com` in any domain list
4. **If found:** You may need to:
   - Remove it from the other account first
   - Or transfer it to your current account

---

## 📋 Quick Commands

### Check DNS Record
```bash
# Check if TXT record exists
dig TXT _vercel.dealershipai.com

# Or use nslookup
nslookup -type=TXT _vercel.dealershipai.com
```

### Verify Domain in Vercel
```bash
# After adding TXT record, check status
npx vercel domains inspect dealershipai.com
```

---

## 🚨 Common Issues

### Issue 1: TXT Record Not Found
**Solution:**
- Wait longer for DNS propagation (up to 48 hours)
- Double-check the record name and value
- Some registrars need the full subdomain format

### Issue 2: Domain Still Shows as "Linked to Another Account"
**Solution:**
- Remove domain from the other Vercel account first
- Or contact Vercel support to transfer ownership

### Issue 3: Verification Code Expired
**Solution:**
- Remove the old TXT record
- Request a new verification code from Vercel
- Add the new TXT record

---

## ✅ After Verification

Once verified, you can:

1. **Add domain to project:**
   ```bash
   npx vercel domains add dealershipai.com
   ```

2. **Add subdomains:**
   ```bash
   npx vercel domains add dash.dealershipai.com
   ```

3. **Configure DNS records** (if not using Vercel nameservers)

---

## 📝 Next Steps

1. ✅ Get verification code from Vercel
2. ✅ Add TXT record to DNS
3. ✅ Wait for propagation
4. ✅ Verify in Vercel dashboard
5. ✅ Add domain to project
6. ✅ Deploy!

---

**Need help?** Check Vercel docs: https://vercel.com/docs/concepts/projects/domains/add-a-domain

