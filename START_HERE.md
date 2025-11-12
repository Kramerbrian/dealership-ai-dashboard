# 🚀 START HERE - Add Domains to DealershipAI

**Your application is 98% deployed!** Just add domains to reach 100%.

---

## ✅ What's Done

- ✅ Application deployed and operational
- ✅ All services connected (DB, Redis, AI, Auth)
- ✅ DNS configured (nameservers pointing to Vercel)
- ✅ Build passing with zero errors

---

## 🎯 What You Need to Do (3 Steps)

### Step 1: Get Verification Token

**The correct Vercel page is now open** (if not, click below):

🔗 **https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains**

On that page:
1. Click **"Add Domain"**
2. Type: `dealershipai.com`
3. **Copy the verification token** (looks like: `vc-domain-verify=dealershipai.com,abc123...`)

### Step 2: Add TXT Record to Squarespace

1. Go to: **https://account.squarespace.com/domains**
2. Click: **dealershipai.com** → **Advanced Settings** → **DNS Settings**
3. Click: **Add Record**
4. Fill in:
   - **Type:** TXT
   - **Host:** `_vercel`
   - **Value:** [paste the token from Step 1]
   - **TTL:** 3600
5. Click: **Save**

### Step 3: Run Automated Script

Once you've saved the TXT record, run this command:

```bash
./scripts/complete-domain-setup.sh
```

**This script handles everything else:**
- Monitors DNS propagation (waits automatically)
- Adds all 3 domains via Vercel CLI
- Guides you through WWW redirect
- Tests all endpoints
- Verifies SSL

---

## ⏱️ Timeline

- Get token: **30 seconds**
- Add TXT record: **2 minutes**
- DNS propagation: **5-15 minutes** (automated by script)
- Add domains: **1 minute** (automated by script)
- SSL: **1-5 minutes** (automatic by Vercel)
- **Total: ~20 minutes**

---

## 🔍 Check Progress Anytime

```bash
# Check if TXT record is live
./scripts/check-domain-verification.sh

# Manually add domains (after TXT record exists)
./scripts/add-all-domains.sh
```

---

## 📚 More Information

- [CORRECT_VERCEL_URLS.md](CORRECT_VERCEL_URLS.md) - All correct Vercel URLs
- [QUICK_START_DOMAINS.md](QUICK_START_DOMAINS.md) - Quick reference guide
- [DOMAIN_VERIFICATION_GUIDE.md](DOMAIN_VERIFICATION_GUIDE.md) - Detailed walkthrough
- [README_DOMAIN_SETUP.md](README_DOMAIN_SETUP.md) - Complete documentation

---

## 🎉 After Setup

Your app will be live at:
- **https://dealershipai.com** - Marketing site
- **https://dash.dealershipai.com** - Dashboard
- **https://www.dealershipai.com** - Redirects to primary domain

Test with:
```bash
curl -I https://dealershipai.com
curl -I https://dash.dealershipai.com
curl https://dealershipai.com/api/health
```

---

## 🚨 Important Notes

### Correct Vercel URL Structure
Your project is under the **`brian-kramer-dealershipai`** team:
```
https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
```

### Avoid These URLs (WRONG)
- ❌ `vercel.com/brian-kramers-projects/...`
- ❌ Any URL without `brian-kramer-dealershipai`

---

## 🎯 Ready?

1. **Open this URL:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains
2. **Follow Step 1 above** to get your verification token
3. **Add TXT record** in Squarespace
4. **Run the script:** `./scripts/complete-domain-setup.sh`

**That's it!** You'll be 100% live in ~20 minutes! 🚀
