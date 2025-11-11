# 🔐 Domain Ownership Verification Guide

**Current Issue:** dealershipai.com is linked to another Vercel account and requires verification.

**What You Need:** Add a TXT record at `_vercel.dealershipai.com` to prove ownership.

---

## Step 1: Get Your Verification Value from Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Visit the Domain Settings page:**
   ```
   https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
   ```

2. **Click "Add Domain"**

3. **Enter:** `dealershipai.com`

4. **Vercel will show a verification screen with:**
   - The exact TXT record name: `_vercel`
   - The verification value (a long string like: `vc-domain-verify=...`)
   - Instructions to add it to your DNS

5. **Copy the verification value** - it will look like:
   ```
   vc-domain-verify=dealershipai.com,abc123def456...
   ```

### Option B: CLI Method (May not work due to permissions)

```bash
# This may fail with "access denied" but worth trying
npx vercel domains add dealershipai.com
# If it fails, it should show the TXT record value in the error message
```

---

## Step 2: Add TXT Record in Squarespace

Your domain is registered with **Squarespace Domains II LLC**.

### Squarespace DNS Instructions:

1. **Log in to Squarespace:**
   - Go to: https://account.squarespace.com/domains
   - Find `dealershipai.com` in your domain list

2. **Access DNS Settings:**
   - Click on `dealershipai.com`
   - Click "Advanced Settings"
   - Click "DNS Settings" or "Custom Records"

3. **Add TXT Record:**
   - Click "Add Record"
   - **Type:** TXT
   - **Host:** `_vercel` (just the subdomain part)
   - **Value:** Paste the verification string from Vercel (starts with `vc-domain-verify=`)
   - **TTL:** 3600 (or leave default)
   - Click "Save"

4. **Example:**
   ```
   Type: TXT
   Host: _vercel
   Value: vc-domain-verify=dealershipai.com,abc123def456ghi789...
   TTL: 3600
   ```

---

## Step 3: Wait for DNS Propagation

### Check TXT Record Propagation:

```bash
# Check if TXT record is live
dig +short TXT _vercel.dealershipai.com

# Should return something like:
# "vc-domain-verify=dealershipai.com,abc123..."

# Check from multiple DNS servers
nslookup -type=TXT _vercel.dealershipai.com 8.8.8.8
nslookup -type=TXT _vercel.dealershipai.com 1.1.1.1
```

### Propagation Time:
- **Typical:** 5-10 minutes
- **Maximum:** Up to 48 hours (but usually much faster)
- **Squarespace:** Usually propagates within 15 minutes

### Check Propagation Status Online:
```bash
# Open DNS propagation checker
open "https://dnschecker.org/#TXT/_vercel.dealershipai.com"
```

---

## Step 4: Verify in Vercel

Once the TXT record is propagated:

### Method A: Vercel Dashboard

1. Go back to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. The domain should now show "Verified" status
3. Click "Add" or "Confirm" to complete the process
4. Vercel will automatically configure SSL

### Method B: CLI Verification

```bash
# Try adding the domain again (should work now)
npx vercel domains add dealershipai.com

# If successful, you'll see:
# Success! Domain dealershipai.com added to project
```

---

## Step 5: Add Remaining Domains

Once `dealershipai.com` is verified and added:

### Add WWW Redirect:

**In Vercel Dashboard:**
1. Click "Add Domain"
2. Enter: `www.dealershipai.com`
3. Select "Redirect to another domain"
4. Enter: `dealershipai.com`
5. Check "Permanent (308)"
6. Click "Add"

**Via CLI:**
```bash
npx vercel domains add www.dealershipai.com
# Then configure redirect in Vercel dashboard
```

### Add Dashboard Subdomain:

**In Vercel Dashboard:**
1. Click "Add Domain"
2. Enter: `dash.dealershipai.com`
3. Click "Add"
4. Should verify instantly (CNAME already configured)

**Via CLI:**
```bash
npx vercel domains add dash.dealershipai.com
```

---

## Step 6: Wait for SSL Certificates

After all domains are added:

- **Vercel automatically provisions Let's Encrypt certificates**
- **Time:** 1-5 minutes per domain
- **Status:** Check in Vercel Dashboard - will show "Valid" when ready

### Monitor SSL Provisioning:

```bash
# Check certificate status
npx vercel certs ls

# Test SSL once certificates are ready
curl -I https://dealershipai.com
curl -I https://www.dealershipai.com
curl -I https://dash.dealershipai.com

# Verify certificate
openssl s_client -connect dealershipai.com:443 -servername dealershipai.com < /dev/null 2>/dev/null | openssl x509 -noout -issuer
# Should show: issuer=C = US, O = Let's Encrypt
```

---

## Step 7: Final Verification

Once all domains are configured and SSL is ready:

