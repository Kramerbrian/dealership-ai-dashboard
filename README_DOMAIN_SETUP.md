# 🚀 DealershipAI - Domain Setup Instructions

**Status:** Application 100% deployed and operational ✅  
**Current URL:** https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app  
**Health Status:** All services healthy ✅

---

## 📋 What's Already Done

✅ Application deployed to Vercel production  
✅ All infrastructure connected (DB, Redis, AI, Auth)  
✅ DNS nameservers configured (pointing to Vercel)  
✅ Subdomain CNAME configured (dash.dealershipai.com)  
✅ SSR guards and CSP headers optimized  
✅ Build passing with zero errors  
✅ All API endpoints operational  

---

## 🎯 What's Left: Add Custom Domains

The Vercel CLI cannot add domains due to ownership verification requirements.  
**You must use the Vercel Dashboard** to complete this step.

**Time Required:** 15-25 minutes total

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Verification Token

**Vercel Dashboard is now open** at:
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
```

In the dashboard:
1. Click **"Add Domain"**
2. Enter: `dealershipai.com`
3. Vercel will show: **"Domain verification required"**
4. Copy the verification token (starts with `vc-domain-verify=`)

---

### Step 2: Add TXT Record in Squarespace

1. Go to: https://account.squarespace.com/domains
2. Click: **dealershipai.com** → **Advanced Settings** → **DNS Settings**
3. Add TXT Record:
   - **Type:** TXT
   - **Host:** `_vercel`
   - **Value:** [paste verification token from Step 1]
   - **TTL:** 3600
4. Save

---

### Step 3: Run Automated Setup Script

Once the TXT record is added, run:

```bash
./scripts/complete-domain-setup.sh
```

**This script handles everything:**
- Monitors DNS propagation (checks every 30 seconds)
- Adds all 3 domains via Vercel CLI
- Guides you through WWW redirect configuration
- Tests all endpoints
- Verifies SSL certificates

---

## 🛠️ Available Scripts

All automation scripts are in the `scripts/` directory:

### Main Setup Script
```bash
./scripts/complete-domain-setup.sh
```
Interactive guided setup that handles the entire process

### Verification Checker
```bash
./scripts/check-domain-verification.sh
```
Check TXT record propagation status

### Quick Domain Addition
```bash
./scripts/add-all-domains.sh
```
Add all 3 domains at once (requires TXT record to exist)

---

## 📖 Documentation

Comprehensive guides have been created:

- **[QUICK_START_DOMAINS.md](QUICK_START_DOMAINS.md)** - Fast 3-step guide
- **[DOMAIN_VERIFICATION_GUIDE.md](DOMAIN_VERIFICATION_GUIDE.md)** - Detailed walkthrough
- **[FINAL_DEPLOYMENT_STATUS.md](FINAL_DEPLOYMENT_STATUS.md)** - Complete status
- **[ADD_DOMAINS_GUIDE.md](ADD_DOMAINS_GUIDE.md)** - Alternative methods

---

## ⏱️ Timeline

| Step | Duration | Status |
|------|----------|--------|
| Get verification token | 30 sec | ⏳ Ready |
| Add TXT record to Squarespace | 2 min | ⏳ Waiting |
| DNS propagation | 5-15 min | ⏳ Automated |
| Add domains via CLI | 1 min | ⏳ Automated |
| SSL certificate provisioning | 1-5 min | ⏳ Automatic |
| **Total** | **15-25 min** | **→ 100%** |

---

## ✅ After Setup - Test Commands

Once domains are added and SSL is provisioned:

```bash
# Test primary domain
curl -I https://dealershipai.com
# Expected: HTTP/2 200

# Test WWW redirect
curl -I https://www.dealershipai.com
# Expected: HTTP/2 308 (redirect)

# Test dashboard subdomain
curl -I https://dash.dealershipai.com
# Expected: HTTP/2 200

# Test API health
curl https://dealershipai.com/api/health
# Expected: {"status":"healthy",...}

# View all domains
npx vercel domains ls

# Check SSL certificates
npx vercel certs ls
```

---

## 🔄 WWW Redirect Configuration

After domains are added, configure the WWW redirect:

1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. Find: `www.dealershipai.com`
3. Click: **Edit** or gear icon
4. Select: **"Redirect to another domain"**
5. Enter: `dealershipai.com`
6. Check: **"Permanent (308)"**
7. Save

---

## 🎉 Final Domains

After completion, your app will be live at:

- **Marketing Site:** https://dealershipai.com
- **Dashboard:** https://dash.dealershipai.com
- **WWW Redirect:** https://www.dealershipai.com → https://dealershipai.com

---

## 📞 Support Resources

- **Vercel Domain Docs:** https://vercel.com/docs/concepts/projects/domains
- **Domain Verification:** https://vercel.com/docs/concepts/projects/domains/domain-verification
- **DNS Propagation Checker:** https://dnschecker.org/
- **Squarespace DNS Guide:** https://support.squarespace.com/hc/en-us/articles/360002101888

---

## 🚨 Troubleshooting

### TXT Record Not Propagating?

```bash
# Check directly at nameservers
dig @ns1.vercel-dns.com TXT _vercel.dealershipai.com
dig @ns2.vercel-dns.com TXT _vercel.dealershipai.com

# Clear local DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Domain Addition Fails?

- Verify TXT record exists: `dig +short TXT _vercel.dealershipai.com`
- Wait longer for propagation (up to 1 hour)
- Try adding via dashboard instead of CLI

### SSL Certificate Pending?

- Wait 5-10 minutes for auto-provisioning
- Check Vercel status: https://www.vercel-status.com/
- Remove and re-add domain if needed

---

## 🎯 Current Status

**Application:**
- ✅ Deployed and operational
- ✅ HTTP 200 on root page
- ✅ All services healthy
- ✅ All API endpoints working

**DNS:**
- ✅ Nameservers pointing to Vercel
- ✅ Subdomain CNAME configured
- ⏳ TXT verification record needed

**Domains:**
- ⏳ dealershipai.com (pending verification)
- ⏳ www.dealershipai.com (pending)
- ⏳ dash.dealershipai.com (ready)

**Progress: 98% → 100%** (just add TXT record and run script!)

---

## 🚀 Ready to Complete?

**Your next action:**

1. In the Vercel Dashboard (already open):
   - Click "Add Domain"
   - Enter `dealershipai.com`
   - Copy verification token

2. In Squarespace DNS:
   - Add TXT record with the token

3. Run the setup script:
   ```bash
   ./scripts/complete-domain-setup.sh
   ```

**That's it!** The script handles the rest. You'll be 100% live in ~20 minutes!

---

**Questions?** Read [QUICK_START_DOMAINS.md](QUICK_START_DOMAINS.md) for the streamlined guide.