```bash
# Test primary domain
curl -I https://dealershipai.com
# Expected: HTTP/2 200

# Test WWW redirect
curl -I https://www.dealershipai.com
# Expected: HTTP/2 308 (redirect to dealershipai.com)

# Test dashboard subdomain
curl -I https://dash.dealershipai.com
# Expected: HTTP/2 200

# Test API health
curl https://dealershipai.com/api/health
# Expected: {"status":"healthy","services":{"database":"connected","redis":"connected"}}

# Test landing page
curl https://dealershipai.com | grep -i "title"
# Should show your page title

# Test authentication flow
curl -I https://dash.dealershipai.com/dashboard
# Should redirect to Clerk sign-in if not authenticated
```

---

## Troubleshooting

### Issue: TXT record not showing up

**Check DNS directly at Squarespace nameservers:**
```bash
dig @ns1.vercel-dns.com TXT _vercel.dealershipai.com
dig @ns2.vercel-dns.com TXT _vercel.dealershipai.com
```

**Solution:**
- Wait longer (up to 1 hour)
- Double-check the record in Squarespace DNS settings
- Ensure you used `_vercel` as the host (not `_vercel.dealershipai.com`)
- Ensure the value is wrapped in quotes if needed

### Issue: Verification fails even with TXT record

**Solution:**
- Try removing and re-adding the TXT record
- Clear your local DNS cache: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
- Try verification from a different network
- Contact Vercel support if issue persists

### Issue: SSL certificate pending for > 10 minutes

**Solution:**
1. Check DNS propagation: `dig dealershipai.com`
2. Remove and re-add domain in Vercel dashboard
3. Check Vercel status page: https://www.vercel-status.com/
4. Contact Vercel support if issue persists

### Issue: Domain shows "Invalid Configuration"

**Solution:**
- Verify nameservers are correct:
  ```bash
  dig +short NS dealershipai.com
  # Must show: ns1.vercel-dns.com, ns2.vercel-dns.com
  ```
- If nameservers are wrong, update them in Squarespace
- Wait 24-48 hours for nameserver changes to propagate

---

## Quick Reference Commands

```bash
# Check TXT record
dig +short TXT _vercel.dealershipai.com

# Check nameservers
dig +short NS dealershipai.com

# Check CNAME for subdomain
dig +short dash.dealershipai.com

# List all domains in project
npx vercel domains ls

# Check certificate status
npx vercel certs ls

# Test all endpoints
curl -I https://dealershipai.com
curl -I https://www.dealershipai.com
curl -I https://dash.dealershipai.com
curl https://dealershipai.com/api/health
```

---

## Timeline Expectations

| Step | Expected Time | Notes |
|------|---------------|-------|
| Get verification value | 1 minute | From Vercel dashboard |
| Add TXT record | 2 minutes | In Squarespace DNS |
| DNS propagation | 5-15 minutes | Usually faster |
| Verify in Vercel | 1 minute | Automatic once DNS propagates |
| Add remaining domains | 2 minutes | Quick in dashboard |
| SSL provisioning | 1-5 minutes per domain | Automatic |
| **Total** | **15-30 minutes** | From start to fully live |

---

## Current DNS Configuration

Your DNS is already configured correctly for the domains:

```bash
# Primary domain nameservers (CORRECT)
dealershipai.com → NS1.VERCEL-DNS.COM, NS2.VERCEL-DNS.COM

# Subdomain CNAME (CORRECT)
dash.dealershipai.com → cname.vercel-dns.com
```

You only need to add the TXT verification record, then you're ready to add all domains!

---

## Next Steps Summary

1. ✅ **Get verification value** - Visit Vercel dashboard and click "Add Domain"
2. ⏳ **Add TXT record** - In Squarespace DNS: `_vercel` → `vc-domain-verify=...`
3. ⏳ **Wait 5-15 minutes** - For DNS propagation
4. ⏳ **Verify in Vercel** - Dashboard will show "Verified"
5. ⏳ **Add all 3 domains** - dealershipai.com, www, and dash
6. ⏳ **Wait for SSL** - 1-5 minutes per domain
7. ✅ **Test everything** - All URLs should work with HTTPS

**Total Time: ~20 minutes from start to 100% live!**

---

## Support Resources

- **Vercel Domain Docs:** https://vercel.com/docs/concepts/projects/domains
- **Vercel DNS Docs:** https://vercel.com/docs/concepts/projects/domains/dns
- **Domain Verification:** https://vercel.com/docs/concepts/projects/domains/domain-verification
- **Squarespace DNS Guide:** https://support.squarespace.com/hc/en-us/articles/360002101888
- **DNS Propagation Checker:** https://dnschecker.org/

---

## Ready to Proceed?

1. **Open Vercel Dashboard:**
   ```bash
   open "https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains"
   ```

2. **Click "Add Domain" and enter `dealershipai.com`**

3. **Copy the verification value** and follow the Squarespace instructions above

4. **Come back here to verify** using the DNS check commands

You're one TXT record away from 100% deployment! 🚀
